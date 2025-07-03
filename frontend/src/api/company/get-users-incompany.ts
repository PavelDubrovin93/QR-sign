import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getUsersInCompany = (company_id: string) =>
  get<any, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/companies/get_all_users_in_company_and_uc_id/${company_id}`
  );
