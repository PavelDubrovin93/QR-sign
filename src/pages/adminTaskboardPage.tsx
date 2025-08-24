import {
  Button,
  Input,
  Modal,
  Section,
  Select,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { FiTrash2, FiLock, FiUnlock } from "react-icons/fi";
import { MdUpload } from "react-icons/md";
import { useEffect, useState, useCallback, useRef } from "react";
import type { TaskPoint } from "../@types/task";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";
import {
  setIsLoadingTasksBoard,
  setTasksBoardByCompany,
} from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import AdminTasks from "../components/AdminTasks";
import { createTask } from "../api/task/create-task";
import { getTasksByCompany } from "../api/task/get-tasksByCompany";
import type { CreateTaskPayload } from "../@types/task";
import type { UserCompanies } from "../@types/user";
import { getSelectedCompany, setSelectedCompany } from "../utils/selectedCompany";
import ImageUpload from "../components/ImageUpload";
import { getUserRole } from "../api/user/get-user-role";
import { Roles } from "../@types/role";

// Импорт новых хуков
import { 
  useTelegram, 
  useCompanyData, 
  useWorkGroups, 
  useApiWithRetry 
} from "../utils/hooks";

export interface WorkGroup {
  id: number;
  title: string;
  description: string;
  company_id: number;
}

const adminTaskboardPage = () => {
  const dispatch = useDispatch();
  
  // Используем новые хуки
  const { telegramData } = useTelegram();
  const { fetchCompanies } = useCompanyData();
  const { 
    workGroups, 
    isLoadingWorkGroups, 
    fetchWorkGroups,
    setWorkGroups 
  } = useWorkGroups();
  const { retryApiCall } = useApiWithRetry();

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

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([]);
  const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);
  const [isImageFullScreen, setIsImageFullScreen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  console.log(isImageFullScreen); //shit fix
  console.log(isKeyboardOpen); //shit fix

  useEffect(() => {
    const setViewportHeight = () => {
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

  // Получение роли пользователя
  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        if (selectedValue) {
          const roleResponse = await getUserRole(Number(selectedValue));
          setCurrentUserRole(roleResponse);
          console.log('👤 Роль пользователя на странице задач:', roleResponse);
        }
      } catch (error) {
        console.error('Error loading current user role:', error);
        setCurrentUserRole('');
      }
    };

    if (selectedValue) {
      getCurrentUserRole();
    }
  }, [selectedValue]);

  const { data: dataCompanies, isLoading: isLoadingCompanies } = useSelector(
    (state: RootState) => state.entities.user_companies
  );

  const currentUser = useSelector((state: RootState) => state.entities.user);
  console.log(currentUser);


  const handleFetchCompanies = useCallback(async () => {
    await fetchCompanies(setSelectedValue, setModalSelectedCompanyId);
  }, [fetchCompanies]);

  const handleFetchWorkGroups = useCallback(async (companyId: string | number) => {
    await fetchWorkGroups(companyId, setModalSelectedWorkGroupId);
  }, [fetchWorkGroups]);

  const fetchTasks = useCallback(async (companyId: string | number) => {
    if (!companyId) {
      dispatch(setTasksBoardByCompany([]));
      return;
    }
    dispatch(setIsLoadingTasksBoard(true));
    try {
      const res = await retryApiCall(() => getTasksByCompany(String(companyId)));
      if (res.data) {
        dispatch(setTasksBoardByCompany(res.data));
      }
    } catch (e: any) {
      console.error("Ошибка загрузки задач:", e);
      
      const isConnectionError = 
        e?.response?.data?.message?.includes('ConnectionDoesNotExistError') ||
        e?.response?.data?.message?.includes('connection was closed') ||
        e?.response?.data?.error === 'Internal Server Error';
      
      if (isConnectionError) {
        console.log("Не удалось загрузить задачи после нескольких попыток. Проблемы с подключением к серверу.");
      }
    } finally {
      dispatch(setIsLoadingTasksBoard(false));
    }
  }, [retryApiCall]);

  useEffect(() => {
    handleFetchCompanies();
  }, [handleFetchCompanies]);



  useEffect(() => {
    if (selectedValue !== "") {
      fetchTasks(selectedValue);
      handleFetchWorkGroups(selectedValue);
    } else {
      dispatch(setTasksBoardByCompany([]));
      setWorkGroups([]);
    }
  }, [selectedValue, fetchTasks, handleFetchWorkGroups]);



  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (modalSelectedCompanyId) {
      handleFetchWorkGroups(modalSelectedCompanyId);
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
    setIsUploadingImage(false);
  };


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      
      // Загружаем файл напрямую без сжатия
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setIsUploadingImage(false);
      };
      
      reader.onerror = () => {
        console.error('Ошибка при загрузке файла');
        setUploadedImage(null);
        setIsUploadingImage(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleModalCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCompanyId = event.target.value;
    setModalSelectedCompanyId(selectedCompanyId);
    handleFetchWorkGroups(selectedCompanyId);
  };

  const handleModalWorkGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setModalSelectedWorkGroupId(event.target.value);
  };



  const handleSave = async () => {
    if (isSaving) return; // Предотвращаем повторную отправку
    
    // if (!taskName || !taskDescription) {
    //   alert("Заполните все обязательные поля.");
    //   return;
    // }

    if (!modalSelectedCompanyId || !modalSelectedWorkGroupId) {
      console.log("Выберите компанию и рабочую группу.");
      return;
    }

    if (taskPoints.length > 0) {
      const invalidPoints = taskPoints.filter(point => !point.title.trim());
      if (invalidPoints.length > 0) {
        console.log("Все точки задачи должны иметь название.");
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

    setIsSaving(true);
    
    try {
      const res = await retryApiCall(() => createTask(payload));
      if (res.data) {
        console.log("Задача успешно создана!");
        handleCloseModal();
        fetchTasks(selectedValue);
      }
    } catch (error: any) {
      console.error("Ошибка создания задачи:", error);
      
      // Показываем более информативное сообщение об ошибке
      const isConnectionError = 
        error?.response?.data?.message?.includes('ConnectionDoesNotExistError') ||
        error?.response?.data?.message?.includes('connection was closed') ||
        error?.response?.data?.error === 'Internal Server Error';
      
      if (isConnectionError) {
        console.log("Не удалось создать задачу после нескольких попыток. Проблемы с подключением к серверу. Попробуйте еще раз.");
      } else {
        console.error("Ошибка при создании задачи");
      }
    } finally {
      setIsSaving(false);
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
        
        /* Анимация спиннера для кнопки загрузки */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {currentUserRole === Roles.OWNER && (
        <div className="flex w-full justify-center px-5">
          <Button className="mb-4 w-full" onClick={handleOpenModal}>
            Добавить задачу
          </Button>
        </div>
      )}
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
      <div style={{ paddingBottom: "80px" }}>
        <AdminTasks workGroups={workGroups} />
      </div>
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
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  style={{
                    minHeight: "150px",
                    backgroundColor: telegramData?.colorScheme === "dark" ? "#2a2a2a" : "#f8fafc",
                    borderColor: telegramData?.colorScheme === "dark" ? "#4a5568" : "#3b82f6",
                    marginLeft: "1.5rem",
                    marginRight: "1.5rem",
                    opacity: isUploadingImage ? 0.7 : 1,
                    cursor: isUploadingImage ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUploadingImage ? (
                    <>
                      <div 
                        className="animate-spin rounded-full h-12 w-12 border-b-2 mb-3"
                        style={{ borderColor: telegramData?.themeParams.button_color || "#3b82f6" }}
                      ></div>
                                             <p 
                         className="text-sm font-medium text-center"
                         style={{ color: telegramData?.themeParams.text_color || "#374151" }}
                       >
                         Загрузка изображения...
                       </p>
                       <p 
                         className="text-xs text-center mt-1"
                         style={{ color: telegramData?.themeParams.hint_color || "#9ca3af" }}
                       >
                         Пожалуйста, подождите
                       </p>
                    </>
                  ) : (
                    <>
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
                        JPG, PNG любого размера
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">

            <div>
                <Select
                  value={String(modalSelectedCompanyId || "")}
                  onChange={handleModalCompanyChange}
                  status="focused"
                  className="w-full"
                  header="Компания"
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
                  header="Рабочая группа"
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

              {/* <div>
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
              </div> */}

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
                            style={{
                              flexGrow: 1, 
                              marginRight: "10px",
                              opacity: point.locked ? 0.6 : 1
                            }}
                            disabled={point.locked}
                          />
                          <Button
                            mode="plain"
                            size="s"
                            onClick={() => {
                              setTaskPoints(prev => prev.map(p => 
                                p.id === point.id ? { ...p, locked: !p.locked } : p
                              ));
                            }}
                            className="pr-2"
                            style={{
                              color: point.locked ? (telegramData?.themeParams.button_color || "#3B82F6") : "#6B7280"
                            }}
                          >
                            {point.locked ? (
                              <FiLock size={20} />
                            ) : (
                              <FiUnlock size={20} />
                            )}
                          </Button>
                          <Button
                            mode="plain"
                            size="s"
                            onClick={() => {
                              if (point.locked) return;
                              setTaskPoints(prev => prev.filter(p => p.id !== point.id));
                              if (activePoint?.id === point.id) {
                                setActivePoint(null);
                              }
                            }}
                            className="text-red-500 pr-2"
                            style={{
                              opacity: point.locked ? 0.4 : 1,
                              cursor: point.locked ? 'not-allowed' : 'pointer'
                            }}
                            disabled={point.locked}
                          >
                            <FiTrash2 color={point.locked ? "#9CA3AF" : "red"} size={20} />
                          </Button>
                        </div>
                        
                        <div
                          style={{
                            opacity: point.locked ? 0.6 : 1
                          }}
                        >
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
                            disabled={point.locked}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center mt-4 px-4">
            <Button stretched mode="bezeled" onClick={handleCloseModal} className="mx-2">
              Отмена
            </Button>
            <Button 
              stretched 
              mode="filled" 
              onClick={handleSave} 
              className="mx-2"
              disabled={isSaving}
              style={{
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="spinner"></div>
                  Сохранение...
                </div>
              ) : (
                'Сохранить'
              )}
            </Button>
          </div>
        </div>
      </Modal>

    </>
  );
};

export default adminTaskboardPage;
