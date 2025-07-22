import { useMemo } from 'react';
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';

interface UseTelegramReturn {
  webapp: any;
  telegramData: any;
  userId: number;
  themeParams: any;
  setBackgroundColor: (color: "bg_color" | "secondary_bg_color" | `#${string}`) => void;
}

export const useTelegram = (): UseTelegramReturn => {
  const webapp = window.Telegram?.WebApp;
  const telegramData = getTelegramData();
  
  const userId = useMemo(() => {
    return webapp?.initDataUnsafe?.user?.id || 123123123123;
  }, [webapp?.initDataUnsafe?.user?.id]);

  const themeParams = useMemo(() => {
    return telegramData?.themeParams;
  }, [telegramData?.themeParams]);

  const setBackgroundColor = (color: "bg_color" | "secondary_bg_color" | `#${string}`) => {
    if (webapp) {
      webapp.setBackgroundColor(color);
    }
  };

  return {
    webapp,
    telegramData,
    userId,
    themeParams,
    setBackgroundColor,
  };
}; 