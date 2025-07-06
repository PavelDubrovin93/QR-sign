import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
} from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { IoEyeOffSharp, IoEyeOutline } from "react-icons/io5";
import { PiExclamationMarkFill } from "react-icons/pi";
import { MdOutlineModeEdit, MdClose } from "react-icons/md";
import doneTasks from "../utils/doneTasks";
import type { UsersInCompany } from "../@types/user";
import { getUsersInCompany } from "../api/company/get-users-incompany";
import { updateUserCompany } from "../api/company/update-user-company";
import { getWorkGroupsByCompanyId } from "../api/work_group/get-work_groupsByCompanyId";

interface WorkGroup {
  id: number;
  title: string;
  description: string;
}

interface TasksGroup {
  id: number;
  text: string;
  isCompleted: boolean;
  isVisible: boolean;
}

interface AdminGroupCardItemProps {
  workgroup: WorkGroup;
  users: { user: UsersInCompany; uc: any }[];
  taskboards: any[];
  companyId: number;
}

const AdminGroupCardItem = ({
  workgroup,
  users,
  taskboards,
  companyId,
}: AdminGroupCardItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] =
    useState<UsersInCompany | null>(null);
  const [editedUserName, setEditedUserName] = useState("");
  const [editedUserNameError, setEditedUserNameError] = useState(false);

  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UsersInCompany[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [usersToAdd, setUsersToAdd] = useState<number[]>([]);
  const [isSavingMembers, setIsSavingMembers] = useState(false);
  const [allWorkgroupData, setAllWorkgroupData] = useState<any[]>([]);

  const telegramData = getTelegramData();

  const [_, setTasks] = useState<TasksGroup[]>([
    { id: 1, text: "Установка лесов", isCompleted: true, isVisible: false },
    { id: 2, text: "Вывоз мусора", isCompleted: false, isVisible: true },
    { id: 3, text: "Окраска стен", isCompleted: true, isVisible: true },
    { id: 4, text: "Проверка проводки", isCompleted: false, isVisible: false },
  ]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted, isVisible: false }
          : task
      )
    );
  };

  const toggleTaskProblem = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, isVisible: !task.isVisible } : task
      )
    );
  };

  const handleEditClick = (user: UsersInCompany) => {
    setCurrentUserToEdit(user);
    setEditedUserName(user.name);
    setEditedUserNameError(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
    setEditedUserName("");
    setEditedUserNameError(false);
  };

  const handleSaveEdit = () => {
    if (!editedUserName.trim()) {
      setEditedUserNameError(true);
      return;
    }

    console.log(
      `Сохраняем изменения для пользователя ${currentUserToEdit?.name}: Новое имя - ${editedUserName}`
    );
    alert(`Имя изменено на: ${editedUserName}`);
    handleCloseEditModal();
  };

  const handleCurrentMemberToggle = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId) // Remove from current members
        : [...prev, userId] // Add back to current members
    );
  };

  const handleManageMembersClick = async () => {
    setIsManageMembersModalOpen(true);
    try {
      const [usersResponse, workgroupsResponse] = await Promise.all([
        getUsersInCompany(String(companyId)),
        getWorkGroupsByCompanyId(String(companyId))
      ]);
      
      if (usersResponse.data) {
        setAvailableUsers(usersResponse.data);
        
        const currentMemberIds = users.map(userData => userData.user.id).filter(id => id !== null);
        setSelectedUserIds(currentMemberIds as number[]);
      }
      
      if (workgroupsResponse.data) {
        setAllWorkgroupData(workgroupsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      alert('Ошибка при загрузке данных');
    }
  };

  const handleCloseMembersModal = () => {
    setIsManageMembersModalOpen(false);
    setAvailableUsers([]);
    setSelectedUserIds([]);
    setUsersToAdd([]);
    setAllWorkgroupData([]);
  };

  const getUserCurrentWorkgroup = (userId: number) => {
    for (const workgroupData of allWorkgroupData) {
      const userInWorkgroup = workgroupData.users?.find((userData: any) => 
        userData.user?.id === userId
      );
      if (userInWorkgroup) {
        return workgroupData.workgroup;
      }
    }
    return null;
  };

  const handleUserToggle = (userId: number) => {
    setUsersToAdd(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveMembers = async () => {
    const currentMemberIds = users.map(userData => userData.user.id).filter(id => id !== null) as number[];
    const usersToRemove = currentMemberIds.filter(id => !selectedUserIds.includes(id));
    const usersToAddToGroup = usersToAdd;

    if (usersToRemove.length === 0 && usersToAddToGroup.length === 0) {
      handleCloseMembersModal();
      return;
    }

    setIsSavingMembers(true);
    try {
      const updatePromises: Promise<any>[] = [];
      
      // Remove users from workgroup
      for (const userId of usersToRemove) {
        const userToRemove = availableUsers.find(user => user.id === userId);
        if (userToRemove && userToRemove.uc_id) {
          updatePromises.push(
            updateUserCompany(userToRemove.uc_id, { 
              user_id: userId,
              company_id: companyId,
              workgroup_id: null 
            })
          );
        }
      }
      
      // Add users to workgroup
      for (const userId of usersToAddToGroup) {
        const userToAdd = availableUsers.find(user => user.id === userId);
        if (userToAdd && userToAdd.uc_id) {
          updatePromises.push(
            updateUserCompany(userToAdd.uc_id, { 
              user_id: userId,
              company_id: companyId,
              workgroup_id: workgroup.id 
            })
          );
        }
      }
      
      await Promise.all(updatePromises);
      
      const totalChanges = usersToRemove.length + usersToAddToGroup.length;
      alert(`Обновлено ${totalChanges} участников в бригаде!`);
      handleCloseMembersModal();
      
      window.location.reload(); 
      
    } catch (error) {
      console.error('Error updating workgroup members:', error);
      alert('Ошибка при обновлении участников бригады');
    } finally {
      setIsSavingMembers(false);
    }
  };

  return (
    <Card
      className="w-full mb-1"
      style={{
        backgroundColor: telegramData?.themeParams.section_bg_color,
      }}
    >
      <div className="flex flex-col justify-between h-full p-3">
        <div className="flex flex-col items-start gap-2">
          <div className="rounded-md overflow-hidden relative">
            <p className="text-base font-semibold pb-2">{workgroup?.title}</p>
            <span className="text-sm">
              <p>{workgroup?.description}</p>
            </span>
            <div className="mt-4">
              <span className="text-sm flex items-center mt-1">
                <div
                  style={{ background: "#e53835" }}
                  className="w-2 h-2 bg-red-500 rounded-full mr-2"
                />
                <p>{doneTasks(taskboards).activeTasks} активные задачи</p>
              </span>

              <span className="text-sm flex items-center mt-1">
                <div
                  style={{ background: "#007aff" }}
                  className="w-2 h-2 bg-red-500 rounded-full mr-2"
                />
                <p>{doneTasks(taskboards).completedTasks} выполненные задачи</p>
              </span>
            </div>
            {isExpanded && (
              <div
                style={{ height: "1px" }}
                className="w-full bg-white border mt-3"
              />
            )}
          </div>
        </div>
        {isExpanded && (
          <>
            {taskboards.map((task: any) => {
              const { task_points } = task;
              return (
                <div key={task.id}>
                  <div className="mt-3 text-sm">
                    <div className="flex justify-between">
                      <p className="text-base font-semibold pb-2">
                        {task.title}
                      </p>
                      <p className="text-base font-semibold pb-2">22.04.2025</p>
                    </div>
                    <div className="list-disc list-inside">
                      {task_points?.map((task: any) => {
                        return (
                          <div
                            key={task.id}
                            className="flex items-center justify-between mb-1"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 flex items-center justify-center w-6 h-7">
                                {task.isVisible ? (
                                  <PiExclamationMarkFill
                                    size={24}
                                    color="#ff3b2f"
                                    style={{ cursor: "pointer" }}
                                  />
                                ) : (
                                  <Checkbox
                                    checked={task.done_at}
                                    onChange={() =>
                                      toggleTaskCompletion(task.id)
                                    }
                                  />
                                )}
                              </span>
                              <p
                                className={
                                  !!task.done_at
                                    ? "line-through text-gray-500"
                                    : ""
                                }
                                style={{
                                  color: !!task.done_at
                                    ? telegramData?.themeParams.hint_color
                                    : telegramData?.themeParams.text_color,
                                }}
                              >
                                {task.title}
                              </p>
                            </div>
                            <div
                              onClick={() => toggleTaskProblem(task.id)}
                              style={{ cursor: "pointer" }}
                            >
                              {task.isVisible ? (
                                <IoEyeOffSharp
                                  size={22}
                                  color={telegramData?.themeParams.button_color}
                                />
                              ) : (
                                <IoEyeOutline size={22} color="#007aff" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-col justify-between h-full p-3">
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-md overflow-hidden relative w-full">
                  <p className="text-sm flex items-center mt-1 mb-2">
                    {`Участники в группе ${workgroup.title}:`}
                  </p>

                  <div>
                    {users && users?.length > 0 ? (
                      users?.map((userData) => {
                        const { user } = userData;

                        return (
                          <div
                            key={user.id || user.tg_id}
                            className="flex items-center justify-between mb-1"
                            onClick={() => handleEditClick(user)}
                          >
                            <div className="flex items-center">
                              <span className="w-5 h-5 rounded-full mr-2 overflow-hidden flex items-center justify-center bg-gray-300">
                                {user.photo_url ? (
                                  <img
                                    src={user.photo_url}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <p className="text-white text-xs">
                                    {user?.name?.charAt(0).toUpperCase()}
                                  </p>
                                )}
                              </span>

                              <p>{user.name}</p>
                            </div>

                            <div>
                              <MdOutlineModeEdit size={20} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p>Нет участников</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      size="s"
                      stretched
                      onClick={handleManageMembersClick}
                    >
                      Редактировать
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
            <h3 className="text-center text-lg font-bold mb-4">
              Редактировать имя пользователя
            </h3>

            <Input
              placeholder="Имя пользователя"
              value={editedUserName}
              onChange={(e) => {
                setEditedUserName(e.target.value);
                setEditedUserNameError(false);
              }}
              status={editedUserNameError ? "error" : "focused"}
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
              <Button stretched onClick={handleSaveEdit} className="ml-2">
                Сохранить
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={isManageMembersModalOpen}
          onOpenChange={setIsManageMembersModalOpen}
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
            <h3 className="text-center text-lg font-bold mb-4">
              Участники группы "{workgroup.title}"
            </h3>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                Пользователь, находящийся в другой бригаде, будет удален из предыдущей
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3 text-gray-700">
                Текущие участники ({users.length})
              </h4>
              {users.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {users.map((userData) => (
                    <div
                      key={userData.user.id || userData.user.tg_id}
                      className="flex items-center mb-3"
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(userData.user.id || 0)}
                        onChange={() => handleCurrentMemberToggle(userData.user.id || 0)}
                        className="mr-3"
                      />
                      <div className="flex items-center flex-1">
                        <span className="w-8 h-8 rounded-full mr-3 overflow-hidden flex items-center justify-center bg-gray-300">
                          {userData.user.photo_url ? (
                            <img
                              src={userData.user.photo_url}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p className="text-white text-sm">
                              {userData.user.name?.charAt(0).toUpperCase()}
                            </p>
                          )}
                        </span>
                        <p className="font-medium">{userData.user.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Нет участников в бригаде</p>
              )}
            </div>

            {/* Available Users Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">
                Добавить участников
              </h4>
              <div className="max-h-48 overflow-y-auto">
                {availableUsers.length > 0 ? (
                  availableUsers
                    .filter(user => !selectedUserIds.includes(user.id || 0)) // Only show users not in current workgroup
                    .sort((a, b) => {
                      // Sort users without workgroups first
                      const aWorkgroup = getUserCurrentWorkgroup(a.id || 0);
                      const bWorkgroup = getUserCurrentWorkgroup(b.id || 0);
                      
                      if (!aWorkgroup && !bWorkgroup) return 0;
                      if (!aWorkgroup && bWorkgroup) return -1;
                      if (aWorkgroup && !bWorkgroup) return 1;
                      return 0;
                    })
                    .map((user) => {
                      const currentWorkgroup = getUserCurrentWorkgroup(user.id || 0);
                      
                      return (
                        <div
                          key={user.id || user.tg_id}
                          className="flex items-center mb-3"
                        >
                          <Checkbox
                            checked={usersToAdd.includes(user.id || 0)}
                            onChange={() => handleUserToggle(user.id || 0)}
                            className="mr-3"
                          />
                          <div className="flex items-center flex-1">
                            <span className="w-8 h-8 rounded-full mr-3 overflow-hidden flex items-center justify-center bg-gray-300">
                              {user.photo_url ? (
                                <img
                                  src={user.photo_url}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <p className="text-white text-sm">
                                  {user?.name?.charAt(0).toUpperCase()}
                                </p>
                              )}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">{user.name}</p>
                              {currentWorkgroup ? (
                                <p className="text-xs text-orange-600">
                                  В бригаде: {currentWorkgroup.title}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500">Не назначен в бригаду</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-center text-gray-500">Загрузка пользователей...</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                stretched
                mode="bezeled"
                onClick={handleCloseMembersModal}
                className="mr-2"
                disabled={isSavingMembers}
              >
                Отмена
              </Button>
              <Button 
                stretched 
                onClick={handleSaveMembers} 
                className="ml-2"
                disabled={isSavingMembers}
              >
                {isSavingMembers ? "Сохранение..." : `Сохранить`}
              </Button>
            </div>
          </div>
        </Modal>
        <div className="flex justify-end mt-2">
          <button
            onClick={toggleExpand}
            className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Toggle Expand"
          >
            {isExpanded ? (
              <SlArrowUp
                size={24}
                color={telegramData?.themeParams.button_color}
              />
            ) : (
              <SlArrowDown
                size={24}
                color={telegramData?.themeParams.button_color}
              />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AdminGroupCardItem;
