import { useEffect, useState } from "react";
import { Card, Checkbox } from "@telegram-apps/telegram-ui";
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';
import { useNavigate } from "react-router-dom";
import { SlArrowRight } from "react-icons/sl";

function TaskCard() {
    const [task, setTask] = useState({});
    const telegramData = getTelegramData();
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <Card className="w-full" style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}>
                <div className="flex flex-col justify-between h-full p-3">
                    <div className="flex flex-col items-start gap-2">
                        <div className="rounded-md overflow-hidden">
                            <img
                                alt="Task image"
                                src="test_image.jpeg"
                                className="w-full h-auto object-cover rounded-xl p-2 pb-0"
                            />
                        </div>

                        <div className="flex flex-col justify-left pl-2 pr-2">
                            <p className="text-base font-semibold pb-2">Убрать цветок</p>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox disabled checked />
                                <span className="text-sm">1 - Поправить книги Поправить книг Поправить книг Поправить книг Поправить книг</span>
                            </div>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox disabled checked />
                                <span className="text-sm">2 - Поправить книги</span>
                            </div>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox disabled checked />
                                <span className="text-sm">3 - Поправить книги</span>
                            </div>
                            <div className="flex items-start gap-2 pb-2">
                                <Checkbox disabled checked />
                                <span className="text-sm">4 - Поправить книги</span>
                            </div>
                        </div>
                    </div>

                    {/* <div className="flex flex-row items-center gap-4">
                        <div className="rounded-md overflow-hidden w-2/3">
                            <img
                                alt="Task image"
                                src="test_image.jpeg"
                                className="w-full h-auto object-cover rounded-xl p-2"
                            />
                        </div>

                        <div className="flex flex-col justify-start w-1/3">
                            <p className="text-base font-semibold pb-2">Убрать цветок</p>
                            <div className="flex items-center gap-2">
                                <Checkbox disabled checked />
                                <span className="text-sm">1 - Поправить книги</span>
                            </div>
                        </div>
                    </div> */}

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => navigate(-1)}
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