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

export const createAdditionalUserCompany = async (data: UpdateUserCompanyRequest): Promise<{ data: UpdateUserCompanyResponse }> => {
  // Создаем новую запись UserCompany для прораба, который может быть в нескольких бригадах
  const response = await fetch(`${config.BACKEND_URL}/${apiPrefix.api}/companies/user-company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: data.user_id,
      company_id: data.company_id,
      workgroup_id: data.workgroup_id,
      role: data.role
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return { data: result };
};

export const deleteUserCompany = async (ucId: number): Promise<{ message: string }> => {
  // Удаляем запись UserCompany
  const response = await fetch(`${config.BACKEND_URL}/${apiPrefix.api}/companies/${ucId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result;
}; 