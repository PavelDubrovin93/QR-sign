import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useNavigate, useParams } from "react-router-dom";
import { SlArrowLeft, SlClose } from "react-icons/sl";

import TestImage from "../assets/test_image.jpeg";
import AudioMessageComposer from "./AudioMessageComposer";
import Waveform from "./Waveform";
import useDnDpoints from "../utils/hooks/useDnDpoints";
import { getTaskById } from "../api/task/get-taskbyId";
import type { Task, TaskPoint } from "../@types/task";
import { editTask } from "../api/task/edit-task";

interface ImageUploadProps {
  editMode: boolean;
  image: string | null;
  taskPoints: TaskPoint[];
  setTaskPoints: React.Dispatch<React.SetStateAction<TaskPoint[]>>;
  activePoint: TaskPoint | null;
  setActivePoint: React.Dispatch<React.SetStateAction<TaskPoint | null>>;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

function TaskCard({ editMode, image, taskPoints, setTaskPoints, activePoint, setActivePoint, onFullScreenChange }: ImageUploadProps) {
  const mockAudioUrl =
    "https://api.twilio.com/2010-04-01/Accounts/AC25aa00521bfac6d667f13fec086072df/Recordings/RE6d44bc34911342ce03d6ad290b66580c.mp3";
  const telegramData = getTelegramData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const thumbnailRef = useRef<HTMLImageElement>(null);
  const fullSizeRef = useRef<HTMLImageElement>(null);
  const [renderedImageRect, setRenderedImageRect] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const fetchAndSetTaskData = useCallback(async () => {
    if (!id) return;

    try {
      const res = await getTaskById(id);
      if (res.data) {
        const mappedTaskPoints: TaskPoint[] = res.data.task_points.map(
          (point: any) => ({
            ...point,
            completed: !!point.done_at,
            x: point.coordinates[0],
            y: point.coordinates[1],
          })
        );
        setTask({ ...res.data, task_points: mappedTaskPoints });
        setTaskPoints(mappedTaskPoints);
      }
    } catch (e: any) {
      console.error("Ошибка при получении данных задачи:", e);
    }
  }, [id]);

  useEffect(() => {
    fetchAndSetTaskData();
  }, []);

  useEffect(() => {
    if (onFullScreenChange) {
      onFullScreenChange(isFullScreen);
    }
  }, [isFullScreen, onFullScreenChange]);

  const { isDragging, draggedPointId, handleDragStart, handleDragEnd } =
    useDnDpoints({
      editMode,
      setTaskPoints,
      activePoint,
      setActivePoint,
      renderedImageRect,
    });

  const updateRenderedImageRect = useCallback(() => {
    if (!fullSizeRef.current) return;

    const img = fullSizeRef.current;
    const imgRect = img.getBoundingClientRect();

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    let actualWidth = imgRect.width;
    let actualHeight = imgRect.height;
    let actualLeft = imgRect.left;
    let actualTop = imgRect.top;

    if (naturalWidth && naturalHeight) {
      const aspectRatio = naturalWidth / naturalHeight;
      const containerAspectRatio = imgRect.width / imgRect.height;

      if (aspectRatio > containerAspectRatio) {
        actualHeight = imgRect.width / aspectRatio;
        actualTop = imgRect.top + (imgRect.height - actualHeight) / 2;
      } else {
        actualWidth = imgRect.height * aspectRatio;
        actualLeft = imgRect.left + (imgRect.width - actualWidth) / 2;
      }
    }
    setRenderedImageRect({
      width: actualWidth,
      height: actualHeight,
      left: actualLeft,
      top: actualTop,
    });
  }, []);

  useEffect(() => {
    if (fullSizeRef.current) {
      fullSizeRef.current.onload = updateRenderedImageRect;
    }

    window.addEventListener("resize", updateRenderedImageRect);

    updateRenderedImageRect();
    setTimeout(updateRenderedImageRect, 100);

    return () => {
      window.removeEventListener("resize", updateRenderedImageRect);
      if (fullSizeRef.current) {
        fullSizeRef.current.onload = null;
      }
    };
  }, [updateRenderedImageRect]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (
      !editMode ||
      isDragging ||
      !renderedImageRect.width ||
      !renderedImageRect.height
    )
      return;

    const target = e.currentTarget as HTMLImageElement;
    const rect = target.getBoundingClientRect();
    
    const clickXRelativeToImagePx = e.clientX - rect.left;
    const clickYRelativeToImagePx = e.clientY - rect.top;

    const newXPercent =
      (clickXRelativeToImagePx / rect.width) * 100;
    const newYPercent =
      (clickYRelativeToImagePx / rect.height) * 100;

    if (
      newXPercent >= 0 &&
      newXPercent <= 100 &&
      newYPercent >= 0 &&
      newYPercent <= 100
    ) {
      const newPoint: TaskPoint = {
        id:
          taskPoints.length > 0
            ? Math.max(...taskPoints.map((p) => p.id)) + 1
            : 1,
        title: "",
        taskboard_id: task?.id || 0,
        thumbnails: "",
        mark_icon: "",
        coordinates: [newXPercent, newYPercent],
        qrcode: "",
        description: "",
        points: [],
        voice_message: null,
        done_at: null,
        issued_at: null,
        warning_at: null,
        completed: false,
        x: newXPercent,
        y: newYPercent,
      };
      setTaskPoints((prevPoints) => [...prevPoints, newPoint]);
      setActivePoint(newPoint);
    }
  };

  const handleEditTask = async () => {
    if (!task) return;

    if (isDragging) handleDragEnd();

    const pointsToSend = taskPoints.map((p) => ({
      id: p.id,
      title: p.title,
      taskboard_id: p.taskboard_id,
      thumbnails: p.thumbnails,
      mark_icon: p.mark_icon,
      coordinates: [p.x, p.y],
      qrcode: p.qrcode,
      points: [],
      description: p.description,
      voice_message: p.voice_message,
      done_at: p.completed ? p.done_at || new Date().toISOString() : null,
      issued_at: p.issued_at,
      warning_at: p.warning_at,
    })) as unknown as TaskPoint[];

    const taskDataToSend: Task = {
      ...task,
      task_points: pointsToSend,
      done_at: task.done_at || null,
    };

    console.log("Отправляем данные задачи на редактирование:", taskDataToSend);

    try {
      const res = await editTask(taskDataToSend);
      if (res.status === 200 || res.status === 201) {
        alert("Изменения успешно сохранены!");
        setIsFullScreen(false);
        await fetchAndSetTaskData();
      } else {
        alert("Ошибка при сохранении изменений.");
        console.error("API response error:", res);
      }
    } catch (e: any) {
      alert("Произошла ошибка при отправке данных.");
      console.error("Ошибка при редактировании задачи:", e);
    }
  };

  return (
    <div className="p-4 pt-0">
      {/* Модалка с изображением */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* {editMode && (
            <Button
              style={{ position: "absolute", top: "10px", left: "10px" }}
              onClick={handleEditTask}
            >
              Сохранить изменения
            </Button>
          )} */}
          <button
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => {
              setIsFullScreen(false);
              setActivePoint(null);
              if (isDragging) handleDragEnd();
            }}
          >
            <SlClose size={24} />
          </button>

          {/* Изображение */}
          <img
            ref={fullSizeRef}
            src={image || ""}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={editMode ? handleImageClick : undefined}
            onLoad={updateRenderedImageRect}
            style={{
              cursor: editMode && !isDragging ? "crosshair" : "default",
            }}
          />

          {/* Точки поверх изображения */}
          {taskPoints.map((point) => {
            if (!fullSizeRef.current) return null;
            
            const imgRect = fullSizeRef.current.getBoundingClientRect();
            const pixelX = (point.x / 100) * imgRect.width;
            const pixelY = (point.y / 100) * imgRect.height;
            
            return (
              <div
                key={point.id}
                className={`absolute cursor-pointer ${
                  isDragging && draggedPointId === point.id ? "z-50" : "z-40"
                }`}
                style={{
                  left: `${pixelX + imgRect.left}px`,
                  top: `${pixelY + imgRect.top}px`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseDown={(e) => handleDragStart(e, point)}
                onTouchStart={(e) => handleDragStart(e, point)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDragging) {
                    setActivePoint(
                      taskPoints.find((p) => p.id === point.id) || null
                    );
                  }
                }}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full transition-all duration-100 ${
                    activePoint?.id === point.id && editMode ? "pulse" : ""
                  }`}
                  style={{
                    backgroundColor: point.completed
                      ? "#10B981"
                      : telegramData?.themeParams.button_color || "#3B82F6",
                  }}
                >
                  {point.id}
                </div>
              </div>
            );
          })}

          {/* Информация о задаче всегда снизу */}
          {activePoint && (
            <div
              className="z-51 fixed bottom-4 left-4 right-4 p-3 bg-white bg-opacity-90 rounded-lg shadow-md"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: telegramData?.themeParams.section_bg_color,
              }}
            >
              <h3 className="font-semibold text-lg text-gray-600">
                {activePoint.title}
              </h3>
              <div className="flex items-center justify-between">
                <p
                  className="text-sm text-gray-600"
                  style={{ color: telegramData?.themeParams.text_color }}
                >
                  ID: {activePoint.id},{" "}
                  {activePoint.completed ? "Выполнено" : "Не выполнено"}
                </p>
                {editMode && (
                  <button
                    className="text-sm text-red-500"
                    onClick={() => {
                      setTaskPoints((prev) =>
                        prev.filter((p) => p.id !== activePoint.id)
                      );
                      setActivePoint(null);
                    }}
                  >
                    Удалить точку
                  </button>
                )}
              </div>
              {editMode && (
                <div className="mt-2">
                  <input
                    value={activePoint.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setTaskPoints((prevPoints) => {
                        const updatedPoints = prevPoints.map((p) =>
                          p.id === activePoint.id
                            ? { ...p, title: newTitle }
                            : p
                        );
                        setActivePoint(
                          updatedPoints.find((p) => p.id === activePoint.id) ||
                            null
                        );
                        return updatedPoints;
                      });
                    }}
                    className="w-full border rounded p-1 mb-1"
                    placeholder="Изменить название задачи"
                    style={{
                      backgroundColor:
                        telegramData?.colorScheme === "dark" ? "#444" : "#eee",
                      color: telegramData?.themeParams.text_color || "#000000",
                    }}
                  />
                  <label
                    className="flex items-center text-sm"
                    style={{ color: telegramData?.themeParams.text_color }}
                  >
                    <Checkbox
                      disabled={editMode ? true : false}
                      checked={activePoint.completed}
                      onChange={(e) => {
                        const newCompleted = e.target.checked;
                        setTaskPoints((prevPoints) => {
                          const updatedPoints = prevPoints.map((p) =>
                            p.id === activePoint.id
                              ? {
                                  ...p,
                                  completed: newCompleted,
                                  done_at: newCompleted
                                    ? new Date().toISOString()
                                    : null,
                                }
                              : p
                          );
                          setActivePoint(
                            updatedPoints.find(
                              (p) => p.id === activePoint.id
                            ) || null
                          );
                          return updatedPoints;
                        });
                      }}
                      className="mr-2"
                    />
                    Выполнено
                  </label>
                </div>
              )}
              <button
                className="mt-2 text-sm text-blue-500"
                onClick={() => setActivePoint(null)}
                style={{ color: telegramData?.themeParams.button_color }}
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      )}

      {/* Основной контент */}
      <div
        className="w-full"
        style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
      >
        
        <div
              className="rounded-md overflow-hidden relative cursor-pointer"
              onClick={() => setIsFullScreen(true)}
            >
              <img
                ref={thumbnailRef}
                alt="Task image"
                src={image || ""}
                className="w-full h-auto object-cover rounded-xl p-2 pb-0"
              />
              {/* Точки поверх мини-изображения, управляются состоянием taskPoints */}
              {taskPoints.map((point) => (
                <div
                  key={point.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: point.completed
                        ? "#10B981"
                        : telegramData?.themeParams.button_color || "#3B82F6",
                    }}
                  >
                    {point.id}
                  </div>
                </div>
              ))}
            </div>
      </div>
      
    </div>
  );
}

export default TaskCard;
