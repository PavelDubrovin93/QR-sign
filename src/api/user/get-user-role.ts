import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface UserRoleResponse {
  role: string;
  company_id: number;
  user_id: number;
}

export const getUserRole = async (companyId: number): Promise<UserRoleResponse> => {
  const webapp = window.Telegram?.WebApp;
  const telegramUserId = webapp?.initDataUnsafe?.user?.id || 4444444444; //webapp?.initDataUnsafe?.user?.id || 4444444444;

  const response = await fetch(
    `${config.BACKEND_URL}/${apiPrefix.api}/user_data/user_role/${companyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": telegramUserId?.toString() || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching user role: ${response.statusText}`);
  }

  return response.json();
}; 