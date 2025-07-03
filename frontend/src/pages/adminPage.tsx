import { useEffect, useState } from "react";
import {
  Select,
  Section,
  Input,
  Button,
  Modal,
} from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import AdminGroupCard from "../components/AdminGroupCard";
import { SlArrowDown } from "react-icons/sl";
import { getCompaniesByClient } from "../api/company/get-companies-byClient";
import Loading from "../components/Loading";
import {
  setIsLoadingTasksBoard,
  setTasksBoardByCompany,
} from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import { setUserCompanies } from "../store/slices/entities/user_companies/user_companiesSlice";
import { useDispatch, useSelector } from "react-redux";
import { getWorkGroupsByCompanyId } from "../api/work_group/get-work_groupsByCompanyId";
import { createWorkGroup } from "../api/work_group/create-work_group";
import {
  validateCreateGroupForm,
  type CreateGroupFormErrors,
} from "../utils/validate/validateGroupForm";
import { getUsersInCompany } from "../api/company/get-users-incompany";
import {
  setUsersInCompany,
  setUsersInCompanyLoading,
} from "../store/slices/entities/usersInCompany/usersInCompanySlice";
import UsersInCompanyCard from "../components/UsersInCompanyCard";
import type { RootState } from "../store/rootReducer";
import type { TaskBoard } from "../@types/task";
import type { UserCompanies, UsersInCompany } from "../@types/user";

const AdminPage = () => {
  const dispatch = useDispatch();
  const [selectedValue, setSelectedValue] = useState<string | number>("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<CreateGroupFormErrors>({
    groupName: false,
    groupDescription: false,
    modalSelectedCompanyId: false,
  });

  const [modalSelectedCompanyId, setModalSelectedCompanyId] = useState<
    string | number
  >("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const telegramData = getTelegramData();

  const dataCompanies: UserCompanies[] = useSelector(
    (state: RootState) => state.entities.user_companies?.data
  );
  const dataTaskBoards: TaskBoard[] = useSelector(
    (state: RootState) => state.entities.tasksBoard.data
  );
  const isLoadingTaskBoards: boolean = useSelector(
    (state: RootState) => state.entities.tasksBoard.isLoading
  );
  const dataUsersInCompany: UsersInCompany[] = useSelector(
    (state: RootState) => state.entities.usersInCompany.data
  );
  const isLoadingUsersInCompany: boolean = useSelector(
    (state: RootState) => state.entities.usersInCompany.isLoading
  );

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
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
        setIsLoadingCompanies(false);
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
      const fetchWorkGroupsAndUsers = async () => {
        setIsLoadingGroups(true);
        dispatch(setUsersInCompanyLoading(true));
        dispatch(setIsLoadingTasksBoard(true));

        try {
          const [groupsResult, usersResult] = await Promise.allSettled([
            getWorkGroupsByCompanyId(String(selectedValue)),
            getUsersInCompany(String(selectedValue)),
          ]);

          if (groupsResult.status === "fulfilled" && groupsResult.value.data) {
            dispatch(setTasksBoardByCompany(groupsResult.value.data));
          } else {
            dispatch(setTasksBoardByCompany([]));
          }

          if (usersResult.status === "fulfilled" && usersResult.value.data) {
            dispatch(setUsersInCompany(usersResult.value.data));
          } else {
            dispatch(setUsersInCompany([]));
          }
        } catch (e: any) {
          console.error("Ошибка загрузки данных для компании:", e);
        } finally {
          setIsLoadingGroups(false);
          dispatch(setUsersInCompanyLoading(false));
          dispatch(setIsLoadingTasksBoard(false));
        }
      };

      fetchWorkGroupsAndUsers();
    }
  }, [selectedValue]);

  const handleOpenModal = () => {
    setFormErrors({
      groupName: false,
      groupDescription: false,
      modalSelectedCompanyId: false,
    });
    setGroupName("");
    setGroupDescription("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGroupName("");
    setGroupDescription("");
  };

  const handleAddGroup = async () => {
    const formData = {
      groupName,
      groupDescription,
      modalSelectedCompanyId,
    };
    const { isValid, errors } = validateCreateGroupForm(formData);
    setFormErrors(errors);

    if (!isValid) {
      console.log("Форма невалидна:", errors);
      return;
    }

    try {
      const newGroupData = {
        title: groupName,
        description: groupDescription,
        company_id: Number(modalSelectedCompanyId),
      };
      const newAdded = await createWorkGroup(newGroupData);
      if (newAdded.data as any) {
        await getWorkGroupsByCompanyId(String(selectedValue)).then((res) => {
          dispatch(setTasksBoardByCompany(res.data));
        });
      }

      alert(`Группа "${groupName}" успешно добавлена!`);
      handleCloseModal();
    } catch (e) {
      console.error("Ошибка при создании группы:", e);
      alert("Не удалось добавить группу. Попробуйте еще раз.");
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleModalSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setModalSelectedCompanyId(event.target.value);
    setFormErrors((prev) => ({ ...prev, modalSelectedCompanyId: false }));
  };

  return (
    <>
      <div className="flex w-full justify-center px-5">
        <Button className="mb-4 w-full" onClick={handleOpenModal}>
          Добавить группу
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
        <Input status="focused" placeholder="Поиск" />
      </Section>
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
            <SlArrowDown size={26} />
          </div>
          <Input
            placeholder="Название группы"
            status={formErrors.groupName ? "error" : "focused"}
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setFormErrors((prev) => ({ ...prev, groupName: false }));
            }}
            className="mb-3"
          />
          <Input
            placeholder="Описание группы"
            status={formErrors.groupDescription ? "error" : "focused"}
            value={groupDescription}
            onChange={(e) => {
              setGroupDescription(e.target.value);
              setFormErrors((prev) => ({ ...prev, groupDescription: false }));
            }}
            className="mb-3"
          />
          <div style={{ minHeight: "84px" }}>
            {isLoadingCompanies ? (
              <div
                className="flex justify-center items-center h-full w-full"
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
                value={modalSelectedCompanyId}
                onChange={handleModalSelectChange}
                disabled={dataCompanies?.length === 0}
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
          <div className="flex items-center mt-4">
            <Button
              stretched
              mode="bezeled"
              onClick={handleCloseModal}
              className="mx-2"
            >
              Отмена
            </Button>
            <Button stretched onClick={handleAddGroup} className="mx-2">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
      <AdminGroupCard data={dataTaskBoards} loading={isLoadingTaskBoards} />
      <UsersInCompanyCard
        data={dataUsersInCompany}
        loading={isLoadingUsersInCompany}
      />
    </>
  );
};

export default AdminPage;
