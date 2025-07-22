import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface UserRoleResponse {
  role: string;
  company_id: number;
  user_id: number;
}

export const getUserRole = async (companyId: number, userId: number): Promise<string> => {
  const webapp = window.Telegram?.WebApp;
  const telegramUserId = webapp?.initDataUnsafe?.user?.id || 601732567;

  const response = await fetch(
    `${config.BACKEND_URL}/${apiPrefix.api}/user_data/user_role/${companyId}/${userId}`,
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