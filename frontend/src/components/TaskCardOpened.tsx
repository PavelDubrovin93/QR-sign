import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';
import { useNavigate, useParams } from "react-router-dom";
import { SlArrowLeft, SlClose } from "react-icons/sl";

import TestImage from '../assets/test_image.jpeg';
import AudioRecorder from "./AudioRecorder";
import useDnDpoints from "../utils/hooks/useDnDpoints";
import { getTaskById } from "../api/task/get-taskbyId";
import type { Task } from "../@types/task";
import Waveform from "./Waveform";
import AudioMessageComposer from "./AudioMessageComposer";

export interface TaskPoint {
    id: number;
    x: number; // percent
    y: number; // percent
    title: string;
    completed: boolean;
}

interface TaskCardProps {
    editMode: boolean;
}

function TaskCard({ editMode }: TaskCardProps) {
    const mockAudioUrl =
        "https://api.twilio.com/2010-04-01/Accounts/AC25aa00521bfac6d667f13fec086072df/Recordings/RE6d44bc34911342ce03d6ad290b66580c.mp3";
    const telegramData = getTelegramData();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [task, setTask] = useState<Task | null>(null);
    const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([
        { id: 1, x: 30, y: 40, title: 'Убрать цветок', completed: true },
        { id: 2, x: 70, y: 60, title: 'Замена фасала', completed: false },
        { id: 3, x: 50, y: 80, title: 'Перекрасить в синий', completed: false },
    ]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);
    const thumbnailRef = useRef<HTMLImageElement>(null);
    const fullSizeRef = useRef<HTMLImageElement>(null);
    const [renderedImageRect, setRenderedImageRect] = useState({
        width: 0, height: 0, left: 0, top: 0
    });

    useEffect(() => {
        const fetchData = async () => {
          if (id) {
            try {
              const res = await getTaskById(id);
              if (res.data) {
                setTask(res.data);
              }
            } catch (e: any) {
              console.error(e);
            }
          }
        };
    
        fetchData();
      }, [id]);

    const { isDragging, draggedPointId, handleDragStart, handleDragEnd } = useDnDpoints({
        editMode,
        taskPoints,
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
            top: actualTop
        });
    }, []);

    useEffect(() => {
        if (fullSizeRef.current) {
            fullSizeRef.current.onload = updateRenderedImageRect;
        }

        window.addEventListener('resize', updateRenderedImageRect);

        updateRenderedImageRect();
        setTimeout(updateRenderedImageRect, 100);

        return () => {
            window.removeEventListener('resize', updateRenderedImageRect);
            if (fullSizeRef.current) {
                fullSizeRef.current.onload = null;
            }
        };
    }, [updateRenderedImageRect]);

    const handleImageClick = (e: React.MouseEvent) => {
        if (!editMode || isDragging || !renderedImageRect.width || !renderedImageRect.height) return;

        const clickXRelativeToImagePx = e.clientX - renderedImageRect.left;
        const clickYRelativeToImagePx = e.clientY - renderedImageRect.top;

        const newXPercent = (clickXRelativeToImagePx / renderedImageRect.width) * 100;
        const newYPercent = (clickYRelativeToImagePx / renderedImageRect.height) * 100;

        if (newXPercent >= 0 && newXPercent <= 100 && newYPercent >= 0 && newYPercent <= 100) {
            const newPoint: TaskPoint = {
                id: taskPoints.length > 0 ? Math.max(...taskPoints.map(p => p.id)) + 1 : 1,
                x: newXPercent,
                y: newYPercent,
                title: 'Новая задача',
                completed: false,
            };
            setTaskPoints(prevPoints => [...prevPoints, newPoint]);
            setActivePoint(newPoint);
        }
    };

    const savePoints = () => {
        if (isDragging) handleDragEnd();
        alert("Изменения сохранены")
        setIsFullScreen(false);
    }

    return (
        <div className="p-4 pt-0">
            {/* Модалка с изображением */}
            {isFullScreen && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                >
                    {editMode && 
                        <Button
                        // className="absolute top-4 left-4 text-white z-50"
                        style={{position: "absolute", top: "10px", left: "10px"}}
                        onClick={savePoints}
                    >
                            Сохранить изменения
                        </Button>
                    }
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
                        src={TestImage}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                        onClick={editMode ? handleImageClick : undefined}
                        onLoad={updateRenderedImageRect}
                        style={{ cursor: editMode && !isDragging ? 'crosshair' : 'default' }}
                    />

                    {/* Точки поверх изображения */}
                    {taskPoints.map((point) => {
                        const pixelX = (point.x / 100) * renderedImageRect.width;
                        const pixelY = (point.y / 100) * renderedImageRect.height;
                        return (
                            <div
                                key={point.id}
                                className={`absolute cursor-pointer ${isDragging && draggedPointId === point.id ? 'z-50' : 'z-40'}`}
                                style={{
                                    left: `${pixelX + renderedImageRect.left}px`,
                                    top: `${pixelY + renderedImageRect.top}px`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                onMouseDown={(e) => handleDragStart(e, point)}
                                onTouchStart={(e) => handleDragStart(e, point)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDragging) {
                                        setActivePoint(taskPoints.find(p => p.id === point.id) || null);
                                    }
                                }}
                            >
                                <div
                                    className={`flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full transition-all duration-100 ${
                                        activePoint?.id === point.id && editMode ? 'pulse' : ''
                                    }`}
                                    style={{
                                        backgroundColor: point.completed
                                            ? '#10B981'
                                            : telegramData?.themeParams.button_color || '#3B82F6',
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
                            style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
                        >
                            <h3 className="font-semibold text-lg text-gray-600">{activePoint.title}</h3>
                            <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600" style={{ color: telegramData?.themeParams.text_color }}>
                                ID: {activePoint.id}, {activePoint.completed ? 'Выполнено' : 'Не выполнено'}
                            </p>
                            {editMode && 
                                <button
                                    className="text-sm text-red-500"
                                    onClick={() => {
                                        setTaskPoints(prev => prev.filter(p => p.id !== activePoint.id));
                                        setActivePoint(null);
                                    }}
                                >
                                    Удалить точку
                                </button>
                            }
                            </div>
                            {editMode && (
                                <div className="mt-2">
                                    <input
                                        value={activePoint.title}
                                        onChange={(e) => {
                                            const newTitle = e.target.value;
                                            setTaskPoints(prevPoints => {
                                                const updatedPoints = prevPoints.map(p =>
                                                    p.id === activePoint.id
                                                        ? { ...p, title: newTitle }
                                                        : p
                                                );
                                                setActivePoint(updatedPoints.find(p => p.id === activePoint.id) || null);
                                                return updatedPoints;
                                            });
                                        }}
                                        className="w-full border rounded p-1 mb-1"
                                        placeholder="Изменить название задачи"
                                        style={{
                                            backgroundColor: telegramData?.colorScheme === 'dark' ? '#444' : '#eee',
                                            color: telegramData?.themeParams.text_color || '#000000'
                                        }}
                                    />
                                    <label className="flex items-center text-sm" style={{ color: telegramData?.themeParams.text_color }}>
                                        <Checkbox
                                            checked={activePoint.completed}
                                            onChange={(e) => {
                                                const newCompleted = e.target.checked;
                                                setTaskPoints(prevPoints => {
                                                    const updatedPoints = prevPoints.map(p =>
                                                        p.id === activePoint.id
                                                            ? { ...p, completed: newCompleted }
                                                            : p
                                                    );
                                                    setActivePoint(updatedPoints.find(p => p.id === activePoint.id) || null);
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
            <Card className="w-full" style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}>
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
                                src={TestImage}
                                className="w-full h-auto object-cover rounded-xl p-2 pb-0"
                            />
                            {/* {task?.task_points?.map((point) => (
                                <div
                                    key={point.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        left: `${point.coordinates[0]}%`,
                                        top: `${point.coordinates[1]}%`,
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
                                        style={{
                                            backgroundColor: point.completed
                                                ? '#10B981'
                                                : telegramData?.themeParams.button_color || '#3B82F6',
                                        }}
                                    >
                                        {point.id}
                                    </div>
                                </div>
                            ))} */}

                            {/* Точки поверх мини-изображения */}
                            {taskPoints.map((point) => (
                                <div
                                    key={point.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        left: `${point.x}%`,
                                        top: `${point.y}%`,
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
                                        style={{
                                            backgroundColor: point.completed
                                                ? '#10B981'
                                                : telegramData?.themeParams.button_color || '#3B82F6',
                                        }}
                                    >
                                        {point.id}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Описание задач */}
                        <div className="flex flex-col justify-left pl-2 pr-2">
                            <p className="text-base font-semibold pb-4">Уборка территории</p>
                            {/* <p className="text-base font-semibold pb-4">{task?.description}</p> */}
                            {/* {task?.task_points?.map((task_point: any, index: number)=> {
                                const { title, description, voice_massage } = task_point;
                                return (
                                    <div key={task_point.id}>
                                        <div className="flex items-start gap-2 pb-2">
                                            <Checkbox checked />
                                            <span className="text-sm">
                                                {index + 1} - {title}
                                            </span>
                                            <div className="pb-4">
                                                {description}
                                            </div>
                                            <div className="pb-4">
                                            {editMode && voice_massage ? 
                                                <div className="flex">
                                                    <AudioRecorder />      
                                                </div>          
                                                :
                                                <div className="flex pb-4 px-1 items-center">
                                                    <div className="flex-1 flex flex-col pt-[3px]">
                                                        <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden mb-2">
                                                            <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 text-left">00:35</span>
                                                    </div>
                                                    <div className="ml-4 flex items-center">
                                                        <button
                                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
                                                            onClick={() => console.log("Проигрывание голосового")}
                                                            aria-label="Проиграть голосовое сообщение"
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M5 3v18l15-9z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            }
                                            </div>
                                        </div>
                                    </div>
                                )
                            })} */}
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox checked />
                                <span className="text-sm">1 - Перекрасить подоконник</span>
                            </div>
                            <div className="pb-4">
                                Используя кисть или валик, равномерно нанесите первый слой краски. Начинайте с краев и углов, затем закрашивайте центральные участки.
                            </div>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox />
                                <span className="text-sm">2 - Очистить площадку</span>
                            </div>
                            <div className="pb-2">
                                Начните с удаления крупных предметов, таких как ветки, камни, пластиковые бутылки и другие отходы. Соберите их в мусорные мешки.
                            </div>
                            <div className="pb-4">
                                {/* Голосовое сообщение */}
                                {editMode ? 
                                    <AudioMessageComposer /> 
                                    : 
                                    <Waveform audioUrl={mockAudioUrl}/>
                                }
                            </div>
                            <div className="flex items-start gap-2 pb-4">
                                <Checkbox />
                                <span className="text-sm">3 - Заменить дерево</span>
                            </div>
                            <div className="pb-2">
                                Убедитесь, что у вас есть достаточно места для работы и что вы защитили окружающие поверхности от повреждений.
                                Работайте в перчатках и защитных очках для безопасности.
                                Дерево для замены находится в соседнем помещении.
                            </div>
                            <div className="pb-2">
                                {/* Голосовое сообщение */}
                                {editMode ? 
                                    <AudioMessageComposer /> 
                                    : 
                                    <Waveform audioUrl={mockAudioUrl}/>
                                } 
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="Назад"
                        >
                            <SlArrowLeft size={24} color={telegramData?.themeParams.button_color}/>
                        </button>
                    </div>
                </div>
            </Card>
            <div className="h-20"></div>
        </div>
    );
}

export default TaskCard;



                                // <div className="flex pb-4 px-1 items-center">
                                //     <div className="flex-1 flex flex-col pt-[3px]">
                                //         <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden mb-2">
                                //             <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
                                //         </div>
                                //         <span className="text-xs text-gray-500 text-left">00:35</span>
                                //     </div>
                                //     <div className="ml-4 flex items-center">
                                //         <button
                                //             className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
                                //             onClick={() => console.log("Проигрывание голосового")}
                                //             aria-label="Проиграть голосовое сообщение"
                                //         >
                                //             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                //                 <path d="M5 3v18l15-9z" />
                                //             </svg>
                                //         </button>
                                //     </div>
                                // </div>

//Добавление точки по нажатию
// function TaskCard({ editMode }: TaskCardProps) {
//     const [task, setTask] = useState({});
//     const telegramData = getTelegramData();
//     const navigate = useNavigate();

//     const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([
//         { id: 1, x: 30, y: 40, title: 'Убрать цветок', completed: true },
//         { id: 2, x: 70, y: 60, title: 'Замена фасала', completed: false },
//         { id: 3, x: 50, y: 80, title: 'Перекрасить в синий', completed: false },
//     ]);

//     const [isFullScreen, setIsFullScreen] = useState(false);
//     const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);

//     const thumbnailRef = useRef<HTMLImageElement>(null);
//     const fullSizeRef = useRef<HTMLImageElement>(null);

//     const [renderedImageRect, setRenderedImageRect] = useState({
//         width: 0, height: 0, left: 0, top: 0
//     });

//     const { isDragging, draggedPointId, handleDragStart, handleDragEnd } = useDnDpoints({
//         editMode,
//         taskPoints,
//         setTaskPoints,
//         activePoint,
//         setActivePoint,
//         renderedImageRect,
//     });

//     const updateRenderedImageRect = useCallback(() => {
//         if (!fullSizeRef.current) return;

//         const img = fullSizeRef.current;
//         const imgRect = img.getBoundingClientRect();

//         const naturalWidth = img.naturalWidth;
//         const naturalHeight = img.naturalHeight;

//         let actualWidth = imgRect.width;
//         let actualHeight = imgRect.height;
//         let actualLeft = imgRect.left;
//         let actualTop = imgRect.top;

//         if (naturalWidth && naturalHeight) {
//             const aspectRatio = naturalWidth / naturalHeight;
//             const containerAspectRatio = imgRect.width / imgRect.height;

//             if (aspectRatio > containerAspectRatio) {
//                 actualHeight = imgRect.width / aspectRatio;
//                 actualTop = imgRect.top + (imgRect.height - actualHeight) / 2;
//             } else {
//                 actualWidth = imgRect.height * aspectRatio;
//                 actualLeft = imgRect.left + (imgRect.width - actualWidth) / 2;
//             }
//         }
//         setRenderedImageRect({
//             width: actualWidth,
//             height: actualHeight,
//             left: actualLeft,
//             top: actualTop
//         });
//     }, []);

//     useEffect(() => {
//         if (fullSizeRef.current) {
//             fullSizeRef.current.onload = updateRenderedImageRect;
//         }

//         window.addEventListener('resize', updateRenderedImageRect);

//         updateRenderedImageRect();
//         setTimeout(updateRenderedImageRect, 100);

//         return () => {
//             window.removeEventListener('resize', updateRenderedImageRect);
//             if (fullSizeRef.current) {
//                 fullSizeRef.current.onload = null;
//             }
//         };
//     }, [updateRenderedImageRect]);

//     const longPressTimerRef = useRef<number | null>(null);
//     const initialClickCoordsRef = useRef<{ x: number, y: number } | null>(null);
//     const LONG_PRESS_DURATION = 150;

//     const handleAddNewPoint = useCallback((clientX: number, clientY: number) => {
//         const clickXRelativeToImagePx = clientX - renderedImageRect.left;
//         const clickYRelativeToImagePx = clientY - renderedImageRect.top;

//         const newXPercent = (clickXRelativeToImagePx / renderedImageRect.width) * 100;
//         const newYPercent = (clickYRelativeToImagePx / renderedImageRect.height) * 100;

//         if (newXPercent >= 0 && newXPercent <= 100 && newYPercent >= 0 && newYPercent <= 100) {
//             setTaskPoints(prevPoints => {
//                 const newId = prevPoints.length > 0
//                     ? Math.max(...prevPoints.map(p => p.id)) + 1
//                     : 1; 
                
//                 const newPoint: TaskPoint = {
//                     id: newId,
//                     x: newXPercent,
//                     y: newYPercent,
//                     title: 'Новая задача',
//                     completed: false,
//                 };
//                 const updatedPoints = [...prevPoints, newPoint];
//                 setActivePoint(newPoint); 
//                 return updatedPoints;
//             });
//         }
//     }, [renderedImageRect, setTaskPoints, setActivePoint]);

//     const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
//         if ('touches' in e) {
//             e.preventDefault();
//         }

//         if (!editMode || isDragging || !renderedImageRect.width || !renderedImageRect.height) return;

//         let clientX: number;
//         let clientY: number;

//         if ('touches' in e) {
//             clientX = e.touches[0].clientX;
//             clientY = e.touches[0].clientY;
//         } else {
//             clientX = e.clientX;
//             clientY = e.clientY;
//         }

//         initialClickCoordsRef.current = { x: clientX, y: clientY };

//         longPressTimerRef.current = window.setTimeout(() => {
//             handleAddNewPoint(clientX, clientY);
//             longPressTimerRef.current = null;
//         }, LONG_PRESS_DURATION);

//     }, [editMode, isDragging, renderedImageRect, handleAddNewPoint]);

//     const handlePressEnd = useCallback(() => {
//         if (longPressTimerRef.current) {
//             clearTimeout(longPressTimerRef.current);
//             longPressTimerRef.current = null;
//         }
//         initialClickCoordsRef.current = null;
//     }, []);

//     const handlePressMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
//         if (longPressTimerRef.current && initialClickCoordsRef.current) {
//             let clientX: number;
//             let clientY: number;

//             if ('touches' in e) {
//                 clientX = e.touches[0].clientX;
//                 clientY = e.touches[0].clientY;
//             } else {
//                 clientX = e.clientX;
//                 clientY = e.clientY;
//             }

//             const deltaX = Math.abs(clientX - initialClickCoordsRef.current.x);
//             const deltaY = Math.abs(clientY - initialClickCoordsRef.current.y);
//             const moveThreshold = 10;

//             if (deltaX > moveThreshold || deltaY > moveThreshold) {
//                 clearTimeout(longPressTimerRef.current);
//                 longPressTimerRef.current = null;
//                 initialClickCoordsRef.current = null;
//             }
//         }
//     }, []);

//     return (
//         <div className="p-4 pt-0">
//             {/* Модалка с изображением */}
//             {isFullScreen && (
//                 <div
//                     className="fixed inset-0 z-50 bg-black flex items-center justify-center"
//                 >
//                     <button
//                         className="absolute top-4 right-4 text-white z-50"
//                         onClick={() => {
//                             setIsFullScreen(false);
//                             setActivePoint(null);
//                             if (isDragging) handleDragEnd();
//                         }}
//                     >
//                         <SlClose size={24} />
//                     </button>

//                     {/* Изображение */}
//                     <img
//                         ref={fullSizeRef}
//                         src={TestImage}
//                         alt="Full size"
//                         className="max-w-full max-h-full object-contain"
//                         onMouseDown={editMode ? handlePressStart : undefined}
//                         onMouseUp={editMode ? handlePressEnd : undefined}
//                         onMouseMove={editMode ? handlePressMove : undefined}
//                         onTouchStart={editMode ? handlePressStart : undefined}
//                         onTouchEnd={editMode ? handlePressEnd : undefined}
//                         onTouchMove={editMode ? handlePressMove : undefined}
//                         onLoad={updateRenderedImageRect}
//                         onContextMenu={editMode ? (e) => e.stopPropagation() : undefined}
//                         style={{
//                             cursor: editMode && !isDragging ? 'crosshair' : 'default',
//                             WebkitUserSelect: 'none',
//                             MozUserSelect: 'none',
//                             msUserSelect: 'none',
//                             userSelect: 'none',
//                             WebkitTouchCallout: 'none',
//                         }}
//                     />

//                     {/* Точки поверх изображения */}
//                     {taskPoints.map((point) => {
//                         const pixelX = (point.x / 100) * renderedImageRect.width;
//                         const pixelY = (point.y / 100) * renderedImageRect.height;
//                         return (
//                             <div
//                                 key={point.id}
//                                 className={`absolute cursor-pointer ${isDragging && draggedPointId === point.id ? 'z-50' : 'z-40'}`}
//                                 style={{
//                                     left: `${pixelX + renderedImageRect.left}px`,
//                                     top: `${pixelY + renderedImageRect.top}px`,
//                                     transform: 'translate(-50%, -50%)',
//                                 }}
//                                 onMouseDown={(e) => handleDragStart(e, point)}
//                                 onTouchStart={(e) => handleDragStart(e, point)}
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     if (!isDragging) {
//                                         setActivePoint(taskPoints.find(p => p.id === point.id) || null);
//                                     }
//                                 }}
//                             >
//                                 <div
//                                     className={`flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full transition-all duration-100 ${
//                                         activePoint?.id === point.id && editMode ? 'pulse' : ''
//                                     }`}
//                                     style={{
//                                         backgroundColor: point.completed
//                                             ? '#10B981'
//                                             : telegramData?.themeParams.button_color || '#3B82F6',
//                                     }}
//                                 >
//                                     {point.id}
//                                 </div>
//                             </div>
//                         );
//                     })}

//                     {/* Информация о задаче всегда снизу */}
//                     {activePoint && (
//                         <div
//                             className="fixed bottom-4 left-4 right-4 p-3 bg-white bg-opacity-90 rounded-lg shadow-md"
//                             onClick={(e) => e.stopPropagation()}
//                             style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
//                         >
//                             <h3 className="font-semibold text-lg text-gray-600">{activePoint.title}</h3>
//                             <div className="flex items-center justify-between">
//                             <p className="text-sm text-gray-600" style={{ color: telegramData?.themeParams.text_color }}>
//                                 ID: {activePoint.id}, {activePoint.completed ? 'Выполнено' : 'Не выполнено'}
//                             </p>
//                             <button
//                                 className="text-sm text-red-500"
//                                 onClick={() => {
//                                     setTaskPoints(prev => prev.filter(p => p.id !== activePoint.id));
//                                     setActivePoint(null);
//                                 }}
//                             >
//                                 Удалить точку
//                             </button>
//                             </div>
//                             {editMode && (
//                                 <div className="mt-2">
//                                     <input
//                                         value={activePoint.title}
//                                         onChange={(e) => {
//                                             const newTitle = e.target.value;
//                                             setTaskPoints(prevPoints => {
//                                                 const updatedPoints = prevPoints.map(p =>
//                                                     p.id === activePoint.id
//                                                         ? { ...p, title: newTitle }
//                                                         : p
//                                                 );
//                                                 setActivePoint(updatedPoints.find(p => p.id === activePoint.id) || null);
//                                                 return updatedPoints;
//                                             });
//                                         }}
//                                         className="w-full border rounded p-1 mb-1"
//                                         placeholder="Изменить название задачи"
//                                         style={{
//                                             backgroundColor: telegramData?.colorScheme === 'dark' ? '#444' : '#eee',
//                                             color: telegramData?.themeParams.text_color || '#000000'
//                                         }}
//                                     />
//                                     <label className="flex items-center text-sm" style={{ color: telegramData?.themeParams.text_color }}>
//                                         <Checkbox
//                                             checked={activePoint.completed}
//                                             onChange={(e) => {
//                                                 const newCompleted = e.target.checked;
//                                                 setTaskPoints(prevPoints => {
//                                                     const updatedPoints = prevPoints.map(p =>
//                                                         p.id === activePoint.id
//                                                             ? { ...p, completed: newCompleted }
//                                                             : p
//                                                     );
//                                                     setActivePoint(updatedPoints.find(p => p.id === activePoint.id) || null);
//                                                     return updatedPoints;
//                                                 });
//                                             }}
//                                             className="mr-2"
//                                         />
//                                         Выполнено
//                                     </label>
//                                 </div>
//                             )}
//                             <button
//                                 className="mt-2 text-sm text-blue-500"
//                                 onClick={() => setActivePoint(null)}
//                                 style={{ color: telegramData?.themeParams.button_color }}
//                             >
//                                 Закрыть
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Основной контент */}
//             <Card className="w-full" style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}>
//                 <div className="flex flex-col justify-between h-full p-3">
//                     <div className="flex flex-col items-start gap-2">
//                         {/* Блок с изображением */}
//                         <div
//                             className="rounded-md overflow-hidden relative cursor-pointer"
//                             onClick={() => setIsFullScreen(true)}
//                         >
//                             <img
//                                 ref={thumbnailRef}
//                                 alt="Task image"
//                                 src={TestImage}
//                                 className="w-full h-auto object-cover rounded-xl p-2 pb-0"
//                             />

//                             {/* Точки поверх мини-изображения */}
//                             {taskPoints.map((point) => (
//                                 <div
//                                     key={point.id}
//                                     className="absolute transform -translate-x-1/2 -translate-y-1/2"
//                                     style={{
//                                         left: `${point.x}%`,
//                                         top: `${point.y}%`,
//                                         pointerEvents: 'none',
//                                     }}
//                                 >
//                                     <div
//                                         className="flex items-center justify-center w-6 h-6 text-white text-xs font-bold rounded-full"
//                                         style={{
//                                             backgroundColor: point.completed
//                                                 ? '#10B981'
//                                                 : telegramData?.themeParams.button_color || '#3B82F6',
//                                         }}
//                                     >
//                                         {point.id}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Описание задач */}
//                         <div className="flex flex-col justify-left pl-2 pr-2">
//                             <p className="text-base font-semibold pb-4">Уборка территории</p>
//                             <div className="flex items-start gap-2 pb-2">
//                                 <Checkbox checked />
//                                 <span className="text-sm" style={{ color: telegramData?.themeParams.text_color }}>1 - Перекрасить подоконник</span>
//                             </div>
//                             <div className="pb-4 text-sm" style={{ color: telegramData?.themeParams.text_color }}>
//                                 Используя кисть или валик, равномерно нанесите первый слой краски. Начинайте с краев и углов, затем закрашивайте центральные участки.
//                             </div>
//                             <div className="flex items-start gap-2 pb-2">
//                                 <Checkbox />
//                                 <span className="text-sm" style={{ color: telegramData?.themeParams.text_color }}>2 - Очистить площадку</span>
//                             </div>
//                             <div className="pb-2 text-sm" style={{ color: telegramData?.themeParams.text_color }}>
//                                 Начните с удаления крупных предметов, таких как ветки, камни, пластиковые бутылки и другие отходы. Соберите их в мусорные мешки.
//                             </div>
//                             <div className="pb-4">
//                                 {/* Голосовое сообщение */}
//                                 {editMode ? 
//                                 <div className="flex">
//                                     <AudioRecorder />      
   
//                                 </div>          
//                                 :
//                                 <div className="flex pb-4 px-1 items-center">
//                                     <div className="flex-1 flex flex-col pt-[3px]">
//                                         <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden mb-2">
//                                             <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
//                                         </div>
//                                         <span className="text-xs text-gray-500 text-left">00:35</span>
//                                     </div>
//                                     <div className="ml-4 flex items-center">
//                                         <button
//                                             className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
//                                             onClick={() => console.log("Проигрывание голосового")}
//                                             aria-label="Проиграть голосовое сообщение"
//                                         >
//                                             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
//                                                 <path d="M5 3v18l15-9z" />
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 </div>
//                                 }
//                             </div>
//                             <div className="flex items-start gap-2 pb-4">
//                                 <Checkbox />
//                                 <span className="text-sm" style={{ color: telegramData?.themeParams.text_color }}>3 - Заменить дерево</span>
//                             </div>
//                             <div className="pb-2 text-sm" style={{ color: telegramData?.themeParams.text_color }}>
//                                 Убедитесь, что у вас есть достаточно места для работы и что вы защитили окружающие поверхности от повреждений.
//                                 Работайте в перчатках и защитных очках для безопасности.
//                                 Дерево для замены находится в соседнем помещении.
//                             </div>
//                             <div className="pb-2">
//                                 {/* Голосовое сообщение */}
//                                 {editMode ? 
//                                 <div className="flex">
//                                     <AudioRecorder />      
//                                 </div>   
//                                 :
//                                 <div className="flex pb-4 px-1 items-center">
//                                     <div className="flex-1 flex flex-col pt-[3px]">
//                                         <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden mb-2">
//                                             <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
//                                         </div>
//                                         <span className="text-xs text-gray-500 text-left">00:35</span>
//                                     </div>
//                                     <div className="ml-4 flex items-center">
//                                         <button
//                                             className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
//                                             onClick={() => console.log("Проигрывание голосового")}
//                                             aria-label="Проиграть голосовое сообщение"
//                                         >
//                                             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
//                                                 <path d="M5 3v18l15-9z" />
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 </div>
//                                 }  
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex justify-end mt-2">
//                         <button
//                             onClick={() => navigate(-1)}
//                             className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
//                             aria-label="Назад"
//                         >
//                             <SlArrowLeft size={24} color={telegramData?.themeParams.button_color}/>
//                         </button>
//                     </div>
//                 </div>
//             </Card>
//             <div className="h-20"></div>
//         </div>
//     );
// }