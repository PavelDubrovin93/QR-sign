import { useState } from "react";
import {
  Select,
  Section,
  Cell,
  Input,
  Button,
  Modal,
} from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import AdminGroupCard from "../components/AdminGroupCard";
import { SlArrowDown } from "react-icons/sl";

const AdminPage = () => {
  const [company, setCompany] = useState("");
  const [selectComponentColor, setSelectComponentColor] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const telegramData = getTelegramData();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGroupName("");
    setGroupDescription("");
  };

  const handleSaveGroup = () => {
    // тут нужен апи запрос на создание группы
    console.log("Добавляем группу:", { groupName, groupDescription });
    alert(`Группа "${groupName}" добавлена!`);
    handleCloseModal();
  };

  return (
    <>
      <div className="flex w-full justify-center px-5">
        <Button className="mb-4 w-full" onClick={handleOpenModal}>
          Добавить группу
        </Button>
      </div>
      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Компания
        </Section.Header>
        <Select
          status="focused"
          style={{ border: "none", color: "var(--tgui--text_color)" }}
        >
          <option>Компания А</option>
          <option>Компания Б</option>
        </Select>
        <Input status="focused" placeholder="Поиск" />
      </Section>
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
            <Button stretched onClick={handleSaveGroup} className="mx-5">
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
      <AdminGroupCard />
    </>
  );
};

export default AdminPage;
