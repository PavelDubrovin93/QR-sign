import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import type { UsersInCompany } from "../../@types/user";

export interface UserWithRole extends UsersInCompany {
  role: string;
}

export const getUsersWithRoles = async (companyId: string): Promise<{ data: UserWithRole[] }> => {
  try {
    const telegramUserId = 12312312; //webapp?.initDataUnsafe?.user?.id;
    
    const usersUrl = `${config.BACKEND_URL}/${apiPrefix.api}/companies/get_all_users_in_company_and_uc_id/${companyId}`;
    console.log("getUsersWithRoles - Getting users from:", usersUrl);
    console.log("getUsersWithRoles - Using telegram_id:", telegramUserId);
    
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
    console.log("getUsersWithRoles - Users response:", users);
    
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

          console.log("getUsersWithRoles - Role response:", roleResponse);
          
          let userRole = 'not_approved';
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            userRole = roleData || 'not_approved';
            console.log(`getUsersWithRoles - Fetched role for user ${user.name}: ${userRole}`);
          } else {
            console.log(`getUsersWithRoles - Failed to fetch role for user ${user.name}, using default: not_approved`);
          }
          
          const validRoles = ["admin", "employer", "not_approved"];
          if (!validRoles.includes(userRole)) {
            console.log(`getUsersWithRoles - Invalid role for user ${user.name}: ${userRole}, setting to not_approved`);
            userRole = 'not_approved';
          }
          
          return {
            ...user,
            role: userRole
          };
        } catch (error) {
          console.error(`getUsersWithRoles - Error fetching role for user ${user.name}:`, error);
          return {
            ...user,
            role: 'not_approved'
          };
        }
      })
    );
    
    console.log("getUsersWithRoles - Users with validated roles:", usersWithRoles);
    return { data: usersWithRoles };
    
  } catch (error) {
    console.error("getUsersWithRoles - Error:", error);
    throw error;
  }
}; 