import { useEffect, useState, useRef, useCallback } from "react";
import { Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useNavigate } from "react-router-dom";
import { SlArrowRight } from "react-icons/sl";
import type { TaskBoard, TaskPoint } from "../@types/task";
import type { WorkGroup } from "../@types/group";

interface TaskCardProps {
  data: TaskBoard;
  path: string;
  workGroups?: WorkGroup[];
  isSelected?: boolean;
  selectionMode?: boolean;
  onLongPress?: (taskBoardId: number) => void;
  onSelect?: (taskBoardId: number) => void;
}

function TaskCard({ data, path, workGroups = [], isSelected = false, selectionMode = false, onLongPress, onSelect }: TaskCardProps) {
  const telegramData = getTelegramData();
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([]);
  const navigate = useNavigate();

  // Функция для получения названия workgroup
  const getWorkGroupName = useCallback((workGroupId: number) => {
    const workGroup = workGroups.find(wg => wg.id === workGroupId);
    return workGroup?.title || '';
  }, [workGroups]);

  // Функция для получения порядкового номера точки
  const getPointDisplayNumber = useCallback((point: any, index: number) => {
    console.log(point);
    return index + 1;
  }, []);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  useEffect(() => {
    setTaskPoints(data?.task_points || []);
  }, [data]);

  const handleTouchStart = (e: React.TouchEvent) => {
    isLongPress.current = false;
    hasMoved.current = false;
    
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    
    pressTimer.current = setTimeout(() => {
      if (!hasMoved.current) {
        isLongPress.current = true;
        onLongPress?.(data.id);
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.current.x);
    const deltaY = Math.abs(touch.clientY - touchStart.current.y);
    
    // Если палец сдвинулся больше чем на 10px, считаем это скроллом
    if (deltaX > 10 || deltaY > 10) {
      hasMoved.current = true;
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (!isLongPress.current && !hasMoved.current) {
      e.preventDefault();
      e.stopPropagation(); // Предотвращаем всплытие события
      console.log('Short tap detected, selectionMode:', selectionMode, 'path:', path);
      if (selectionMode) {
        onSelect?.(data.id);
      } else {
        navigate(path);
      }
    }
  };



  const handleTouchCancel = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    hasMoved.current = false;
  };

  return (
    <div className="p-4">
      <Card
        className="w-full"
        style={{ 
          backgroundColor: telegramData?.themeParams.section_bg_color,
          boxShadow: isSelected ? `0 0 0 3px ${telegramData?.themeParams.button_color || '#2a90ff'}` : undefined,
          opacity: isSelected ? 0.8 : 1
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div className="flex flex-col items-start gap-2">
            <div className="rounded-md overflow-hidden relative">
              {isSelected && (
                <div 
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: telegramData?.themeParams.button_color || '#2a90ff',
                    color: telegramData?.themeParams.button_text_color || '#ffffff'
                  }}
                >
                  ✓
                </div>
              )}
              <img
                alt="Task image"
                // src="test_image.jpeg"
                src={`${data?.image}`}
                className="w-full h-auto object-cover rounded-xl p-2 pb-0"
              />

              {/* Точки поверх изображения */}
              {taskPoints?.map((point, index) => {
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
                      {getPointDisplayNumber(point, index)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-left pl-2 pr-2 relative  w-full">
              <p className="text-base font-semibold pb-1">{data?.title}</p>
              {data?.work_group_id && (
                <p className="text-xs pb-2" style={{ color: telegramData?.themeParams.button_color || "#3B82F6" }}>
                  Группа: {getWorkGroupName(data.work_group_id)}
                </p>
              )}
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
