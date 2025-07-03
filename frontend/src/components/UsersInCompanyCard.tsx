import { useEffect, useState } from "react";
import { Card, Modal, Button, Input, Select } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { SlArrowDown } from "react-icons/sl";
import Loading from "./Loading";
import { IoIosAddCircleOutline } from "react-icons/io";
import { getWorkGroupsSelect } from "../api/work_group/get-work_groupsSelect";
import type { WorkGroup } from "../@types/group";
import { useSelector } from "react-redux";
import type { UserCompanies, UsersInCompany } from "../@types/user";
import type { RootState } from "../store/rootReducer";

interface User {
  id: number;
  name: string;
  photo_url?: string;
  tg_id?: number;
}

interface UsersInCompanyCardProps {
  data: UsersInCompany[];
  loading: boolean;
}

const UsersInCompanyCard = ({ data, loading }: UsersInCompanyCardProps) => {
  const [groups, setGroups] = useState<WorkGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const { data: dataCompanies, isLoading: IsLoadingCompanies } = useSelector(
    (state: RootState) => state.entities.user_companies
  );

  const telegramData = getTelegramData();

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await getWorkGroupsSelect("1");
        if (res.data) {
          setGroups(res.data);
          if (res.data.length > 0) {
            setSelectedGroup(res.data[0].id);
          } else {
            setSelectedGroup(null);
          }
        } else {
          setGroups([]);
          setSelectedGroup(null);
        }
      } catch (e: any) {
        console.error("Ошибка загрузки групп:", e);
        setGroups([]);
        setSelectedGroup(null);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<UsersInCompany | null>(null);
  const [userNameInModal, setUserNameInModal] = useState<string>("");
  const [userNameErrorInModal, setUserNameErrorInModal] =
    useState<boolean>(false);

  const handleEditClick = (user: UsersInCompany) => {
    setCurrentUserToEdit(user);
    setUserNameInModal(user.name);
    setUserNameErrorInModal(false);
    setIsEditModalOpen(true);
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id);
    } else {
      setSelectedGroup(null);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
    setUserNameInModal("");
    setUserNameErrorInModal(false);
    setSelectedGroup(null);
  };

  const handleSaveEdit = () => {
    if (selectedGroup === null) {
      alert("Пожалуйста, выберите группу!");
      return;
    }

    console.log(
      `Пользователь ${currentUserToEdit?.name} (ID: ${currentUserToEdit?.id}) будет добавлен в группу с ID: ${selectedGroup}`
    );
    alert(
      `Пользователь "${currentUserToEdit?.name}" будет добавлен в группу "${
        groups.find((g) => g.id === selectedGroup)?.title || selectedGroup
      }"`
    );
    handleCloseEditModal();
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
            <div className="rounded-md overflow-hidden relative w-full">
              <p className="text-sm flex items-center mt-1 mb-2">
                Участники без группы:
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
                            <IoIosAddCircleOutline size={20} />
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
            borderTop: "1px solid rgba(42, 144, 255, 0.6)",
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
              <Select>
                <></>
              </Select>

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
                  disabled={groups.length === 0}
                  className="mb-4"
                >
                  {groups.length === 0 && (
                    <option value="" disabled>
                      Нет доступных групп
                    </option>
                  )}
                  {groups.map((group: WorkGroup) => (
                    <option key={group.id} value={group.id}>
                      {group.title}
                    </option>
                  ))}
                </Select>
              )}
              <Input
                disabled={true}
                placeholder="Имя пользователя"
                value={userNameInModal}
                status={userNameErrorInModal ? "error" : "default"}
                className="mb-4"
              />
              {/* {userNameErrorInModal && (
                <p className="text-red-500 text-sm mb-4">
                  Имя не может быть пустым!
                </p>
              )} */}

              <div className="flex items-center justify-between">
                <Button
                  stretched
                  mode="bezeled"
                  onClick={handleCloseEditModal}
                  className="mr-2"
                >
                  Отмена
                </Button>
                <Button stretched onClick={handleSaveEdit} className="ml-2">
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
