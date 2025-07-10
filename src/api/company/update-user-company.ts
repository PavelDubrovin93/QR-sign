import { put } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface UpdateUserCompanyRequest {
  user_id: number;
  company_id: number;
  workgroup_id: number | null;
  role?: string;
}

export interface UpdateUserCompanyResponse {
  id: number;
  user_id: number;
  company_id: number;
  workgroup_id: number | null;
  role: string;
}

export const updateUserCompany = (uc_id: number, data: UpdateUserCompanyRequest) =>
  put<UpdateUserCompanyResponse, UpdateUserCompanyRequest>(
    `${config.BACKEND_URL}/${apiPrefix.api}/companies/${uc_id}`,
    data
  );

export const createUserCompany = (data: UpdateUserCompanyRequest) =>
  put<UpdateUserCompanyResponse, UpdateUserCompanyRequest>(
    `${config.BACKEND_URL}/${apiPrefix.api}/companies/0`,
    data
  ); 