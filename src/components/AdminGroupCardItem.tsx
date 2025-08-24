import { useState, useEffect } from "react";
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
import { useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";

import doneTasks from "../utils/doneTasks";
import type { UsersInCompany } from "../@types/user";
import { getUsersInCompany } from "../api/company/get-users-incompany";
import { updateUserCompany, createAdditionalUserCompany, deleteUserCompany } from "../api/company/update-user-company";
import { getWorkGroupsByCompanyId } from "../api/work_group/get-work_groupsByCompanyId";
import { deleteWorkgroup } from "../api/company/delete-workgroup";
import { getUserRole } from "../api/user/get-user-role";
import { Roles } from "../@types/role";

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
  onDataRefresh: () => Promise<void>;
}

const AdminGroupCardItem = ({
  workgroup,
  users,
  taskboards,
  companyId,
  onDataRefresh,
}: AdminGroupCardItemProps) => {
  

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] =
    useState<UsersInCompany | null>(null);
  console.log(currentUserToEdit);
  const [editedUserName, setEditedUserName] = useState("");
  const [editedUserNameError, setEditedUserNameError] = useState(false);

  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UsersInCompany[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [usersToAdd, setUsersToAdd] = useState<number[]>([]);
  const [isSavingMembers, setIsSavingMembers] = useState(false);
  const [allWorkgroupData, setAllWorkgroupData] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingModalData, setIsLoadingModalData] = useState(false);
  const [userRoles, setUserRoles] = useState<Record<number, string>>({});

  const telegramData = getTelegramData();
  
  // Получаем информацию о текущем пользователе
  const currentUser = useSelector((state: RootState) => state.entities.user);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Функция для открытия чата Telegram
  const openTelegramChat = (user: any) => {
    if (!user) return;
    
    try {
      // Пытаемся открыть чат через tg_id
      if (user.tg_id) {
        const chatUrl = `tg://user?id=${user.tg_id}`;
        window.open(chatUrl, '_blank');
      } else if (user.username) {
        // Если есть username, используем его
        const chatUrl = `tg://resolve?domain=${user.username}`;
        window.open(chatUrl, '_blank');
      } else {
        // Fallback - пытаемся через имя пользователя
        console.log('Нет tg_id или username для открытия чата');
      }
    } catch (error) {
      console.error('Ошибка при открытии чата Telegram:', error);
    }
  };

  // Дедупликация пользователей для отображения
  const getDeduplicatedUsers = () => {
    if (!users || users.length === 0) return [];
    
    const userMap = new Map();
    
    users.forEach(userData => {
      const userId = userData.user.id || userData.user.tg_id;
      if (userId && !userMap.has(userId)) {
        userMap.set(userId, userData);
      }
    });
    
    return Array.from(userMap.values());
  };

  // Получаем роль текущего пользователя (упрощенная версия как в AdminPage)
  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        if (companyId) {
          const roleResponse = await getUserRole(companyId);
          setCurrentUserRole(roleResponse);
        }
      } catch (error) {
        console.error('Error loading current user role:', error);
        // Fallback к роли из Redux store
        setCurrentUserRole(currentUser.current_role || '');
      }
    };

    if (companyId) {
      getCurrentUserRole();
    }
  }, [companyId]);

  useEffect(() => {
    // Загружаем роли для пользователей при изменении allWorkgroupData
    if (allWorkgroupData.length > 0) {
      allWorkgroupData.forEach(workgroupData => {
        workgroupData.users?.forEach((userData: any) => {
          if (userData.user?.id && userData.uc?.role) {
            setUserRoles(prev => ({ 
              ...prev, 
              [userData.user.id as number]: userData.uc.role 
            }));
          }
        });
      });
    }
  }, [allWorkgroupData]);

  useEffect(() => {
    // Загружаем роли для текущих пользователей в группе
    if (users && users.length > 0) {
      users.forEach(userData => {
        if (userData.user.id && userData.uc?.role) {
          setUserRoles(prev => ({ 
            ...prev, 
            [userData.user.id as number]: userData.uc.role 
          }));
        }
      });
    }
  }, [users]);

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


    handleCloseEditModal();
  };

  const handleCurrentMemberToggle = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleManageMembersClick = async () => {
    setIsManageMembersModalOpen(true);
    setIsLoadingModalData(true);
    try {
      const [usersResponse, workgroupsResponse] = await Promise.all([
        getUsersInCompany(String(companyId)),
        getWorkGroupsByCompanyId(String(companyId))
      ]);
      
      if (usersResponse.data) {
        // Дедуплицируем пользователей и собираем информацию о группах
        const userMap = new Map<number, UsersInCompany & { workgroups: string[] }>();
        
        usersResponse.data.forEach((user: UsersInCompany) => {
          if (user.id) {
            if (userMap.has(user.id)) {
              // Пользователь уже есть, добавляем информацию о группе
              const existingUser = userMap.get(user.id)!;
              const workgroupNames = getUserWorkgroupNameByUserId(user.id);
              workgroupNames.forEach((groupName: string) => {
                if (!existingUser.workgroups.includes(groupName)) {
                  existingUser.workgroups.push(groupName);
                }
              });
            } else {
              // Новый пользователь
              const workgroupNames = getUserWorkgroupNameByUserId(user.id);
              userMap.set(user.id, {
                ...user,
                workgroups: workgroupNames
              });
            }
          }
        });
        
        const deduplicatedUsers = Array.from(userMap.values());
        setAvailableUsers(deduplicatedUsers);
        
        const currentMemberIds = users?.map(userData => userData.user.id).filter(id => id !== null) || [];
        setSelectedUserIds(currentMemberIds as number[]);
        
        // Загружаем роли для доступных пользователей
        deduplicatedUsers.forEach((user: UsersInCompany) => {
          if (user.id && user.role) {
            setUserRoles(prev => ({ ...prev, [user.id!]: user.role! }));
          }
        });
      }
      
      if (workgroupsResponse.data) {
        setAllWorkgroupData(workgroupsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setIsLoadingModalData(false);
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



  // Получает ВСЕ названия групп для пользователя по user_id
  const getUserWorkgroupNameByUserId = (userId: number): string[] => {
    const workgroupNames: string[] = [];
    
    for (const workgroupData of allWorkgroupData) {
      const userInWorkgroup = workgroupData.users?.find((userData: any) => 
        userData.user?.id === userId
      );
      if (userInWorkgroup && workgroupData.workgroup?.title) {
        workgroupNames.push(workgroupData.workgroup.title);
      }
    }
    
    return workgroupNames;
  };

  // Подсчитывает количество записей user_company для пользователя в текущей компании
  const getUserCompanyRecordsCount = (userId: number): number => {
    let count = 0;
    
    for (const workgroupData of allWorkgroupData) {
      const userInWorkgroup = workgroupData.users?.find((userData: any) => 
        userData.user?.id === userId
      );
      if (userInWorkgroup) {
        count++;
      }
    }
    
    return count;
  };

  const getUserRoleFromData = (userId: number): string | null => {
    // Сначала ищем в уже загруженных данных allWorkgroupData
    for (const workgroupData of allWorkgroupData) {
      const userInWorkgroup = workgroupData.users?.find((userData: any) => 
        userData.user?.id === userId
      );
      if (userInWorkgroup && userInWorkgroup.uc?.role) {
        return userInWorkgroup.uc.role;
      }
    }
    
    // Если не найдено в workgroups, ищем в текущих users данного workgroup
    const userData = users?.find(u => u.user.id === userId);
    if (userData?.uc?.role) {
      return userData.uc.role;
    }
    
    // Ищем в кэше ролей
    const cachedRole = userRoles[userId];
    if (cachedRole) {
      return cachedRole;
    }
    
    return null;
  };



  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'owner': 'Владелец',
      'admin': 'Администратор', 
      'foreman': 'Руководитель группы',
      'employer': 'Исполнитель',
      'not_approved': 'Не подтвержден'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colorMap: Record<string, string> = {
      'owner': '#10b981',
      'admin': '#3b82f6',
      'foreman': '#f59e0b',
      'employer': '#6b7280',
      'not_approved': '#ef4444'
    };
    return colorMap[role] || '#6b7280';
  };

  const RoleBadge = ({ role }: { role: string }) => (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${getRoleColor(role)}20`,
        color: getRoleColor(role),
        border: `1px solid ${getRoleColor(role)}40`
      }}
    >
      {getRoleDisplayName(role)}
    </span>
  );

  // Проверяет, может ли пользователь быть удален из бригады
  const canRemoveUserFromWorkgroup = (userId: number): boolean => {
    const userRole = getUserRoleFromData(userId);
    
    // Проверяем несколькими способами, является ли этот пользователь текущим пользователем
    const webapp = window.Telegram?.WebApp;
    const currentTelegramId = webapp?.initDataUnsafe?.user?.id || 601732567;
    
    // Способ 1: По Telegram ID среди участников группы
    const currentUserInGroup = users?.find(userData => userData.user.tg_id === currentTelegramId);
    const isCurrentUserByTgId = currentUserInGroup?.user.id === userId;
    
    // Способ 2: По Redux currentUser.id (может быть user_id из базы)
    const isCurrentUserByRedux = userId === currentUser.id;
    
    // Способ 3: Проверяем, если пользователь - админ и это его ID из Redux
    const isCurrentUserAdmin = currentUserRole === Roles.ADMIN && isCurrentUserByRedux;
    
    // Окончательная проверка - это текущий пользователь?
    const isCurrentUser = isCurrentUserByTgId || isCurrentUserByRedux || isCurrentUserAdmin;
    

    
    // Если текущий пользователь - овнер, он может удалять всех кроме себя-админа
    if (currentUserRole === Roles.OWNER) {
      // Но если он админ в этой группе, не может удалить себя
      if (isCurrentUser && userRole === Roles.ADMIN) {
        return false;
      }
      return true;
    }
    
    // Админ не может удалить себя из бригады
    if (currentUserRole === Roles.ADMIN && isCurrentUser) {
      return false;
    }
    
    // В остальных случаях можно удалять
    return true;
  };

  // Проверяет, может ли пользователь быть добавлен в несколько бригад
  const canAddUserToMultipleWorkgroups = (userId: number): boolean => {
    const userRole = getUserRoleFromData(userId);
    
    // Овнер может добавлять админов в несколько бригад
    if (currentUserRole === Roles.OWNER && userRole === Roles.ADMIN) {
      return true;
    }
    
    // В остальных случаях пользователь может быть только в одной бригаде
    return false;
  };

  // Проверяет, есть ли у пользователя уже записи в других workgroup'ах этой компании
  const getUserWorkgroupsInCompany = (userId: number): any[] => {
    const userWorkgroups: any[] = [];
    
    // Ищем во всех данных workgroup'ов
    allWorkgroupData.forEach(workgroupData => {
      const userInWorkgroup = workgroupData.users?.find((userData: any) => 
        userData.user?.id === userId
      );
      if (userInWorkgroup) {
        userWorkgroups.push({
          workgroup: workgroupData.workgroup,
          uc: userInWorkgroup.uc
        });
      }
    });
    
    return userWorkgroups;
  };

  // Определяет, нужно ли создать новую запись или обновить существующую
  const shouldCreateNewUserCompanyRecord = (userId: number): boolean => {
    const userRole = getUserRoleFromData(userId);
    const userWorkgroups = getUserWorkgroupsInCompany(userId);
    const currentWorkgroup = getUserCurrentWorkgroup(userId);
    

    
    // Если это прораб, овнер добавляет его, и у него уже есть workgroup в этой компании
    const shouldCreate = (
      currentUserRole === Roles.OWNER && 
      userRole === Roles.ADMIN && 
      (userWorkgroups.length > 0 || !!currentWorkgroup)
    );

    return shouldCreate;
  };

  const handleUserToggle = (userId: number) => {
    setUsersToAdd(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveMembers = async () => {
    const currentMemberIds = users?.map(userData => userData.user.id).filter(id => id !== null) as number[] || [];
    const usersToRemove = currentMemberIds.filter(id => !selectedUserIds.includes(id) && canRemoveUserFromWorkgroup(id));
    const usersToAddToGroup = usersToAdd;

    if (usersToRemove.length === 0 && usersToAddToGroup.length === 0) {
      handleCloseMembersModal();
      return;
    }

    setIsSavingMembers(true);
    try {
      const updatePromises: Promise<any>[] = [];
      
      // Удаляем пользователей из бригады (только тех, кого можно удалить)
      for (const userId of usersToRemove) {
        // Ищем пользователя в текущей группе (users - это пользователи именно этой группы)
        const userInCurrentGroup = users?.find(userData => userData.user.id === userId);
        
        if (userInCurrentGroup && userInCurrentGroup.uc?.id) {
          // Проверяем, сколько записей user_company у пользователя в этой компании
          const userRecordsCount = getUserCompanyRecordsCount(userId);
          
          if (userRecordsCount <= 1) {
            // Если это последняя запись - обновляем workgroup_id = null (оставляем связь с компанией)
          updatePromises.push(
              updateUserCompany(userInCurrentGroup.uc.id, { 
              user_id: userId,
              company_id: companyId,
              workgroup_id: null 
            })
          );
          } else {
            // Если есть другие записи - полностью удаляем эту запись
            updatePromises.push(
              deleteUserCompany(userInCurrentGroup.uc.id)
            );
          }
        }
      }
      
      // Добавляем пользователей в бригаду
      for (const userId of usersToAddToGroup) {
        const userToAdd = availableUsers.find(user => user.id === userId);
        if (userToAdd && userToAdd.uc_id) {
          const userRole = getUserRoleFromData(userId);
          const shouldCreate = shouldCreateNewUserCompanyRecord(userId);
          
          // Логика выбора API (ИСПРАВЛЕННАЯ для многогрупповости):
          // 1. ПРИОРИТЕТ: Если это прораб у овнера с существующими группами - создаем дополнительную запись (POST)
          // 2. Иначе если есть uc_id - обновляем существующую запись (UPDATE)  
          // 3. Иначе - ошибка
          
          if (shouldCreate) {
            // ПРИОРИТЕТ: Многогрупповость для прорабов
            updatePromises.push(
              createAdditionalUserCompany({ 
                user_id: userId,
                company_id: companyId,
                workgroup_id: workgroup?.id,
                role: userRole || undefined 
              })
            );
          } else if (userToAdd.uc_id) {
            // Обычный случай: обновляем существующую запись
          updatePromises.push(
            updateUserCompany(userToAdd.uc_id, { 
              user_id: userId,
              company_id: companyId,
              workgroup_id: workgroup?.id 
            })
          );
        }
        }
      }
      
      const results = await Promise.allSettled(updatePromises);
      
      // Проверяем результаты и логируем ошибки
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Ошибка при обновлении записи ${index + 1}:`, result.reason);
        }
      });
      
      handleCloseMembersModal();
      
      await onDataRefresh();
      
    } catch (error) {
      console.error('Error updating workgroup members:', error);
    } finally {
      setIsSavingMembers(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!workgroup?.id) return;

    setIsDeleting(true);
    try {
      if (users && users.length > 0) {
        const updatePromises = users.map(async (userData) => {
          if (userData.user.id && userData.uc) {
            return updateUserCompany(userData.uc.id, {
              user_id: userData.user.id,
              company_id: companyId,
              workgroup_id: null
            });
          }
        });
        
        await Promise.all(updatePromises.filter(promise => promise !== undefined));
      }
      
      await deleteWorkgroup(workgroup.id);
      setIsDeleteModalOpen(false);
      await onDataRefresh();
    } catch (error) {
      console.error('Error deleting workgroup:', error);
    } finally {
      setIsDeleting(false);
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
          </div>
        </div>
        
        <div 
          className={`task-group-scroll overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-80 md:max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{
            overflowY: isExpanded ? 'auto' : 'hidden',
            maxHeight: isExpanded ? 
              (window.innerWidth < 768 ? '20rem' : '24rem') : '0',
            borderTop: isExpanded ? '1px solid rgba(0,0,0,0.1)' : 'none',
            paddingTop: isExpanded ? '8px' : '0'
          }}
        >
          <div
            style={{ height: "1px" }}
            className="w-full bg-white border mt-3"
          />
          {taskboards?.map((task: any) => {
            const { task_points } = task;
            return (
              <div key={task.id}>
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-base font-semibold pb-1">
                        {task.title}
                      </p>
                      {/* <p className="text-xs pb-1" style={{ color: telegramData?.themeParams.button_color || "#3B82F6" }}>
                        Группа: {workgroup.title}
                      </p> */}
                    </div>
                    <p className="text-base font-semibold pb-2">{task.created_at}</p>
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
                                  readOnly
                                  disabled
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
                  {`Участники в группе ${workgroup?.title || 'Неизвестная группа'}:`}
                </p>

                <div>
                  {getDeduplicatedUsers().length > 0 ? (
                    getDeduplicatedUsers().map((userData) => {
                      const { user } = userData;

                      return (
                        <div
                          key={user.id || user.tg_id}
                          className="flex items-center justify-between mb-1"
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
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name}</p>
                              {(() => {
                                const role = getUserRoleFromData(user.id || 0);
                                return role ? <RoleBadge role={role} /> : null;
                              })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openTelegramChat(user)}
                              className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                              aria-label="Open Telegram Chat"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Нет участников</p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    size="s"
                    stretched
                    onClick={handleManageMembersClick}
                    disabled={isLoadingModalData}
                  >
                    {isLoadingModalData ? "Загрузка..." : "Редактировать"}
                  </Button>
                  {currentUserRole === Roles.OWNER && (
                  <Button
                    mode="outline"
                    onClick={handleDeleteClick}
                    className="w-full max-w-xs"
                    style={{
                      border: '2px solid #ff4757',
                      borderRadius: '20px',
                      borderColor: '#ff4757',
                      color: '#ff4757'
                    }}
                  >
                    Удалить  
                  </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
              
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
            className="py-4 px-4 top-shadow-container"
          >
            <h3 className="text-center text-lg font-bold mb-4">
              Участники группы "{workgroup?.title || 'Неизвестная группа'}"
            </h3>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                {currentUserRole === Roles.OWNER 
                  ? "Прорабы могут работать в нескольких бригадах одновременно. Остальные сотрудники будут перемещены из предыдущей бригады."
                  : "Пользователь, находящийся в другой бригаде, будет удален из предыдущей"
                }
              </p>
              {currentUserRole === Roles.ADMIN && (
                <p className="text-sm text-orange-600 text-center mt-2">
                  Вы не можете удалить себя из бригады
                </p>
              )}
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3 text-gray-700">
                Текущие участники ({users?.length || 0})
              </h4>
              {users?.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {users?.map((userData) => (
                    <div
                      key={userData.user.id || userData.user.tg_id}
                      className="flex items-center mb-3"
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(userData.user.id || 0)}
                        onChange={() => handleCurrentMemberToggle(userData.user.id || 0)}
                        className="mr-3"
                        disabled={!canRemoveUserFromWorkgroup(userData.user.id || 0)}
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
                        <div className="flex items-center gap-2 flex-1">
                        <p className="font-medium">{userData.user.name}</p>
                          {(() => {
                            const role = getUserRoleFromData(userData.user.id || 0);
                            return role ? <RoleBadge role={role} /> : null;
                          })()}
                        </div>
                        <button
                          onClick={() => openTelegramChat(userData.user)}
                          className="p-1 text-blue-500 hover:text-blue-600 transition-colors ml-2"
                          aria-label="Open Telegram Chat"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Нет участников в бригаде</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">
                Добавить участников
              </h4>
              <div className="max-h-48 overflow-y-auto">
                {availableUsers.length > 0 ? (
                  availableUsers
                  .filter(user => {
                    const isCurrentlySelected = selectedUserIds.includes(user.id || 0);
                    const isCurrentMember = users?.some(userData => userData.user.id === user.id);
                    
                    return !isCurrentlySelected && !isCurrentMember;
                  })
                    .map((user) => {
                      const userWorkgroups = (user as any).workgroups || [];
                      
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
                              <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name}</p>
                                {(() => {
                                  const role = getUserRoleFromData(user.id || 0);
                                  return role ? <RoleBadge role={role} /> : null;
                                })()}
                                {canAddUserToMultipleWorkgroups(user.id || 0) && userWorkgroups.length > 0 && (
                                  <span className="text-xs text-blue-600">
                                    (создаст дополнительную запись)
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const actualWorkgroups = getUserWorkgroupNameByUserId(user.id || 0);
                                const userRole = getUserRoleFromData(user.id || 0);
                                
                                // Определяем цвет текста в зависимости от роли
                                const isAdmin = userRole === Roles.ADMIN;
                                const textColor = isAdmin ? "text-green-600" : "text-red-600";
                                
                                return actualWorkgroups.length > 0 ? (
                                  <p className={`text-xs ${textColor}`}>
                                    В бригаде: {actualWorkgroups.join(', ')}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500">Не назначен в бригаду</p>
                                );
                              })()}
                            </div>
                            <button
                              onClick={() => openTelegramChat(user)}
                              className="p-1 text-blue-500 hover:text-blue-600 transition-colors ml-2"
                              aria-label="Open Telegram Chat"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                              </svg>
                            </button>
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

        <Modal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          dismissible
          modal={true}
          preventScrollRestoration={true}
        >
          <div
            style={{
              borderTop: "1px solid rgba(220, 38, 38, 0.6)",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
            className="py-4 px-4 top-shadow-container"
          >
            <div className="flex justify-center relative top-[-10px]">
              <SlArrowDown size={26} />
            </div>
            <h3 className="text-center text-lg font-bold mb-4">
              Вы уверены?
            </h3>
            <p className="text-center text-sm text-gray-600 mb-6">
              Это действие удалит рабочую группу "{workgroup?.title || 'Неизвестная группа'}" и уберет всех пользователей из неё. Это действие нельзя отменить.
            </p>

            <div className="flex items-center justify-between">
              <Button
                stretched
                mode="bezeled"
                onClick={handleCloseDeleteModal}
                className="mr-2"
                disabled={isDeleting}
              >
                Отмена
              </Button>
              <Button 
                stretched 
                onClick={handleConfirmDelete} 
                className="ml-2"
                disabled={isDeleting}
                style={{ backgroundColor: '#dc2626' }}
              >
                {isDeleting ? "Удаление" : "Удалить"}
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
