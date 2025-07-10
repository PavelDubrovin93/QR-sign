import { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox, Button, CompactPagination } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useParams } from "react-router-dom";
import { SlClose } from "react-icons/sl";
import useDnDpoints from "../utils/hooks/useDnDpoints";
import { getTaskById } from "../api/task/get-taskbyId";
import type { Task, TaskPoint } from "../@types/task";
import { FiTrash2 } from "react-icons/fi";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


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
  const telegramData = getTelegramData();
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  const thumbnailRef = useRef<HTMLImageElement>(null);
  const fullSizeRef = useRef<HTMLImageElement>(null);
  const transformRef = useRef<any>(null);
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

  const centerOnPoint = useCallback((_point: TaskPoint) => {
    if (!transformRef.current) return;
    
    // Простое приближение на 2.5x
    transformRef.current.zoomToElement("image", 2.5, 300);
  }, []);

  const resetImageTransform = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform(300);
    }
  }, []);

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
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const newXPercent = (clickX / rect.width) * 100;
    const newYPercent = (clickY / rect.height) * 100;

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
  console.log(currentScale);
  return (
    <div className="p-4 pt-0">
      {/* Модалка с изображением */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            {currentScale > 1 && (
              <button
                className="bg-black bg-opacity-50 text-white p-2 rounded-full"
                onClick={resetImageTransform}
                title="Сбросить приближение"
              >
                <span className="text-sm">1:1</span>
              </button>
            )}
            <button
              className="text-white"
              onClick={() => {
                setIsFullScreen(false);
                setActivePoint(null);
                resetImageTransform();
                if (isDragging) handleDragEnd();
              }}
            >
              <SlClose size={24} />
            </button>
          </div>

          {/* Изображение */}
          <div style={{
            cursor: editMode && !isDragging ? "crosshair" : "default",
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={1}
              maxScale={5}
              centerOnInit={true}
              limitToBounds={false}
              disabled={isDragging}
              onTransformed={(_ref, state) => {
                setCurrentScale(state.scale);
              }}
              pinch={{ 
                disabled: false,
                step: 5 
              }}
              panning={{ 
                disabled: false,
                velocityDisabled: true 
              }}
              wheel={{ disabled: false }}
              doubleClick={{ 
                disabled: false,
                step: 2
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                contentStyle={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    id="image"
                    ref={fullSizeRef}
                    src={image || ""}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain"
                    onClick={editMode ? handleImageClick : undefined}
                    onLoad={updateRenderedImageRect}
                    style={{
                      userSelect: "none",
                      pointerEvents: editMode ? "auto" : "none",
                      display: "block",
                    }}
                  />

                  {/* Точки ВНУТРИ трансформации */}
                  {taskPoints.map((point) => (
                    <div
                      key={point.id}
                      className={`absolute cursor-pointer ${
                        isDragging && draggedPointId === point.id ? "z-51" : "z-40"
                      }`}
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        transform: `translate(-50%, -50%) scale(${Math.max(1 / currentScale, 0.5)})`,
                        pointerEvents: 'auto',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDragStart(e, point);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDragStart(e, point);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
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
                  ))}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>

          {/* Информация о задаче всегда снизу */}
          {activePoint && (
            <div
              className="z-100001 fixed bottom-0 left-4 right-0 bg-opacity-90 rounded-lg shadow-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: telegramData?.themeParams.section_bg_color,
                marginBottom: '16px',
                marginRight: '16px',
                background: 'var(--tgui--secondary_bg_color)'
              }}
            >

              {/* Section 1: Name */}
              <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {activePoint.id}
                    </span>
                    <input
                      disabled={!editMode}
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
                      className="w-full text-lg font-semibold bg-transparent border-none outline-none"
                      placeholder="Название задачи"
                      style={{
                        color: telegramData?.themeParams.text_color || "#000000",
                      }}
                    />

                    {editMode && (
                      <FiTrash2 className="text-red-500" size={24} onClick={() => {
                          setTaskPoints((prevPoints) =>
                            prevPoints.filter((p) => p.id !== activePoint.id)
                          );
                          setActivePoint(null);
                        }}   
                      />
                    )}

                  </div>
                  
              </div>

              {/* Section 2: Description */}
              <div className="p-4 border-b border-gray-200">
                {editMode ? (
                  <textarea
                    value={activePoint.description}
                    onChange={(e) => {
                      const newDescription = e.target.value;
                      setTaskPoints((prevPoints) => {
                        const updatedPoints = prevPoints.map((p) =>
                          p.id === activePoint.id
                            ? { ...p, description: newDescription }
                            : p
                        );
                        setActivePoint(
                          updatedPoints.find((p) => p.id === activePoint.id) ||
                            null
                        );
                        return updatedPoints;
                      });
                    }}
                    rows={3}
                    className="w-full text-sm bg-transparent border border-gray-300 rounded p-2 resize-none"
                    placeholder="Описание задачи"
                    style={{
                      backgroundColor:
                        telegramData?.colorScheme === "dark" ? "#444" : "#f9f9f9",
                      color: telegramData?.themeParams.text_color || "#000000",
                      borderColor: telegramData?.colorScheme === "dark" ? "#666" : "#ddd",
                    }}
                  />
                ) : (
                  <p
                    className="text-sm text-gray-600 leading-relaxed"
                    style={{ color: telegramData?.themeParams.hint_color }}
                  >
                    {activePoint.description || "Описание отсутствует"}
                  </p>
                )}
              </div>

              {/* Section 3: Bottom Controls */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <label
                      className="flex items-center text-sm"
                      style={{ color: telegramData?.themeParams.text_color }}
                    >
                      <Checkbox
                        disabled={!editMode}
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
                      {activePoint.completed ? "Выполнено" : "Не выполнено"}
                    </label>
                  </div>
                </div>
               
                <Button
                  mode="filled"
                  onClick={() => setActivePoint(null)}
                  className="w-full max-w-xs mb-2"
                >
                  Свернуть  
                </Button>

              </div>

              {/* Section 4: Bottom pagination */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'var(--tgui--secondary_bg_color)',
                  padding: 20,
                  width: '100%',
                }}
              >
                <CompactPagination>
                  {taskPoints.map((point) => (
                    <CompactPagination.Item
                      key={point.id}
                      selected={activePoint?.id === point.id}
                      onClick={() => {
                        setActivePoint(point);
                        centerOnPoint(point);
                      }}
                    >
                      {point.id}
                    </CompactPagination.Item>
                  ))}
                </CompactPagination>
              </div>
              
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
