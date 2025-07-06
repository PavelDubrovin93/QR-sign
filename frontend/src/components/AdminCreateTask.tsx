import {
  Button,
  Checkbox,
  Input,
  Textarea,
  Select,
  Card,
} from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SlClose } from "react-icons/sl";
import { useDispatch, /* useSelector */ } from "react-redux";
import type { TaskPoint, Task } from "../@types/task";
import { getCompaniesByClient } from "../api/company/get-companies-byClient";
import { getTasksByCompany } from "../api/task/get-tasksByCompany";
// import type { RootState } from "../store/rootReducer";
import {
  setIsLoadingTasksBoard,
  setTasksBoardByCompany,
} from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import {
  setIsLoadingCompanies,
  setUserCompanies,
} from "../store/slices/entities/user_companies/user_companiesSlice";
import useDnDpoints from "../utils/hooks/useDnDpoints";
import TestImage from "../assets/test_image.jpeg";
import { useNavigate } from "react-router-dom";

const AdminCreateTask = ({ editMode = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const telegramData = getTelegramData();

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activePoint, setActivePoint] = useState<TaskPoint | null>(null);
  const [task, _] = useState<Task | null>(null);
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>([]);
  const fullSizeRef = useRef<HTMLImageElement>(null);
  const [renderedImageRect, setRenderedImageRect] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const [selectedValue, setSelectedValue] = useState<string | number>("");
  // const [taskName, setTaskName] = useState("");
  // const [taskDescription, setTaskDescription] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // const { data: dataCompanies, isLoading: isLoadingCompanies } = useSelector(
  //   (state: RootState) => state.entities.user_companies
  // );

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

  const handleImageClick = (e: React.MouseEvent) => {
    if (
      !editMode ||
      isDragging ||
      !renderedImageRect.width ||
      !renderedImageRect.height
    )
      return;

    const clickXRelativeToImagePx = e.clientX - renderedImageRect.left;
    const clickYRelativeToImagePx = e.clientY - renderedImageRect.top;

    const newXPercent =
      (clickXRelativeToImagePx / renderedImageRect.width) * 100;
    const newYPercent =
      (clickYRelativeToImagePx / renderedImageRect.height) * 100;

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
        title: "Новая задача",
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

  useEffect(() => {
    const fetchCompanies = async () => {
      dispatch(setIsLoadingCompanies(true));
      try {
        const res = await getCompaniesByClient();
        if (res.data) {
          dispatch(setUserCompanies(res.data));
          if (res.data.length > 0) {
            setSelectedValue(res.data[0].company_id || "");
            // setModalSelectedCompanyId(res.data[0].company_id || "");
          }
        }
      } catch (e: any) {
        console.error("Ошибка загрузки компаний:", e);
      } finally {
        dispatch(setIsLoadingCompanies(false));
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (
      selectedValue !== "" &&
      selectedValue !== null &&
      selectedValue !== undefined
    ) {
      const fetchTasks = async () => {
        dispatch(setIsLoadingTasksBoard(true));
        try {
          const res = await getTasksByCompany(String(selectedValue));
          if (res.data) {
            dispatch(setTasksBoardByCompany(res.data));
          }
        } catch (e: any) {
          console.error("Ошибка загрузки задач:", e);
        } finally {
          dispatch(setIsLoadingTasksBoard(false));
        }
      };

      fetchTasks();
    }
  }, [selectedValue]);

  // const handleOpenModal = () => {
  //   setIsModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setTaskName("");
  //   setTaskDescription("");
  // };

  // const handleAddTask = () => {
  //   // тут нужен апи запрос на добавление новой задачи
  //   console.log("Добавляем задачу:", { taskName, taskDescription });
  //   alert(`Задача "${taskName}" добавлена!`);
  //   handleCloseModal();
  // };

  // const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedValue(event.target.value);
  // };
  return (
    <Card
      className="w-full"
      style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}
    >
      <div
        style={{
          borderTop: "1px solid rgba(42, 144, 255, 0.6)",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
        }}
        className="py-4 px-4 top-shadow-container"
      >
        {/* <div className="flex justify-center relative top-[-10px]">
            <SlArrowDown
              size={26}
              // color={telegramData?.themeParams.button_color}
            />
          </div> */}
        <h3 className="text-center">Добавить задачу</h3>
        {isFullScreen && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* {editMode && ( */}
            <Button
              style={{ position: "absolute", top: "10px", left: "10px" }}
              // onClick={handleEditTask}
            >
              Сохранить изменения
            </Button>
            {/* )} */}
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
              onClick={handleImageClick}
              onLoad={updateRenderedImageRect}
              style={{
                cursor: editMode && !isDragging ? "crosshair" : "default",
              }}
            />

            {/* Точки поверх изображения */}
            {taskPoints.map((point) => {
              const pixelX = (point.x / 100) * renderedImageRect.width;
              const pixelY = (point.y / 100) * renderedImageRect.height;
              return (
                <div
                  key={point.id}
                  className={`absolute cursor-pointer ${
                    isDragging && draggedPointId === point.id ? "z-50" : "z-40"
                  }`}
                  style={{
                    left: `${pixelX + renderedImageRect.left}px`,
                    top: `${pixelY + renderedImageRect.top}px`,
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
                  {/* {editMode && (
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
                    )} */}
                </div>
                {/* {editMode && ( */}
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
                      // disabled={editMode ? true : false}
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
                {/* )} */}
                <button
                  className="mt-2 text-sm text-blue-500"
                  // onClick={() => setActivePoint(null)}
                  style={{ color: telegramData?.themeParams.button_color }}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        )}
        <div
          className="rounded-md overflow-hidden relative cursor-pointer"
          onClick={() => setIsFullScreen(true)}
        >
          <img
            // ref={thumbnailRef}
            alt="Task image"
            src={TestImage}
            className="w-full h-auto object-cover rounded-xl p-2 pb-0"
          />
          {/* Точки поверх мини-изображения, управляются состоянием taskPoints */}
          {/* {taskPoints.map((point) => (
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
            ))} */}
        </div>
        <div className="rounded-md">
          <Input
            placeholder="Название задачи"
            // value={groupName}
            // onChange={(e) => setGroupName(e.target.value)}
          />
          <Textarea
            placeholder="Описание задачи"
            style={{ minHeight: "70px" }}
          />
          <Select>
            <></>
          </Select>
          <Select>
            <></>
          </Select>
        </div>
        <div className="flex items-center">
          <Button
            stretched
            mode="bezeled"
            onClick={() => navigate(-1)}
            className="mx-5"
          >
            Назад
          </Button>
          <Button stretched /* onClick={handleAddTask} */ className="mx-5">
            Сохранить
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdminCreateTask;
