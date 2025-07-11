import {
  Button,
  Input,
  Modal,
  Section,
  Select,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { FiTrash2 } from "react-icons/fi";
import { MdUpload } from "react-icons/md";
import { useEffect, useState, useCallback, useRef } from "react";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import type { UserCompanies } from "../@types/user";
import type { TaskPoint } from "../@types/task";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";
import { getCompaniesByClient } from "../api/company/get-companies-byClient";
import {
  setIsLoadingCompanies,
  setUserCompanies,
} from "../store/slices/entities/user_companies/user_companiesSlice";
import { getTasksByCompany } from "../api/task/get-tasksByCompany";
import {
  setIsLoadingTasksBoard,
  setTasksBoardByCompany,
} from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import AdminTasks from "../components/AdminTasks";

import { getWorkGroupsSelect } from "../api/work_group/get-work_groupsSelect";
import { createTask } from "../api/task/create-task";
import type { CreateTaskPayload } from "../@types/task";
import { getSelectedCompany, setSelectedCompany } from "../utils/selectedCompany";

import ImageUpload from "../components/ImageUpload";


export interface WorkGroup {
  id: number;
  title: string;
  description: string;
  company_id: number;
}

const adminTaskboardPage = () => {
  const dispatch = useDispatch();
  const telegramData = getTelegramData();

  const [selectedValue, setSelectedValue] = useState<string | number>(() => {
    return getSelectedCompany() || "";
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSelectedCompanyId, setModalSelectedCompanyId] = useState<
    string | number
  >("");
  const [modalSelectedWorkGroupId, setModalSelectedWorkGroupId] = useState<
    string | number
  >("");
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [isLoadingWorkGroups, setIsLoadingWorkGroups] =
    useState<boolean>(false);

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  
  // Image upload (basic only)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([]);
  const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);
  const [isImageFullScreen, setIsImageFullScreen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  console.log(isImageFullScreen); //shit fix
  console.log(isKeyboardOpen); //shit fix

  // Глобальное отслеживание клавиатуры на уровне страницы
  useEffect(() => {
    const setViewportHeight = () => {
      // Устанавливаем CSS переменную с реальной высотой viewport
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
        
        const isKeyboard = keyboardHeight > 150;
        setIsKeyboardOpen(isKeyboard);
        
        if (isKeyboard) {
          document.body.classList.add('keyboard-open');
          document.documentElement.style.setProperty('--safe-area-inset-bottom', `${keyboardHeight}px`);
        } else {
          document.body.classList.remove('keyboard-open');
          document.documentElement.style.setProperty('--safe-area-inset-bottom', '0px');
        }
      }
    };

    setViewportHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight);
      window.visualViewport.addEventListener('scroll', setViewportHeight);
    } else {
      window.addEventListener('resize', setViewportHeight);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setViewportHeight);
        window.visualViewport.removeEventListener('scroll', setViewportHeight);
      } else {
        window.removeEventListener('resize', setViewportHeight);
      }
    };
  }, []);

  const { data: dataCompanies, isLoading: isLoadingCompanies } = useSelector(
    (state: RootState) => state.entities.user_companies
  );



  const fetchCompanies = useCallback(async () => {
    dispatch(setIsLoadingCompanies(true));
    try {
      const res = await getCompaniesByClient();
      if (res.data) {
        dispatch(setUserCompanies(res.data));
        
        const savedCompanyId = getSelectedCompany();
        const validSavedCompany = savedCompanyId && res.data.find((c: UserCompanies) => 
          String(c.company_id) === savedCompanyId
        );
        
        if (validSavedCompany) {
          setSelectedValue(savedCompanyId);
          setModalSelectedCompanyId(savedCompanyId);
        } else if (res.data.length > 0) {
          const firstCompanyId = res.data[0].company_id || "";
          setSelectedValue(firstCompanyId);
          setModalSelectedCompanyId(firstCompanyId);
          setSelectedCompany(firstCompanyId);
        }
      }
    } catch (e: any) {
      console.error("Ошибка загрузки компаний:", e);
    } finally {
      dispatch(setIsLoadingCompanies(false));
    }
  }, []);

  const fetchWorkGroups = useCallback(async (companyId: string | number) => {
    if (!companyId) {
      setWorkGroups([]);
      setModalSelectedWorkGroupId("");
      return;
    }

    setIsLoadingWorkGroups(true);
    try {
      const res = await getWorkGroupsSelect(String(companyId));
      if (res.data) {
        setWorkGroups(res.data);
        if (res.data.length > 0) {
          setModalSelectedWorkGroupId(res.data[0].id || "");
        } else {
          setModalSelectedWorkGroupId("");
        }
      }
    } catch (e: any) {
      console.error(
        `Ошибка загрузки рабочих групп для компании ${companyId}:`,
        e
      );
      setWorkGroups([]);
      setModalSelectedWorkGroupId("");
    } finally {
      setIsLoadingWorkGroups(false);
    }
  }, []);

  const fetchTasks = useCallback(async (companyId: string | number) => {
    if (!companyId) {
      dispatch(setTasksBoardByCompany([]));
      return;
    }
    dispatch(setIsLoadingTasksBoard(true));
    try {
      const res = await getTasksByCompany(String(companyId));
      if (res.data) {
        dispatch(setTasksBoardByCompany(res.data));
      }
    } catch (e: any) {
      console.error("Ошибка загрузки задач:", e);
    } finally {
      dispatch(setIsLoadingTasksBoard(false));
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, []);



  useEffect(() => {
    if (selectedValue !== "") {
      fetchTasks(selectedValue);
    } else {
      dispatch(setTasksBoardByCompany([]));
    }
  }, [selectedValue]);



  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (modalSelectedCompanyId) {
      fetchWorkGroups(modalSelectedCompanyId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUploadedImage(null);
    setTaskPoints([]);
    setActivePoint(null);
    setTaskName("");
    setTaskDescription("");
    setModalSelectedCompanyId("");
    setModalSelectedWorkGroupId("");
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleModalCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCompanyId = event.target.value;
    setModalSelectedCompanyId(selectedCompanyId);
    fetchWorkGroups(selectedCompanyId);
  };

  const handleModalWorkGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setModalSelectedWorkGroupId(event.target.value);
  };

  const handleSave = async () => {
    if (!taskName || !taskDescription) {
      alert("Заполните все обязательные поля.");
      return;
    }

    if (!modalSelectedCompanyId || !modalSelectedWorkGroupId) {
      alert("Выберите компанию и рабочую группу.");
      return;
    }

    if (taskPoints.length > 0) {
      const invalidPoints = taskPoints.filter(point => !point.title.trim());
      if (invalidPoints.length > 0) {
        alert("Все точки задачи должны иметь название.");
        return;
      }
    }

    const formattedTaskPoints = taskPoints.map((point) => ({
      title: point.title || "",
      coordinates: [point.x, point.y] as const,
      qrcode: point.qrcode || "",
      description: point.description || "",
      voice_message: point.voice_message || null,
      thumbnails: point.thumbnails || "",
      mark_icon: point.mark_icon || "",
      points: point.points || [],
    }));

    const payload: CreateTaskPayload = {
      title: taskName,
      description: taskDescription,
      company_id: Number(modalSelectedCompanyId),
      work_group_id: Number(modalSelectedWorkGroupId),
      image: uploadedImage || "",
      location: [0, 0],
      type: "standard",
      task_points: formattedTaskPoints,
    };

    console.log("Создаем задачу с данными:");
    console.log(payload.title);
    console.log(payload.description);
    console.log(payload.company_id);
    console.log(payload.work_group_id);
    console.log(payload.image);
    console.log(payload.location);
    console.log(payload.type);
    console.log(payload.task_points);

    try {
      const res = await createTask(payload);
      if (res.data) {
        alert("Задача успешно создана!");
        handleCloseModal();
        fetchTasks(selectedValue);
      }
    } catch (error) {
      console.error("Ошибка создания задачи:", error);
      alert("Ошибка при создании задачи");
    }
  };





  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    setSelectedCompany(newValue);
  };

  return (
    <>
      <style>{`
        :root {
          --vh: 1vh;
          --keyboard-height: 0px;
          --safe-area-inset-bottom: 0px;
        }
        
        body.keyboard-open {
          height: calc(var(--vh, 1vh) * 100);
          overflow: hidden;
        }
        
        /* Стили для Telegram UI Modal - контролируем высоту через props */
        [data-telegram-modal] {
          transition: height 0.3s ease-in-out !important;
        }
        
        /* Контейнер модала остается в исходной позиции */
        .top-shadow-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        /* Делаем контент модала скроллируемым */
        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
      <div className="flex w-full justify-center px-5">
        <Button className="mb-4 w-full" onClick={handleOpenModal}>
          Добавить задачу
        </Button>
      </div>
      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Компания
        </Section.Header>
        <div style={{ height: "84px" }}>
          {isLoadingCompanies ? (
            <div
              className="flex justify-center items-center h-full"
              style={{ padding: "10px" }}
            >
              <Loading size={30} color={"#2a90ff"} />
              <span
                style={{ marginLeft: "10px", color: "var(--tgui--text_color)" }}
              >
                Загрузка компаний...
              </span>
            </div>
          ) : (
            <Select
              status="focused"
              value={selectedValue}
              onChange={handleSelectChange}
              disabled={dataCompanies?.length === 0}
              style={{ width: "100%" }}
            >
              {dataCompanies?.map((company: UserCompanies) => (
                <option
                  key={company.company_id}
                  value={company.company_id || ""}
                >
                  {company.company_name}
                </option>
              ))}
              {dataCompanies?.length === 0 && (
                <option disabled>Нет доступных компаний</option>
              )}
            </Select>
          )}
        </div>
      </Section>
      <AdminTasks />
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        dismissible={false}
        modal={true}
        preventScrollRestoration={true}
        style={{
          height: isKeyboardOpen ? `calc(100vh - var(--keyboard-height, 0px))` : '100vh',
          maxHeight: isKeyboardOpen ? `calc(100vh - var(--keyboard-height, 0px))` : '100vh',
          transition: 'height 0.3s ease-in-out, max-height 0.3s ease-in-out'
        }}
      >
       
        <div
          style={{
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
          }}
          className="py-4 top-shadow-container"
        >

          <h3 className="text-center">Добавить задачу</h3>

          <div className="modal-content">
            {/* Image Upload Section */}
            <div className="rounded-md mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              {uploadedImage ? (
                <div className="relative flex flex-col items-center justify-center py-4">
                  <ImageUpload 
                    image={uploadedImage} 
                    editMode={true}
                    taskPoints={taskPoints}
                    setTaskPoints={setTaskPoints}
                    activePoint={activePoint}
                    setActivePoint={setActivePoint}
                    onFullScreenChange={setIsImageFullScreen}
                  />
                  <Button
                    mode="bezeled"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 right-2 text-xs px-6 py-1 bg-white shadow-md"
                  >
                    Изменить изображение
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    minHeight: "150px",
                    backgroundColor: telegramData?.colorScheme === "dark" ? "#2a2a2a" : "#f8fafc",
                    borderColor: telegramData?.colorScheme === "dark" ? "#4a5568" : "#3b82f6",
                    marginLeft: "1.5rem",
                    marginRight: "1.5rem",
                  }}
                >
                  <MdUpload 
                    size={48} 
                    className="mb-3"
                    style={{ color: telegramData?.themeParams.button_color || "#3b82f6" }}
                  />
                  <p 
                    className="text-sm font-medium text-center"
                    style={{ color: telegramData?.themeParams.text_color || "#374151" }}
                  >
                    Загрузите изображение задачи
                  </p>
                  <p 
                    className="text-xs text-center mt-1"
                    style={{ color: telegramData?.themeParams.hint_color || "#9ca3af" }}
                  >
                    JPG, PNG до 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Input
                  value={taskName}
                  status="focused"
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Название задачи"
                  className="w-full"
                />
              </div>

              <div>
                <Textarea
                  value={taskDescription}
                  status="focused"
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Описание задачи"
                  className="w-full"
                />
              </div>

              {/* Task Points List */}
              {taskPoints.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-2">
                    {taskPoints.map((point) => (
                      <div key={point.id} className="space-y-2">
                        <hr key={point.id} className="border-gray-200" />
                        <div className="px-4 pt-2 flex items-center justify-left">
                          <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                            {point.id}
                          </span>
                          <Input
                            value={point.title}
                            status="focused"
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setTaskPoints(prev => prev.map(p => 
                                p.id === point.id ? { ...p, title: newTitle } : p
                              ));
                            }}
                            placeholder="Название точки"
                            style={{flexGrow: 1, marginRight: "10px"}}
                          />
                          <Button
                            mode="plain"
                            size="s"
                            onClick={() => {
                              setTaskPoints(prev => prev.filter(p => p.id !== point.id));
                              if (activePoint?.id === point.id) {
                                setActivePoint(null);
                              }
                            }}
                            className="text-red-500 pr-2"
                          >
                            <FiTrash2 color="red" size={20} />
                          </Button>
                        </div>
                      
                        <Textarea
                          value={point.description || ""}
                          status="focused"
                          onChange={(e) => {
                            const newDescription = e.target.value;
                            setTaskPoints(prev => prev.map(p => 
                              p.id === point.id ? { ...p, description: newDescription } : p
                            ));
                          }}
                          placeholder="Описание точки"
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Select
                  value={String(modalSelectedCompanyId || "")}
                  onChange={handleModalCompanyChange}
                  status="focused"
                  className="w-full"
                >
                  <option value="">Выберите компанию</option>
                  {dataCompanies?.map((company: UserCompanies) => (
                    <option key={company.company_id} value={company.company_id || ""}>
                      {company.company_name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  value={String(modalSelectedWorkGroupId)}
                  onChange={handleModalWorkGroupChange}
                  className="w-full"
                  status="focused"
                  disabled={!modalSelectedCompanyId || isLoadingWorkGroups}
                >
                  <option value="">Выберите рабочую группу</option>
                  {workGroups.map((group: WorkGroup) => (
                    <option key={group.id} value={group.id}>
                      {group.title}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-4 px-4">
            <Button stretched mode="bezeled" onClick={handleCloseModal} className="mx-2">
              Отмена
            </Button>
            <Button stretched mode="filled" onClick={handleSave} className="mx-2">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

    </>
  );
};

export default adminTaskboardPage;
