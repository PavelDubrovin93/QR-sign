import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Checkbox, CompactPagination } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useNavigate, useParams } from "react-router-dom";
import { SlArrowLeft } from "react-icons/sl";
import { FiTrash2, FiLock, FiUnlock, FiChevronLeft, FiChevronRight, FiChevronDown } from "react-icons/fi";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import AudioMessageComposer from "./AudioMessageComposer";
import Waveform from "./Waveform";
import { getTaskById } from "../api/task/get-taskbyId";
import type { Task, TaskPoint } from "../@types/task";
import { editTask } from "../api/task/edit-task";
import { deleteTask } from "../api/task/delete-task";

interface TaskCardProps {
  editMode: boolean;
}

function TaskCard({ editMode }: TaskCardProps) {
  const mockAudioUrl =
    "https://api.twilio.com/2010-04-01/Accounts/AC25aa00521bfac6d667f13fec086072df/Recordings/RE6d44bc34911342ce03d6ad290b66580c.mp3";
  const telegramData = getTelegramData();
  const navigate = useNavigate();
  const { taskboard_id } = useParams<{ taskboard_id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);
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
  const [isPointPanelVisible, setIsPointPanelVisible] = useState(false);
  const [isPointPanelAnimating, setIsPointPanelAnimating] = useState(false);

  // отступ для пагинации
  const calculatePaginationOffset = useCallback(() => {
    if (taskPoints.length === 0) return 0;
    const pointsPerRow = 14;
    const rows = Math.ceil(taskPoints.length / pointsPerRow);
 
    const paginationHeight = 28 + (rows * 18) + ((rows - 1) * 4); 
    return paginationHeight;
  }, [taskPoints.length]);

  // Управление видимостью панели с анимацией
  useEffect(() => {
    if (activePoint) {
      setIsPointPanelVisible(true);
      const timer = setTimeout(() => setIsPointPanelAnimating(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsPointPanelAnimating(false);
      const timer = setTimeout(() => setIsPointPanelVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [activePoint]);

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
    if (!taskboard_id) return;

    try {
      const res = await getTaskById(taskboard_id);
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
  }, [taskboard_id]);

  useEffect(() => {
    fetchAndSetTaskData();
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, point: TaskPoint) => {
    if (!editMode || point.locked) return;
    
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
    
    transformRef.current.resetTransform(300);
    
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
        
        transformRef.current?.setTransform(finalX, finalY, scale, 500);
      };
      
      waitForImageLoad();
    }, 350); 
  }, []);

  const resetImageTransform = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform(300);
    }
  }, []);

  // Навигация по точкам
  const goToNextPoint = useCallback(() => {
    if (taskPoints.length === 0) return;
    
    const currentIndex = activePoint 
      ? taskPoints.findIndex(p => p.id === activePoint.id)
      : -1;
    
    const nextIndex = currentIndex < taskPoints.length - 1 ? currentIndex + 1 : 0;
    const nextPoint = taskPoints[nextIndex];
    
    setActivePoint(nextPoint);
    centerOnPoint(nextPoint);
  }, [taskPoints, activePoint, centerOnPoint]);

  const goToPreviousPoint = useCallback(() => {
    if (taskPoints.length === 0) return;
    
    const currentIndex = activePoint 
      ? taskPoints.findIndex(p => p.id === activePoint.id)
      : -1;
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : taskPoints.length - 1;
    const prevPoint = taskPoints[prevIndex];
    
    setActivePoint(prevPoint);
    centerOnPoint(prevPoint);
  }, [taskPoints, activePoint, centerOnPoint]);

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

  const handleEditTaskByEmployer = async (updatedPoints: TaskPoint[]) => {
    if (!task) {
      console.warn("Попытка сохранить задачу, когда 'task' не определена.");
      return;
    }

    if (isDragging) handleDragEnd();
    const pointsToSend = updatedPoints.map((p) => ({
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
      done_at: p.completed ? p.done_at : null,
      issued_at: p.issued_at,
      warning_at: p.warning_at,
    })) as unknown as TaskPoint[];

    const taskDataToSend: Task = {
      ...task,
      task_points: pointsToSend,
      done_at: task.done_at || null,
    };

    console.log(
      "Отправляем данные задачи на редактирование (по клику работодателя):",
      taskDataToSend
    );

    try {
      const res = await editTask(taskDataToSend);
      if (res.status === 200 || res.status === 201) {
        console.log("Изменения успешно сохранены (по клику работодателя).");
        await fetchAndSetTaskData();
      } else {
        alert("Ошибка при сохранении изменений по клику работодателя.");
        console.error("API response error (employer click):", res);
      }
    } catch (e: any) {
      alert("Произошла ошибка при отправке данных по клику работодателя.");
      console.error("Ошибка при редактировании задачи (employer click):", e);
    }
  };

  const handleDeleteTask = async () => {
    if (!task?.id) {
      console.warn("Попытка удалить задачу без ID.");
      return;
    }

    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить."
    );

    if (!confirmDelete) return;

    try {
      const res = await deleteTask(task.id);
      if (res.status === 200 || res.status === 204) {
        alert("Задача успешно удалена!");
        navigate(-1);
      } else {
        alert("Ошибка при удалении задачи.");
        console.error("API response error:", res);
      }
    } catch (e: any) {
      alert("Произошла ошибка при удалении задачи.");
      console.error("Ошибка при удалении задачи:", e);
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
                className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-full text-xs whitespace-nowrap"
                onClick={resetImageTransform}
                title="Сбросить приближение"
              >
                Отдалить
              </button>
            )}
            <button
              className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-full text-xs whitespace-nowrap"
              onClick={() => {
                setIsFullScreen(false);
                setActivePoint(null);
                resetImageTransform();
                if (isDragging) handleDragEnd();
              }}
              title="Свернуть"
            >
              Свернуть
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
            position: 'relative'
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
                    src={task?.image || ""}
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
                      className={`absolute ${
                        isDragging && draggedPointId === point.id ? "z-51" : "z-40"
                      }`}
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        transform: `translate(-50%, -50%) scale(${Math.max(1 / currentScale, 0.5)})`,
                        pointerEvents: 'auto',
                        cursor: point.locked ? 'not-allowed' : 'pointer',
                        opacity: point.locked ? 0.7 : 1
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
                            : activePoint?.id === point.id && editMode
                            ? "#F59E0B"
                            : telegramData?.themeParams.button_color || "#3B82F6",
                          border: point.locked ? '2px solid #DC2626' : 'none'
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

          {/* CompactPagination - всегда видна в полноэкранном режиме */}
          {taskPoints.length > 0 && (() => {
            const pointsPerRow = 14;
            const rows = [];
            for (let i = 0; i < taskPoints.length; i += pointsPerRow) {
              rows.push(taskPoints.slice(i, i + pointsPerRow));
            }

            return (
              <div
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--tgui--secondary_bg_color)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  zIndex: 100002
                }}
              >
                {/* Стрелки навигации */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  {/* Стрелка влево */}
                  <button
                    onClick={goToPreviousPoint}
                    disabled={taskPoints.length <= 1}
                    style={{ 
                      opacity: taskPoints.length <= 1 ? 0.3 : 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--tgui--text_color)',
                      cursor: taskPoints.length <= 1 ? 'default' : 'pointer'
                    }}
                  >
                    <FiChevronLeft size={20} />
                  </button>

                  {/* CompactPagination rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {rows.map((rowPoints, rowIndex) => (
                      <CompactPagination key={rowIndex}>
                        {rowPoints.map((point) => (
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
                    ))}
                  </div>

                  {/* Стрелка вправо */}
                  <button
                    onClick={goToNextPoint}
                    disabled={taskPoints.length <= 1}
                    style={{ 
                      opacity: taskPoints.length <= 1 ? 0.3 : 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--tgui--text_color)',
                      cursor: taskPoints.length <= 1 ? 'default' : 'pointer'
                    }}
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Панель редактирования активной точки */}
          {isPointPanelVisible && (
            <div
              className="z-100001 bg-opacity-90 rounded-lg shadow-md overflow-hidden pb-1"
              onClick={(e) => e.stopPropagation()}
              style={{
                height: 'auto',
                paddingBottom: '16px',
                backgroundColor: telegramData?.themeParams.section_bg_color,
                background: 'var(--tgui--secondary_bg_color)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                bottom: `${modalBottomOffset + calculatePaginationOffset()}px`,
                left: '16px',
                right: '16px',
                zIndex: 100001,
                transform: isPointPanelAnimating 
                  ? 'translateY(0) scale(1)' 
                  : 'translateY(20px) scale(0.95)',
                opacity: isPointPanelAnimating ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformOrigin: 'center bottom',
                boxShadow: isPointPanelAnimating 
                  ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                  : '0 5px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {activePoint && (
                <div 
                  style={{
                    flex: 1,
                    overflow: 'auto',
                    paddingRight: '4px'
                  }}
                >
                  {/* Section 1: Name */}
                  <div className="p-2  ">
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
                          className="text-sm font-medium bg-transparent border-none outline-none"
                          placeholder="Название задачи"
                          style={{
                            color: telegramData?.themeParams.text_color || "#000000",
                            opacity: activePoint.locked ? 0.6 : 1,
                            border: `1px solid ${telegramData?.themeParams.button_color}`,
                            borderRadius: '4px',
                            padding: '4px',
                            marginRight: '4px',
                            width: 'calc(100% - 100px)',
                            maxWidth: '200px'
                          }}
                        />

                        {editMode && (
                          <div className="flex items-center gap-1 flex-shrink-0">
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
                              className="transition-colors duration-200 p-0.5 rounded hover:bg-gray-100"
                              style={{
                                color: activePoint.locked ? (telegramData?.themeParams.button_color || "#3B82F6") : "#6B7280",
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              {activePoint.locked ? (
                                <FiLock size={16} />
                              ) : (
                                <FiUnlock size={16} />
                              )}
                            </button>
                            
                            <button 
                              className="text-red-500 hover:text-red-700 transition-all duration-200 p-0.5 rounded hover:bg-red-50"
                              onClick={() => {
                                setTaskPoints((prevPoints) =>
                                  prevPoints.filter((p) => p.id !== activePoint.id)
                                );
                                setActivePoint(null);
                              }}   
                              style={{
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              <FiTrash2 size={16} />
                            </button>

                            <button
                              onClick={() => setActivePoint(null)}
                              className="text-blue-500 hover:text-blue-700 transition-all duration-200 p-0.5 rounded hover:bg-blue-50"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              <FiChevronDown 
                                size={16} 
                                className="transition-transform duration-300 hover:translate-y-1"
                              />
                            </button>
                          </div>
                        )}

                      </div>
                      
                  </div>

                  {/* Section 2: Description */}
                  <div className="p-2  ">
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
                        className="w-full text-xs bg-transparent border rounded p-1 resize-none"
                        placeholder="Описание задачи"
                        style={{
                          backgroundColor: telegramData?.themeParams.section_bg_color,
                          color: telegramData?.themeParams.text_color || "#000000",
                          borderColor: telegramData?.themeParams.button_color,
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
                  <div className="px-2 pb-0">
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Основной контент */}
      <Card
        className="w-full"
        style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div className="flex flex-col items-start gap-2">
            {/* Блок с изображением */}
            <div
              className="rounded-md overflow-hidden relative cursor-pointer"
              onClick={() => setIsFullScreen(true)}
            >
              <img
                ref={thumbnailRef}
                alt="Task image"
                src={task?.image || ""}
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
                    opacity: point.locked ? 0.7 : 1
                  }}
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: point.completed
                        ? "#10B981"
                        : telegramData?.themeParams.button_color || "#3B82F6",
                      border: point.locked ? '2px solid #DC2626' : 'none'
                    }}
                  >
                    {point.id}
                  </div>
                </div>
              ))}
            </div>

            {/* Описание задач */}
            <div className="flex flex-col justify-left pl-2 pr-2 w-full">
              {editMode ? (
                <div>
                <input
                  value={task?.title || ""}
                  onChange={(e) => {
                    if (task) {
                      setTask({ ...task, title: e.target.value });
                    }
                  }}
                  placeholder="Название задачи"
                  className="w-full border rounded p-2 mb-2 text-base font-semibold"
                  style={{
                    backgroundColor: telegramData?.themeParams.section_bg_color,
                    color: telegramData?.themeParams.text_color,
                    border: `1px solid ${telegramData?.themeParams.button_color}`,
                    borderRadius: '4px',
                    padding: '4px',
                    marginRight: '4px',
                  }}
                />

                <textarea
                  value={task?.description || ""}
                  onChange={(e) => {
                    if (task) {
                      setTask({ ...task, description: e.target.value });
                    }
                  }}
                  placeholder="Описание задачи"
                  className="w-full border rounded p-2 mb-2 text-base font-semibold"
                  style={{
                    backgroundColor: telegramData?.themeParams.section_bg_color,
                    color: telegramData?.themeParams.text_color,
                    border: `1px solid ${telegramData?.themeParams.button_color}`,
                    borderRadius: '4px',
                    padding: '4px',
                    marginRight: '4px',
                  }}
                  />
                </div>  
              ) : (
                <p className="text-base font-semibold pb-4">{task?.title}</p>
              )}


              {taskPoints.map((task_point: TaskPoint, index: number) => {
                const { title, description, voice_message, completed } =
                  task_point;
                return (
                  <div key={task_point.id}>
                    <div className="gap-2 pb-7">
                      <div className="flex mb-2">
                        <Checkbox
                          disabled={editMode ? (task_point.locked ? true : false) : true}
                          checked={completed}
                          onChange={() => {
                            console.log("onChange for list checkbox called");
                            setTaskPoints((prevPoints) => {
                              const updatedPoints = prevPoints.map((p) =>
                                p.id === task_point.id
                                  ? {
                                      ...p,
                                      completed: !p.completed,
                                      done_at: !p.completed
                                        ? new Date().toISOString().slice(0, -5)
                                        : null,
                                    }
                                  : p
                              );

                              handleEditTaskByEmployer(updatedPoints);

                              return updatedPoints;
                            });
                          }}
                          style={{
                            opacity: task_point.locked ? 0.6 : 1
                          }}
                        />
                        {editMode ? (
                          <div className="flex items-center gap-2 ml-2" style={{ width: 'calc(100% - 24px)' }}>
                            <input
                              value={title}
                              disabled={task_point.locked}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setTaskPoints((prevPoints) =>
                                  prevPoints.map((p) =>
                                    p.id === task_point.id
                                      ? { ...p, title: newTitle }
                                      : p
                                  )
                                );
                              }}
                              className="border rounded p-1"
                              placeholder={`Название задачи`}
                              style={{
                                backgroundColor: telegramData?.themeParams.section_bg_color,
                                color: telegramData?.themeParams.text_color,
                                border: `1px solid ${telegramData?.themeParams.button_color}`,
                                borderRadius: '4px',
                                padding: '4px',
                                opacity: task_point.locked ? 0.6 : 1,
                                width: 'calc(100% - 60px)', // Оставляем место для кнопок
                                minWidth: '0', // Позволяем уменьшаться
                                textOverflow: 'ellipsis'
                              }}
                            />
                            <button
                              onClick={() => {
                                setTaskPoints((prevPoints) => {
                                  const updatedPoints = prevPoints.map((p) =>
                                    p.id === task_point.id
                                      ? { ...p, locked: !p.locked }
                                      : p
                                  );
                                  return updatedPoints;
                                });
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                              style={{
                                color: task_point.locked ? (telegramData?.themeParams.button_color || "#3B82F6") : "#6B7280",
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {task_point.locked ? (
                                <FiLock size={14} />
                              ) : (
                                <FiUnlock size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setTaskPoints(prev => prev.filter(p => p.id !== task_point.id));
                              }}
                              className="p-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                              style={{
                                color: '#EF4444',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm ml-2">
                            {index + 1} - {title}
                          </span>
                        )}
                      </div>
                      {editMode ? (
                        <textarea
                          value={description}
                          disabled={task_point.locked}
                          onChange={(e) => {
                            const newDescription = e.target.value;
                            setTaskPoints((prevPoints) =>
                              prevPoints.map((p) =>
                                p.id === task_point.id
                                  ? { ...p, description: newDescription }
                                  : p
                              )
                            );
                          }}
                          className="w-full border rounded p-2 min-h-[60px] resize-y"
                          placeholder="Описание задачи"
                          style={{
                            backgroundColor: telegramData?.themeParams.section_bg_color,
                            color: telegramData?.themeParams.text_color,
                            border: `1px solid ${telegramData?.themeParams.button_color}`,
                            borderRadius: '4px',
                            padding: '4px',
                            marginRight: '4px',
                            opacity: task_point.locked ? 0.6 : 1
                          }}
                        />
                      ) : (
                        <div className="pb-2">{description}</div>
                      )}
                      <div>
                        {editMode ? (
                          <AudioMessageComposer />
                        ) : (
                          <Waveform audioUrl={voice_message || mockAudioUrl} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {editMode && (
              <>
                <Button
                  style={{
                    width: "100%",
                    backgroundColor: telegramData?.themeParams.button_color || "#3B82F6",
                    color: "white"
                  }}
                  onClick={handleEditTask}
                >
                  Сохранить изменения
                </Button>
                <Button
                  style={{
                    width: "100%",
                    backgroundColor: "#ef4444",
                    color: "white"
                  }}
                  onClick={handleDeleteTask}
                >
                  Удалить
                </Button>
              </>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Назад"
              >
                <SlArrowLeft
                  size={24}
                  color={telegramData?.themeParams.button_color}
                />
              </button>
            </div>
          </div>
        </div>
      </Card>
      <div className="h-20"></div>
    </div>
  );
}

export default TaskCard;
