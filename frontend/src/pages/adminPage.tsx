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
            placeholder="Название группы"
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
