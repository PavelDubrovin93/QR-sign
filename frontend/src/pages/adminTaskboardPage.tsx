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
        // overlayComponent={
        //   <div
        //     style={{
        //       backgroundColor: "rgba(0, 0, 0, 0.8)", // Черный цвет с 80% непрозрачностью
        //       position: "fixed",
        //       top: 0,
        //       left: 0,
        //       right: 0,
        //       bottom: 0,
        //       zIndex: 3
        //     }}
        //   />
        // }
        modal={true}
        preventScrollRestoration={true}
      >
        <div
          style={{
            // border: "1px solid #268dff",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            position: "relative",
          }}
          className="py-4 px-4"
        >
          <div className="flex justify-center relative top-[-15px]">
            <SlArrowDown
              size={18}
              color={telegramData?.themeParams.button_color}
            />
          </div>
          {/* <Cell> */}
          <Input
            placeholder="Название группы"
            // value={groupName}
            // onChange={(e) => setGroupName(e.target.value)}
          />
          {/* </Cell> */}
          <Cell>
            {/* <Input
                    placeholder="Описание группы"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  /> */}
          </Cell>
          <div className="flex items-center">
            <Button
              stretched
              mode="gray"
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
