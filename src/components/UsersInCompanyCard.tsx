import { useEffect, useState, useCallback } from "react";
import { Card, Modal, Button, Input, Select } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { SlArrowDown } from "react-icons/sl";
import Loading from "./Loading";

import { getWorkGroupsSelect } from "../api/work_group/get-work_groupsSelect";
import type { WorkGroup } from "../@types/group";
import { useDispatch, useSelector } from "react-redux";
import type { UserCompanies, UsersInCompany } from "../@types/user";
import type { RootState } from "../store/rootReducer";
import { addUserToGroup } from "../api/company/add-user-toGroup";
import { getWorkGroupsByCompanyId } from "../api/work_group/get-work_groupsByCompanyId";
import { setTasksBoardByCompany } from "../store/slices/entities/tasksBoard/tasksBoardSlice";

interface UsersInCompanyCardProps {
  data: UsersInCompany[];
  loading: boolean;
  selectedValue: string;
}

const UsersInCompanyCard = ({ data, loading, selectedValue }: UsersInCompanyCardProps) => {
  const telegramData = getTelegramData();
  const dispatch = useDispatch();
  const [groups, setGroups] = useState<WorkGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<string | number>("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] =
    useState<UsersInCompany | null>(null);

  const [userNameInModal, setUserNameInModal] = useState<string>("");
  const [modalSelectedCompanyId, setModalSelectedCompanyId] = useState<
    string | number
  >("");

  const { data: dataCompanies, isLoading: isLoadingCompanies } = useSelector(
    (state: RootState) => state.entities.user_companies
  );

  const fetchGroups = useCallback(async (companyId: string | number) => {
    if (!companyId) {
      setGroups([]);
      setSelectedGroup("");
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    try {
      const res = await getWorkGroupsSelect(String(companyId));
      if (res.data) {
        setGroups(res.data);
        if (res.data.length > 0) {
          setSelectedGroup(res.data[0].id);
        } else {
          setSelectedGroup("");
        }
      } else {
        setGroups([]);
        setSelectedGroup("");
      }
    } catch (e: any) {
      console.error(`Ошибка загрузки групп для компании ${companyId}:`, e);
      setGroups([]);
      setSelectedGroup("");
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (isEditModalOpen && modalSelectedCompanyId) {
      fetchGroups(modalSelectedCompanyId);
    } else if (isEditModalOpen && !modalSelectedCompanyId) {
      setGroups([]);
      setSelectedGroup("");
      setLoadingGroups(false);
    }
  }, [isEditModalOpen, modalSelectedCompanyId, fetchGroups]);

  const handleEditClick = (user: UsersInCompany) => {
    setCurrentUserToEdit(user);
    setUserNameInModal(user.name);
    setIsEditModalOpen(true);
    if (dataCompanies && dataCompanies.length > 0) {
      const firstCompanyId = dataCompanies[0].company_id ?? "";
      setModalSelectedCompanyId(firstCompanyId);
    } else {
      setModalSelectedCompanyId("");
      setGroups([]);
      setSelectedGroup("");
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
    setUserNameInModal("");
    setSelectedGroup("");
    setModalSelectedCompanyId("");
    setGroups([]);
  };

  const handleAddUserToGroup = async () => {
    if (!modalSelectedCompanyId || !selectedGroup) {
      alert("Пожалуйста, выберите компанию и группу!");
      return;
    }
    const sendData = {
      id: currentUserToEdit?.id,
      user_id: currentUserToEdit?.id,
      company_id: modalSelectedCompanyId,
      workgroup_id: selectedGroup,
      // role: "not_approved",
    };

    await addUserToGroup(sendData, modalSelectedCompanyId.toString());

    console.log(
      `Пользователь ${currentUserToEdit?.name} (ID: ${currentUserToEdit?.id}) будет добавлен в группу с ID: ${selectedGroup} в компании ID: ${modalSelectedCompanyId}`
    );
    alert(
      `Пользователь "${currentUserToEdit?.name}" будет добавлен в группу "${
        groups.find((g) => g.id === selectedGroup)?.title || selectedGroup
      }" компании "${
        dataCompanies?.find((c) => c.company_id === modalSelectedCompanyId)
          ?.company_name || modalSelectedCompanyId
      }"`
    );
    handleCloseEditModal();
    const res = await getWorkGroupsByCompanyId(selectedValue);
    if(res.data) {
      dispatch(setTasksBoardByCompany(res.data));
    }
  };

  const handleModalCompanyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCompanyId = event.target.value;
    setModalSelectedCompanyId(newCompanyId);
  };

  const handleSelectGroupChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedGroup(Number(event.target.value));
  };

  return (
    <div className="p-4">
      <Card
        className="w-full mt-4"
        style={{
          backgroundColor: telegramData?.themeParams.section_bg_color,
        }}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div className="flex flex-col items-start gap-2">
             <div className="rounded-md overflow-hidden relative w-full"> {/* не получается пофиксить - просто поменяй XD */}
              <p className="text-sm flex items-center mt-1 mb-2"> 
                Все участники
              </p>
              <div>
                {!loading ? (
                  data && data.length > 0 ? (
                    data.map((user: UsersInCompany) => {
                      const { id, name, photo_url, tg_id } = user;

                      return (
                        <div
                          key={id || tg_id}
                          className="flex items-center justify-between mb-1"
                          onClick={() => handleEditClick(user)}
                        >
                          <div className="flex items-center">
                            <span className="w-5 h-5 rounded-full mr-2 overflow-hidden flex items-center justify-center bg-gray-300">
                              {photo_url ? (
                                <img
                                  src={photo_url}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <p className="text-white text-xs">
                                  {name.charAt(0).toUpperCase()}
                                </p>
                              )}
                            </span>
                            <p>{name}</p>
                          </div>
                          <div>
                            {/* <IoIosAddCircleOutline size={20} /> */}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">Нет участников без группы.</p>
                  )
                ) : (
                  <Loading size={24} color={"#2a90ff"} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        dismissible
        modal={true}
        preventScrollRestoration={true}
      >
        <div
          style={{
            
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
          }}
          className="py-4 px-4 top-shadow-container"
        >
          <div className="flex justify-center relative top-[-10px]">
            <SlArrowDown size={26} />
          </div>
          <h3 className="text-center text-md font-bold mb-4">
            Добавить в группу:
          </h3>

          {currentUserToEdit && (
            <div>
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
                    onChange={handleModalCompanyChange}
                    disabled={dataCompanies?.length === 0}
                    style={{ width: "100%" }}
                  >
                    {dataCompanies && dataCompanies.length > 0 ? (
                      dataCompanies.map((company: UserCompanies) => (
                        <option
                          key={company.company_id}
                          value={company.company_id || ""}
                        >
                          {company.company_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Нет доступных компаний
                      </option>
                    )}
                  </Select>
                )}
              </div>

              <div className="mb-4" style={{ height: "84px" }}>
                {loadingGroups ? (
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
                      Загрузка групп...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={selectedGroup || ""}
                    onChange={handleSelectGroupChange}
                    disabled={groups.length === 0 || !modalSelectedCompanyId}
                    style={{ width: "100%" }}
                  >
                    {groups.length === 0 || !modalSelectedCompanyId ? (
                      <option value="" disabled>
                        {!modalSelectedCompanyId
                          ? "Выберите компанию"
                          : "Нет доступных групп"}
                      </option>
                    ) : (
                      groups.map((group: WorkGroup) => (
                        <option key={group.id} value={group.id}>
                          {group.title}
                        </option>
                      ))
                    )}
                  </Select>
                )}
              </div>

              <Input
                disabled={true}
                placeholder="Имя пользователя"
                value={userNameInModal}
                className="mb-4"
              />

              <div className="flex items-center justify-between">
                <Button
                  stretched
                  mode="bezeled"
                  onClick={handleCloseEditModal}
                  className="mr-2"
                >
                  Отмена
                </Button>
                <Button
                  stretched
                  onClick={handleAddUserToGroup}
                  className="ml-2"
                  disabled={!modalSelectedCompanyId || !selectedGroup}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UsersInCompanyCard;
