import { Button, Cell, Input, Modal } from "@telegram-apps/telegram-ui";
import TaskCard from "../components/TaskCard";
import { SlArrowDown } from "react-icons/sl";
import { useState } from "react";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";

const adminTaskboardPage = () => {
  const telegramData = getTelegramData();

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskName("");
    setTaskDescription("");
  };

  const handleAddTask = () => {
    // тут нужен апи запрос на добавление новой задачи
    console.log("Добавляем задачу:", { taskName, taskDescription });
    alert(`Задача "${taskName}" добавлена!`);
    handleCloseModal();
  };

  return (
    <>
      <div className="flex w-full justify-center px-5">
        <Button className="w-full" onClick={handleOpenModal}>
          Добавить задачу
        </Button>
      </div>
      {/* hard code */}
      <TaskCard path={"/admin-taskboard/${task.id}"} />
      <TaskCard path={"/admin-taskboard/${task.id}"} />

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        dismissible
        modal={true}
        preventScrollRestoration={true}
      >
        <div
          style={{
            borderTop: "1px solid rgba(42, 144, 255, 0.6)",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
          }}
          className="py-4 px-4 top-shadow-container"
        >
          <div className="flex justify-center relative top-[-10px]">
            <SlArrowDown
              size={26}
              // color={telegramData?.themeParams.button_color}
            />
          </div>
          <Input
            placeholder="Название задачи"
            status="focused"
            // value={groupName}
            // onChange={(e) => setGroupName(e.target.value)}
          />
          {/* <Cell>
            <Input
                    placeholder="Описание группы"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
          </Cell> */}
          <div className="flex items-center">
            <Button
              stretched
              mode="bezeled"
              onClick={handleCloseModal}
              className="mx-5"
            >
              Отмена
            </Button>
            <Button stretched onClick={handleAddTask} className="mx-5">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default adminTaskboardPage;
