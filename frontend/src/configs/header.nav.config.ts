interface HeaderNavItem {
  id: number;
  text: string;
  path_tab: string;
  path_taskboadId?: string;
  badge?: boolean;
}

interface RoleHeaderConfig {
  [key: string]: HeaderNavItem[];
}

const headerNavigationConfig: RoleHeaderConfig = {
  admin: [
    { id: 0, text: "Группы", path_tab: "/" },
    {
      id: 1,
      text: "Задачи",
      path_tab: "/admin-taskboard",
      // path_taskboadId: "/admin-taskboard/${task.id}",
    },
  ],
  user: [
    { id: 0, text: "Мои задачи", path_tab: "/", badge: true },
    { id: 2, text: "Профиль", path_tab: "/profile" },
  ],
};

export default headerNavigationConfig;
