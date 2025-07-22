import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import { checkUserExists } from "./check-user-exists";

export interface UserRoleResponse {
  role: string;
  company_id: number;
  user_id: number;
}

export const getUserRole = async (companyId: number): Promise<string> => {
  const webapp = window.Telegram?.WebApp;
  const telegramUserId = webapp?.initDataUnsafe?.user?.id || 601732567;

  // Получаем правильный user_id по Telegram ID
  const userExistsResponse = await checkUserExists(telegramUserId);
  if (!userExistsResponse.data?.user_id) {
    throw new Error('User not found');
  }
  
  const userId = userExistsResponse.data.user_id;

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