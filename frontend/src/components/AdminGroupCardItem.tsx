import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  Cell,
} from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { IoEyeOffSharp, IoEyeOutline } from "react-icons/io5";
import { PiExclamationMarkFill } from "react-icons/pi";
import { MdOutlineModeEdit } from "react-icons/md";
import doneTasks from "../utils/doneTasks";

interface WorkGroup {
  id: number;
  title: string;
  description: string;
}

interface UserDisplayData {
  id: number;
  name: string;
  photo_url?: string;
  tg_id?: number | null;
}

interface TasksGroup {
  id: number;
  text: string;
  isCompleted: boolean;
  isVisible: boolean;
}

interface AdminGroupCardItemProps {
  workgroup: WorkGroup;
  users: UserDisplayData[];
  taskboards: any[];
}

const AdminGroupCardItem = ({
  workgroup,
  users,
  taskboards,
}: AdminGroupCardItemProps) => {
  console.log(taskboards, "taskboards"); 
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] =
    useState<UserDisplayData | null>(null);
  const [editedUserName, setEditedUserName] = useState("");
  const [editedUserNameError, setEditedUserNameError] = useState(false);

  const telegramData = getTelegramData();

  const [tasks, setTasks] = useState<TasksGroup[]>([
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

  const handleEditClick = (user: UserDisplayData) => {
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
            <p className="text-base font-semibold pb-2">{workgroup.title}</p>
            <span className="text-sm">
              <p>{workgroup.description}</p>
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
              console.log(task_points, "task_points");
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
                        console.log(task, "task");
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
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <Cell
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
                                  {user.name.charAt(0).toUpperCase()}
                                </p>
                              )}
                            </span>

                            <p>{user.name}</p>
                          </div>

                          <div>
                            <MdOutlineModeEdit size={20} />
                          </div>
                        </Cell>
                      ))
                    ) : (
                      <p>Нет участников</p>
                    )}
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
