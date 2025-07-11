import React, { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox, Button, CompactPagination } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useParams } from "react-router-dom";
import { SlClose } from "react-icons/sl";
import { getTaskById } from "../api/task/get-taskbyId";
import type { Task, TaskPoint } from "../@types/task";
import { FiTrash2, FiLock, FiUnlock } from "react-icons/fi";
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
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointId, setDraggedPointId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const thumbnailRef = useRef<HTMLImageElement>(null);
  const fullSizeRef = useRef<HTMLImageElement>(null);
  const transformRef = useRef<any>(null);
  const [renderedImageRect, setRenderedImageRect] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const [modalBottomOffset, setModalBottomOffset] = useState(16);

  useEffect(() => {
    if (!activePoint) return;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDifference = windowHeight - viewportHeight;
        
        if (heightDifference > 150) { 
          setModalBottomOffset(16 + Math.min(heightDifference, 250));
        } else {
          setModalBottomOffset(16);
        }
      } else {
        const initialViewportHeight = window.innerHeight;
        const currentViewportHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentViewportHeight;
        
        if (heightDifference > 100) {
          setModalBottomOffset(16 + Math.min(heightDifference - 50, 200));
        } else {
          setModalBottomOffset(16);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
    };
  }, [activePoint]);

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

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, point: TaskPoint) => {
    if (!editMode) return;
    
    setIsDragging(true);
    setDraggedPointId(point.id);
    setActivePoint(point);
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (fullSizeRef.current) {
      const imgRect = fullSizeRef.current.getBoundingClientRect();
      const pointX = imgRect.left + (point.x / 100) * imgRect.width;
      const pointY = imgRect.top + (point.y / 100) * imgRect.height;
      
      setDragOffset({
        x: clientX - pointX,
        y: clientY - pointY,
      });
    }
  }, [editMode, setActivePoint]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !draggedPointId || !fullSizeRef.current) return;
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const imgRect = fullSizeRef.current.getBoundingClientRect();
    
    const newX = clientX - dragOffset.x - imgRect.left;
    const newY = clientY - dragOffset.y - imgRect.top;
    
    const newXPercent = Math.max(0, Math.min(100, (newX / imgRect.width) * 100));
    const newYPercent = Math.max(0, Math.min(100, (newY / imgRect.height) * 100));
    
    setTaskPoints((prevPoints) => {
      const updatedPoints = prevPoints.map((p) =>
        p.id === draggedPointId
          ? { ...p, x: newXPercent, y: newYPercent }
          : p
      );
      
      const updatedActivePoint = updatedPoints.find((p) => p.id === draggedPointId);
      if (updatedActivePoint) {
        setActivePoint(updatedActivePoint);
      }
      
      return updatedPoints;
    });
    
    e.preventDefault();
  }, [isDragging, draggedPointId, dragOffset, setTaskPoints, setActivePoint]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedPointId(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const updateRenderedImageRect = useCallback(() => {
    if (fullSizeRef.current) {
      const rect = fullSizeRef.current.getBoundingClientRect();
      setRenderedImageRect({
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      });
    }
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

  const centerOnPoint = useCallback((point: TaskPoint) => {
    if (!transformRef.current || !fullSizeRef.current) return;
    
    transformRef.current.resetTransform(0);
    
    setTimeout(() => {
      if (!transformRef.current || !fullSizeRef.current) return;
      
      const img = fullSizeRef.current;
      
      const waitForImageLoad = () => {
        const imgRect = img.getBoundingClientRect();
        if (imgRect.width === 0 || imgRect.height === 0) {
          setTimeout(waitForImageLoad, 50);
          return;
        }
        
        const pointXPx = (point.x / 100) * imgRect.width;
        const pointYPx = (point.y / 100) * imgRect.height;
        
        const container = img.closest('.react-transform-component');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        const scale = 2.5;
        const finalX = centerX - (pointXPx * scale);
        const finalY = centerY - (pointYPx * scale);
        
        transformRef.current?.setTransform(finalX, finalY, scale, 300);
      };
      
      waitForImageLoad();
    }, 100);
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
              className="z-100001 bg-opacity-90 rounded-lg shadow-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                height: '200px',
                backgroundColor: telegramData?.themeParams.section_bg_color,
                marginRight: '16px',
                background: 'var(--tgui--secondary_bg_color)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                bottom: `${modalBottomOffset}px`,
                left: '16px',
                right: '16px',
                zIndex: 100001
              }}
            >

              <div 
                style={{
                  flex: 1,
                  overflow: 'auto',
                  paddingRight: '4px'
                }}
              >
                {/* Section 1: Name */}
                <div className="p-2 border-b ">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {activePoint.id}
                      </span>
                      <input
                        disabled={!editMode || activePoint.locked}
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
                        className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
                        placeholder="Название задачи"
                        style={{
                          color: telegramData?.themeParams.text_color || "#000000",
                          opacity: activePoint.locked ? 0.6 : 1
                        }}
                      />

                      {editMode && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setTaskPoints((prevPoints) => {
                                const updatedPoints = prevPoints.map((p) =>
                                  p.id === activePoint.id
                                    ? { ...p, locked: !p.locked }
                                    : p
                                );
                                setActivePoint(
                                  updatedPoints.find((p) => p.id === activePoint.id) ||
                                    null
                                );
                                return updatedPoints;
                              });
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {activePoint.locked ? (
                              <FiLock size={16} />
                            ) : (
                              <FiUnlock size={16} />
                            )}
                          </button>
                          
                          <FiTrash2 
                            className="text-red-500" 
                            size={18} 
                            onClick={() => {
                              setTaskPoints((prevPoints) =>
                                prevPoints.filter((p) => p.id !== activePoint.id)
                              );
                              setActivePoint(null);
                            }}   
                          />
                        </div>
                      )}

                    </div>
                    
                </div>

                {/* Section 2: Description */}
                <div className="p-2 border-b ">
                  {editMode ? (
                    <textarea
                      disabled={!editMode || activePoint.locked}
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
                      rows={2}
                      className="w-full text-xs bg-transparent border border-gray-300 rounded p-1 resize-none"
                      placeholder="Описание задачи"
                      style={{
                        backgroundColor:
                          telegramData?.colorScheme === "dark" ? "#444" : "#f9f9f9",
                        color: telegramData?.themeParams.text_color || "#000000",
                        borderColor: telegramData?.colorScheme === "dark" ? "#666" : "#ddd",
                        opacity: activePoint.locked ? 0.6 : 1
                      }}
                    />
                  ) : (
                    <p
                      className="text-xs text-gray-600 leading-relaxed"
                      style={{ color: telegramData?.themeParams.hint_color }}
                    >
                      {activePoint.description || "Описание отсутствует"}
                    </p>
                  )}
                </div>

                {/* Section 3: Bottom Controls */}
                <div className="p-2 border-b ">
                  <div className="flex items-center justify-between">
                    <label
                      className="flex items-center text-xs"
                      style={{ color: telegramData?.themeParams.text_color }}
                    >
                      <Checkbox
                        disabled={!editMode || activePoint.locked}
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
                        className="mr-1 scale-75"
                        style={{ opacity: activePoint.locked ? 0.6 : 1 }}
                      />
                      {activePoint.completed ? "Выполнено" : "Не выполнено"}
                    </label>
                    
                    <Button
                      mode="filled"
                      onClick={() => setActivePoint(null)}
                      className="text-xs px-3 py-1"
                      size="s"
                    >
                      Свернуть  
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section 4: Bottom pagination - Fixed at bottom */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'var(--tgui--secondary_bg_color)',
                  padding: '8px',
                  width: '100%',
                  flexShrink: 0
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
