import { Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useState } from "react";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { IoEyeOffSharp, IoEyeOutline } from "react-icons/io5";
import { PiExclamationMarkFill } from "react-icons/pi";
import { MdOutlineModeEdit } from "react-icons/md";

interface TasksGroup {
  id: number;
  text: string;
  isCompleted: boolean;
  isVisible: boolean;
}

const AdminGroupCard = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
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

  return (
    <div className="p-4">
      <Card
        className="w-full"
        style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div className="flex flex-col items-start gap-2">
            <div className="rounded-md overflow-hidden relative">
              <p className="text-base font-semibold pb-2">Бригада "Альфа"</p>
              <span className="text-sm">
                <p>Занимаются отделкой фасадов на объекте “Чукча”</p>
              </span>
              <div className="mt-4">
                <span className="text-sm flex items-center mt-1">
                  <div
                    style={{ background: "#e53835" }}
                    className="w-2 h-2 bg-red-500 rounded-full mr-2"
                  />
                  <p>4 активные задачи</p>
                </span>

                <span className="text-sm flex items-center mt-1">
                  <div
                    style={{ background: "#007aff" }}
                    className="w-2 h-2 bg-red-500 rounded-full mr-2"
                  />
                  <p>8 выполненных задач</p>
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
            <div className="mt-3 text-sm">
              <div className="flex justify-between">
                <p className="text-base font-semibold pb-2">
                  Уборка территории
                </p>
                <p className="text-base font-semibold pb-2">22.04.2025</p>
              </div>
              <div className="list-disc list-inside">
                {tasks.map((task) => (
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
                            // onClick={() => toggleTaskProblem(task.id)}
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <Checkbox
                            checked={task.isCompleted}
                            onChange={() => toggleTaskCompletion(task.id)}
                          />
                        )}
                      </span>
                      <p
                        className={
                          task.isCompleted ? "line-through text-gray-500" : ""
                        }
                        style={{
                          color: task.isCompleted
                            ? telegramData?.themeParams.hint_color
                            : telegramData?.themeParams.text_color,
                        }}
                      >
                        {task.text}
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
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button
              onClick={toggleExpand}
              className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Назад"
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
      <Card
        className="w-full mt-4"
        style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div className="flex flex-col items-start gap-2">
            <div className="rounded-md overflow-hidden relative w-full">
              <p className="text-sm flex items-center mt-1 mb-2">Участники:</p>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="w-5 h-5 bg-red-500 rounded-full mr-2">
                      {/* <img src="" alt="avatar" /> */}
                    </span>
                    <p>Иван Иванов</p>
                  </div>
                  <div>
                    <MdOutlineModeEdit size={20} />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="w-5 h-5 bg-red-500 rounded-full mr-2">
                      {/* <img src="" alt="avatar" /> */}
                    </span>
                    <p>Петр Петров</p>
                  </div>
                  <div>
                    <MdOutlineModeEdit size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminGroupCard;
