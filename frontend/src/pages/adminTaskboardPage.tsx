import {
  Button,
  Input,
  Modal,
  Section,
  Select,
} from "@telegram-apps/telegram-ui";
import { SlArrowDown } from "react-icons/sl";
import { useEffect, useState } from "react";
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

const adminTaskboardPage = () => {
  const dispatch = useDispatch();
  const telegramData = getTelegramData();

  const [selectedValue, setSelectedValue] = useState<string | number>("");
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: dataCompanies, isLoading: isLoadingCompanies } = useSelector(
    (state: RootState) => state.entities.user_companies
  );

  useEffect(() => {
    const fetchCompanies = async () => {
      dispatch(setIsLoadingCompanies(true));
      try {
        const res = await getCompaniesByClient();
        if (res.data) {
          dispatch(setUserCompanies(res.data));
          if (res.data.length > 0) {
            setSelectedValue(res.data[0].company_id || "");
            // setModalSelectedCompanyId(res.data[0].company_id || "");
          }
        }
      } catch (e: any) {
        console.error("Ошибка загрузки компаний:", e);
      } finally {
        dispatch(setIsLoadingCompanies(false));
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (
      selectedValue !== "" &&
      selectedValue !== null &&
      selectedValue !== undefined
    ) {
      const fetchTasks = async () => {
        dispatch(setIsLoadingTasksBoard(true));
        try {
          const res = await getTasksByCompany(String(selectedValue));
          if (res.data) {
            dispatch(setTasksBoardByCompany(res.data));
          }
        } catch (e: any) {
          console.error("Ошибка загрузки задач:", e);
        } finally {
          dispatch(setIsLoadingTasksBoard(false));
        }
      };

      fetchTasks();
    }
  }, [selectedValue]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskName("");
    setTaskDescription("");
  };

  const handleAddTask = () => {
    // тут нужен апи запрос на добавление новой задачи
    console.log("Добавляем задачу:", { taskName, taskDescription });
    alert(`Задача "${taskName}" добавлена!`);
    handleCloseModal();
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
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
      <AdminTasks /* data={dataTasks} loading={isLoadingTasks}  *//>
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
          <Input
            placeholder="Название задачи"
            status="focused"
            // value={groupName}
            // onChange={(e) => setGroupName(e.target.value)}
          />
          {/* <Cell>
            <Input
                    placeholder="Описание группы"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
          </Cell> */}
          <div className="flex items-center">
            <Button
              stretched
              mode="bezeled"
              onClick={handleCloseModal}
              className="mx-5"
            >
              Отмена
            </Button>
            <Button stretched onClick={handleAddTask} className="mx-5">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default adminTaskboardPage;
