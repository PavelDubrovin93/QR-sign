import { useEffect, useRef, useState } from "react";
import { Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';
import { useNavigate } from "react-router-dom";
import { SlArrowLeft, SlClose } from "react-icons/sl";
import { FaMicrophone } from "react-icons/fa";

import TestImage from '../assets/test_image.jpeg';
import AudioRecorder from "./AudioRecorder";

interface TaskPoint {
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
    const [task, setTask] = useState({});
    const telegramData = getTelegramData();
    const navigate = useNavigate();

    const taskPoints: TaskPoint[] = [
        { id: 1, x: 30, y: 40, title: 'Убрать цветок', completed: true },
        { id: 2, x: 70, y: 60, title: 'Замена фасала', completed: false },
        { id: 3, x: 50, y: 80, title: 'Перекрасить в синий', completed: false },
    ];

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);

    const thumbnailRef = useRef<HTMLImageElement>(null);
    const fullSizeRef = useRef<HTMLImageElement>(null);

    const [thumbnailSize, setThumbnailSize] = useState({ width: 0, height: 0 });
    const [fullSize, setFullSize] = useState({ width: 0, height: 0 });

    // Получаем размеры изображений после загрузки
    useEffect(() => {
        const img = new Image();
        img.src = TestImage;
        img.onload = () => {
            const updateSizes = () => {
                if (thumbnailRef.current) {
                    setThumbnailSize({
                        width: thumbnailRef.current.clientWidth,
                        height: thumbnailRef.current.clientHeight,
                    });
                }
                if (fullSizeRef.current) {
                    setFullSize({
                        width: fullSizeRef.current.clientWidth,
                        height: fullSizeRef.current.clientHeight,
                    });
                }
            };

            setTimeout(updateSizes, 50); // небольшая задержка для корректного измерения
        };
    }, []);

    // Пересчёт координат точек под полноэкранное изображение
    const getPointPosition = (xPercent: number, yPercent: number) => {
        if (!thumbnailSize.width || !fullSize.width || !isFullScreen) return { x: xPercent, y: yPercent };

        const scaleX = thumbnailSize.width / fullSize.width;
        const scaleY = thumbnailSize.height / fullSize.height;

        const adjustedX = xPercent * scaleX;
        const adjustedY = yPercent * scaleY;

        return { x: adjustedX, y: adjustedY };
    };

    return (
        <div className="p-4 pt-0">
            {/* Модалка с изображением */}
            {isFullScreen && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    {/* Кнопка закрытия */}
                    <button
                        className="absolute top-4 right-4 text-white z-50"
                        onClick={() => {
                            setIsFullScreen(false);
                            setActivePoint(null);
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
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Точки поверх изображения */}
                    {taskPoints.map((point) => {
                        const { x, y } = getPointPosition(point.x, point.y);
                        return (
                            <div
                                key={point.id}
                                className="absolute cursor-pointer"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePoint(point);
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
                        );
                    })}

                    {/* Информация о задаче всегда снизу */}
                    {activePoint && (
                        <div
                            className="fixed bottom-4 left-4 right-4 p-3 bg-white bg-opacity-90 rounded-lg shadow-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="font-semibold">{activePoint.title}</h3>
                            <p className="text-sm text-gray-600">
                                ID: {activePoint.id}, {activePoint.completed ? 'Выполнено' : 'Не выполнено'}
                            </p>
                            <button
                                className="mt-2 text-sm text-blue-500"
                                onClick={() => setActivePoint(null)}
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