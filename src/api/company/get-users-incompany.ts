import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getUsersInCompany = async (company_id: string) => {
  const url = `${config.BACKEND_URL}/${apiPrefix.api}/companies/get_all_users_in_company_and_uc_id/${company_id}`;
  console.log("getUsersInCompany - Making request to:", url);
  
  try {
    const response = await get<any, void>(url);
    console.log("getUsersInCompany - Response:", response);
    return response;
  } catch (error) {
    console.error("getUsersInCompany - Error:", error);
    throw error;
  }
};
