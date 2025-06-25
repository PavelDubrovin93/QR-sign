import { useEffect, useState } from "react";
import { Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';
import { useNavigate } from "react-router-dom";
import { SlArrowRight } from "react-icons/sl";


interface TaskPoint {
    id: number;
    x: number; // percent
    y: number; // percent
    title: string;
    completed: boolean;
}

interface TaskCardProps {
    path: string;
  }

function TaskCard({ path }: TaskCardProps) {
    const [task, setTask] = useState({});
    const telegramData = getTelegramData();
    const navigate = useNavigate();

    const taskPoints: TaskPoint[] = [
        { id: 1, x: 30, y: 40, title: 'Убрать цветок', completed: true },
        { id: 2, x: 70, y: 60, title: 'Замена фасала', completed: false },
        { id: 3, x: 50, y: 80, title: 'Перекрасить в синий', completed: false },
    ];

    return (
        <div className="p-4">
            <Card className="w-full" style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}>
                <div className="flex flex-col justify-between h-full p-3">
                    <div className="flex flex-col items-start gap-2">
                        <div className="rounded-md overflow-hidden relative">
                            <img
                                alt="Task image"
                                src="test_image.jpeg"
                                className="w-full h-auto object-cover rounded-xl p-2 pb-0"
                            />

                            {/* Точки поверх изображения */}
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
                                                ? '#10B981' // зеленый для выполненных
                                                : telegramData?.themeParams.button_color || '#3B82F6',
                                        }}
                                    >
                                        {point.id}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col justify-left pl-2 pr-2">
                            <p className="text-base font-semibold pb-2">Убрать цветок</p>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox  checked />
                                <span className="text-sm">1 - Перекрасить подоконник</span>
                            </div>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox checked={false} onChange={() => {}} />
                                <span className="text-sm">2 - Очистить площадку</span>
                            </div>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox checked={false} onChange={() => {}} />
                                <span className="text-sm">3 - Заменить дерево</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => navigate(path)}
                            className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="Назад"
                        >
                            <SlArrowRight size={24} color={telegramData?.themeParams.button_color}/>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default TaskCard;