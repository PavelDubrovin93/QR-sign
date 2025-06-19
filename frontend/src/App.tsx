import '@telegram-apps/telegram-ui/dist/styles.css';
import { AppRoot, Placeholder} from '@telegram-apps/telegram-ui';

import Header from "./components/Header.tsx"

import MainPage from "./pages/mainPage.tsx"
import ScanPage from "./pages/scanPage.tsx"
import ProfilePage from "./pages/profilePage.tsx"
import TaskboardPage from "./pages/taskboardPage.tsx"

import ImageWithTaskPoints from './components/ZoomableImage.tsx';


import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom"

import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';


function App() {
  const telegramData = getTelegramData();
  // if (!telegramData) {
  //   return;
  // }



  const webapp = window.Telegram?.WebApp;
  if (webapp && telegramData?.themeParams.secondary_bg_color) {
    webapp.setBackgroundColor(telegramData.themeParams.secondary_bg_color);
  }

  return (
      <BrowserRouter>
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
