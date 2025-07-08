import { useEffect, useState } from "react";
import { Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useNavigate } from "react-router-dom";
import { SlArrowRight } from "react-icons/sl";
import type { TaskBoard, TaskPoint } from "../@types/task";

interface TaskCardProps {
  data: TaskBoard;
  path: string;
}

function TaskCard({ data, path }: TaskCardProps) {
  const telegramData = getTelegramData();
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setTaskPoints(data?.task_points);
  }, [data]);

  return (
    <div className="p-4">
      <Card
        className="w-full"
        style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
        onClick={() => navigate(path)}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div className="flex flex-col items-start gap-2">
            <div className="rounded-md overflow-hidden relative">
              <img
                alt="Task image"
                // src="test_image.jpeg"
                src={`${data?.image}`}
                className="w-full h-auto object-cover rounded-xl p-2 pb-0"
              />

              {/* Точки поверх изображения */}
              {taskPoints?.map((point) => {
                return (
                  <div
                    key={point.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${point.coordinates[0]}%`,
                      top: `${point.coordinates[1]}%`,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
                      style={{
                        backgroundColor: point.done_at
                          ? "#10B981"
                          : telegramData?.themeParams.button_color || "#3B82F6",
                      }}
                    >
                      {point.id}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-left pl-2 pr-2 relative  w-full">
              <p className="text-base font-semibold pb-2">{data?.title}</p>
              {taskPoints?.map((point) => {
                return (
                  <div key={point.id} className="flex items-start gap-2 pb-2">
                    <Checkbox checked={!!point.done_at} readOnly />
                    <span className="text-sm">{point.title}</span>
                  </div>
                );
              })}
              <div className="flex justify-end mt-2 absolute right-[0px] bottom-[0px]">
                <button
                  className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Назад"
                >
                  <SlArrowRight
                    size={24}
                    color={telegramData?.themeParams.button_color}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TaskCard;
// const taskPoints: TaskPoint[] = [
//     { id: 1, x: 30, y: 40, title: 'Убрать цветок', done_at: "2025-07-02 19:43:13.749616+00" },
//     { id: 2, x: 70, y: 60, title: 'Замена фасала', done_at: null },
//     { id: 3, x: 50, y: 80, title: 'Перекрасить в синий', done_at: null },
// ];
