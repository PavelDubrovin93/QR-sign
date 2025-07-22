import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import type { UsersInCompany } from "../../@types/user";

export interface UserWithRole extends UsersInCompany {
  role: string;
}

export const getUsersWithRoles = async (companyId: string): Promise<{ data: UserWithRole[] }> => {
  try {
    const webapp = window.Telegram?.WebApp;
    const telegramUserId = webapp?.initDataUnsafe?.user?.id || 123123123123; 
    
    const usersUrl = `${config.BACKEND_URL}/${apiPrefix.api}/companies/get_all_users_in_company_and_uc_id/${companyId}`;
    
    
    const usersResponse = await fetch(usersUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': telegramUserId?.toString() || "",
      },
    });
    
    if (!usersResponse.ok) {
      throw new Error(`HTTP error! status: ${usersResponse.status}`);
    }
    
    const users = await usersResponse.json();
    
    const usersWithRoles: UserWithRole[] = await Promise.all(
      users.map(async (user: any) => {
        try {
          const roleResponse = await fetch(`${config.BACKEND_URL}/${apiPrefix.api}/user_data/user_role/${companyId}/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': user.tg_id?.toString(),
            },
          });

          
          let userRole = 'not_approved';
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            userRole = roleData || 'not_approved';
          }

          const validRoles = ["owner", "admin", "foreman", "employer", "not_approved"];
          if (!validRoles.includes(userRole)) {
            userRole = 'not_approved';
          }
          
          return {
            ...user,
            role: userRole
          };
        } catch (error) {
          return {
            ...user,
            role: 'not_approved'
          };
        }
      })
    );
    
    return { data: usersWithRoles };
    
  } catch (error) {
    throw error;
  }
}; 