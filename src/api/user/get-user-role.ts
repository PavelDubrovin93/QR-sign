import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface UserRoleResponse {
  role: string;
  company_id: number;
  user_id: number;
}

export const getUserRole = async (companyId: number): Promise<UserRoleResponse> => {
  const telegramUserId = 868007436; //webapp?.initDataUnsafe?.user?.id;

  const response = await fetch(
    `${config.BACKEND_URL}/${apiPrefix.api}/user_data/user_role/${companyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": telegramUserId?.toString() || "868007436",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching user role: ${response.statusText}`);
  }

  return response.json();
}; 