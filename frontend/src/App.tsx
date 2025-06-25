import "@telegram-apps/telegram-ui/dist/styles.css";

// import RegistrationSteps from './components/RegistrationSteps';
import TaskCard from "./components/TaskCardOpened.tsx";
import Header from "./components/Header.tsx";
import headerNavigationConfig from "./configs/header.nav.config.ts";

import AdminLayout from "./components/layouts/AdminLayout.tsx";
import AdminPage from "./pages/adminPage.tsx";
import AdminTaskboardPage from "./pages/adminTaskboardPage.tsx";

import UserLayout from "./components/layouts/UserLayout.tsx";

import MainPage from "./pages/mainPage.tsx";
import ScanPage from "./pages/scanPage.tsx";
import ProfilePage from "./pages/profilePage.tsx";
import TaskboardPage from "./pages/taskboardPage.tsx";

import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  const webapp = window.Telegram?.WebApp;

  if (webapp) {
    webapp.setBackgroundColor(webapp.themeParams.secondary_bg_color);
  }

  //hard code, надо будет потом заменить и сделать enum
  const role: string = "admin";

  const renderLayout = () => {
    switch (role) {
      case "admin":
        return (
          <AdminLayout>
            {/* <RegistrationSteps /> */}
            <div className="p-4">
              <Header nav={headerNavigationConfig.admin} />
            </div>
            <Routes>
              <Route index path="/" element={<AdminPage />} />
              <Route path="/admin-taskboard" element={<AdminTaskboardPage />} />
              <Route path="/admin-taskboard/:id" element={<TaskCard editMode={true} />} />
            </Routes>
          </AdminLayout>
        );
      case "user":
        return (
          <UserLayout>
            {/* <RegistrationSteps /> */}
            <div className="p-4">
              <Header nav={headerNavigationConfig.user} count={50} />
            </div>
            <Routes>
              <Route index path="/" element={<MainPage />} />
              <Route path="/taskboard/:id" element={<TaskboardPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </UserLayout>
        );
      default:
        null;
    }
  };

  return <BrowserRouter>{renderLayout()}</BrowserRouter>;
}

export default App;
