import {
  Button,
  Input,
  Modal,
  Section,
  Select,
  Textarea,
} from "@telegram-apps/telegram-ui";
import { SlArrowDown } from "react-icons/sl";
import { useEffect, useState, useCallback } from "react";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import type { UserCompanies } from "../@types/user";
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
import TestImage from "../assets/test_image.jpeg";
import { getWorkGroupsSelect } from "../api/work_group/get-work_groupsSelect";
import { createTask } from "../api/task/create-task";
import type { CreateTaskPayload, Task } from "../@types/task";

export interface WorkGroup {
  id: number;
  title: string;
  description: string;
  company_id: number;
}

const adminTaskboardPage = () => {
  const dispatch = useDispatch();
  const telegramData = getTelegramData();

  const [selectedValue, setSelectedValue] = useState<string | number>("");
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

  const { data: dataCompanies, isLoading: isLoadingCompanies } = useSelector(
    (state: RootState) => state.entities.user_companies
  );

  const fetchCompanies = useCallback(async () => {
    dispatch(setIsLoadingCompanies(true));
    try {
      const res = await getCompaniesByClient();
      if (res.data) {
        dispatch(setUserCompanies(res.data));
        if (res.data.length > 0) {
          setSelectedValue(res.data[0].company_id || "");
          setModalSelectedCompanyId(res.data[0].company_id || "");
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
    if (isModalOpen && modalSelectedCompanyId) {
      fetchWorkGroups(modalSelectedCompanyId);
    }
  }, [modalSelectedCompanyId, isModalOpen]);

  useEffect(() => {
    if (selectedValue !== "") {
      fetchTasks(selectedValue);
    } else {
      dispatch(setTasksBoardByCompany([]));
    }
  }, [selectedValue]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (dataCompanies && dataCompanies.length > 0) {
      setModalSelectedCompanyId(
        (selectedValue ?? "") || (dataCompanies[0]?.company_id ?? "")
      );
    } else {
      setModalSelectedCompanyId("");
    }
    setTaskName("");
    setTaskDescription("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskName("");
    setTaskDescription("");
    setWorkGroups([]);
    setModalSelectedWorkGroupId("");
  };

  const handleAddTask = async () => {
    if (
      !taskName ||
      !taskDescription ||
      !modalSelectedCompanyId ||
      !modalSelectedWorkGroupId
    ) {
      alert(
        "Пожалуйста, заполните все поля (Название, Описание, Компания, Группа)!"
      );
      return;
    }

    const taskData: CreateTaskPayload = {
      title: taskName,
      company_id: Number(modalSelectedCompanyId),
      work_group_id: Number(modalSelectedWorkGroupId),
      image: TestImage,
      location: [0, 0],
      type: "string",
      description: taskDescription,
      task_points: [],
    };

    try {
      const res = await createTask(taskData);
      if (res.status === 200 || res.status === 201) {
        alert("Задача успешно добавлена!");
        handleCloseModal();
        fetchTasks(selectedValue);
      } else {
        alert("Ошибка при добавлении задачи.");
        console.error("API response error:", res);
      }
    } catch (e: any) {
      alert("Произошла ошибка при отправке данных задачи.");
      console.error("Ошибка при добавлении задачи:", e);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleModalSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCompanyId = event.target.value;
    setModalSelectedCompanyId(newCompanyId);
  };

  const handleWorkGroupSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setModalSelectedWorkGroupId(event.target.value);
  };

  return (
    <>
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
        dismissible
        modal={true}
        preventScrollRestoration={true}
      >
        <div
          style={{
            borderTop: "1px solid rgba(42, 144, 255, 0.6)",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
          }}
          className="py-4 px-4 top-shadow-container"
        >
          <div className="flex justify-center relative top-[-10px]">
            <SlArrowDown
              size={26}
              // color={telegramData?.themeParams.button_color}
            />
          </div>
          <h3 className="text-center">Добавить задачу</h3>

          <div className="rounded-md overflow-hidden relative cursor-pointer">
            <img
              alt="Task image"
              src={TestImage}
              className="w-full h-auto object-cover rounded-xl p-2 pb-0"
            />
          </div>
          <Input
            placeholder="Название задачи"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="mb-3"
          />
          <Textarea
            placeholder="Описание задачи"
            style={{ minHeight: "70px" }}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <div className="mb-3" style={{ height: "84px" }}>
            {isLoadingCompanies ? (
              <div
                className="flex justify-center items-center h-full"
                style={{ padding: "10px" }}
              >
                <Loading size={30} color={"#2a90ff"} />
                <span
                  style={{
                    marginLeft: "10px",
                    color: "var(--tgui--text_color)",
                  }}
                >
                  Загрузка компаний...
                </span>
              </div>
            ) : (
              <Select
                status="focused"
                value={modalSelectedCompanyId}
                onChange={handleModalSelectChange}
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

          <div className="mb-5" style={{ height: "84px" }}>
            {isLoadingWorkGroups ? (
              <div
                className="flex justify-center items-center h-full"
                style={{ padding: "10px" }}
              >
                <Loading size={30} color={"#2a90ff"} />
                <span
                  style={{
                    marginLeft: "10px",
                    color: "var(--tgui--text_color)",
                  }}
                >
                  Загрузка групп...
                </span>
              </div>
            ) : (
              <Select
                status="focused"
                value={modalSelectedWorkGroupId}
                onChange={handleWorkGroupSelectChange}
                disabled={workGroups.length === 0 || !modalSelectedCompanyId}
                style={{ width: "100%" }}
              >
                {workGroups.length > 0 ? (
                  workGroups.map((group: WorkGroup) => (
                    <option key={group.id} value={group.id || ""}>
                      {group.title}
                    </option>
                  ))
                ) : (
                  <option disabled>Нет доступных групп</option>
                )}
              </Select>
            )}
          </div>

          <div className="flex items-center">
            <Button
              stretched
              mode="bezeled"
              onClick={handleCloseModal}
              className="mx-2"
            >
              Отмена
            </Button>
            <Button
              stretched
              onClick={handleAddTask}
              className="mx-2"
              disabled={
                !taskName ||
                !taskDescription ||
                !modalSelectedCompanyId ||
                !modalSelectedWorkGroupId
              }
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default adminTaskboardPage;
