import '@telegram-apps/telegram-ui/dist/styles.css';


import Header from "./components/Header.tsx"
import RegistrationSteps from './components/RegistrationSteps';

import MainPage from "./pages/mainPage.tsx"
import ScanPage from "./pages/scanPage.tsx"
import ProfilePage from "./pages/profilePage.tsx"
import TaskboardPage from "./pages/taskboardPage.tsx"


import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom"



function App() {
  const webapp = window.Telegram?.WebApp;

  if (webapp) {
    webapp.setBackgroundColor(webapp.themeParams.secondary_bg_color);
  }

  return (
      <BrowserRouter>
        <RegistrationSteps />
        <div className='p-4'>
          <Header />
        </div> 
       
        <Routes>
          <Route index path="/" element={<MainPage />} />
          <Route path="/taskboard/:id" element={<TaskboardPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile" element={<ProfilePage/>} />
        </Routes>

      </BrowserRouter>
  );
};

export default App;
