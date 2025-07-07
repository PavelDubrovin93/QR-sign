import { useState } from "react";
import { Section, Button, Modal, Input, Radio, Cell } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { SlArrowDown } from "react-icons/sl";
import type { UsersInCompany } from "../@types/user";
import { updateUserRole } from "../api/company/update-user-role";
import Loading from "./Loading";

interface NotApprovedUsersCardProps {
  data: UsersInCompany[];
  loading: boolean;
  onDataRefresh: () => void;
  companyId: number;
}

interface RoleSelection {
  userId: number;
  ucId: number;
  userName: string;
  companyId: number;
  workgroupId?: number | null;
}

const NotApprovedUsersCard = ({ data, loading, onDataRefresh, companyId }: NotApprovedUsersCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "employer">("employer");
  const [selectedUser, setSelectedUser] = useState<RoleSelection | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const telegramData = getTelegramData();

  // Filter users with not_approved role (including variations)
  const notApprovedUsers = data.filter(user => {
    const role = user.role?.toLowerCase();
    return role === "not_approved" || role === "pending" || role === "not approved";
  });

  const handleUserClick = (user: UsersInCompany) => {
    setSelectedUser({
      userId: user.id || 0,
      ucId: user.uc_id || 0,
      userName: user.name,
      companyId: companyId,
      workgroupId: user.workgroup_id,
    });
    setSelectedRole("employer");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSelectedRole("employer");
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser.ucId, {
        id: selectedUser.ucId,
        user_id: selectedUser.userId,
        company_id: selectedUser.companyId,
        workgroup_id: selectedUser.workgroupId,
        role: selectedRole,
      });

      onDataRefresh();
      handleCloseModal();
    } catch (error) {
      console.error("Ошибка при обновлении роли:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          На подтверждении
        </Section.Header>
        <div className="flex justify-center items-center h-20">
          <Loading size={30} color={"#2a90ff"} />
          <span style={{ marginLeft: "10px", color: "var(--tgui--text_color)" }}>
            Загрузка пользователей...
          </span>
        </div>
      </Section>
    );
  }

  if (notApprovedUsers.length === 0) {
    return null;
  }

  return (
    <>
      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          На подтверждении ({notApprovedUsers.length})
        </Section.Header>
        <div className="space-y-2">
          {notApprovedUsers.map((user) => (
            <div
              key={user.uc_id}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ожидает подтверждения
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                  Не подтвержден
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        dismissible={!isUpdating}
        modal={true}
        preventScrollRestoration={true}
      >
        <div
          style={{
            
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
          }}
          className="py-4 px-4 top-shadow-container"
        >
          <div className="flex justify-center relative top-[-10px]">
            <SlArrowDown size={26} />
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Установка роли
            </h2>
            <Input
              placeholder="Имя пользователя"
              value={selectedUser?.userName || ""}
              disabled={true}
              className="mb-3"
            />
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Выберите роль:
            </h3>
            <div className="space-y-2">
              <Cell
                Component="label"
                before={
                  <Radio
                    name="role"
                    value="employer"
                    checked={selectedRole === "employer"}
                    onChange={() => setSelectedRole("employer")}
                    disabled={isUpdating}
                  />
                }
              >
                <p style={{ color: "var(--tgui--text_color)" }}>Сотрудник</p>
              </Cell>
              <Cell
                Component="label"
                before={
                  <Radio
                    name="role"
                    value="admin"
                    checked={selectedRole === "admin"}
                    onChange={() => setSelectedRole("admin")}
                    disabled={isUpdating}
                  />
                }
              >
                <p style={{ color: "var(--tgui--text_color)" }}>Админ</p>
              </Cell>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <Button
              stretched
              mode="bezeled"
              onClick={handleCloseModal}
              className="mx-2"
              disabled={isUpdating}
            >
              Отмена
            </Button>
            <Button
              stretched
              onClick={handleUpdateRole}
              className="mx-2"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <Loading size={16} color={"#ffffff"} />
                  <span className="ml-2">Обновление...</span>
                </div>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default NotApprovedUsersCard; 