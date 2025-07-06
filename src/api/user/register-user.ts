import { post } from "..";
import type { User } from "../../@types/user";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface CreateUserRequest {
  tg_id: number;
  name: string;
  photo_url: string;
}

export interface UserRegistrationResponse {
  id: number;
  tg_id: number;
  name: string;
  photo_url: string;
  ui_settings: number;
}

export const registerUserCold = (data: CreateUserRequest) =>
  post<UserRegistrationResponse, CreateUserRequest>(
    `${config.BACKEND_URL}/${apiPrefix.api}/users`,
    data
  );

export const registerUserHot = (companyId: number, data: CreateUserRequest) =>
  post<UserRegistrationResponse, CreateUserRequest>(
    `${config.BACKEND_URL}/${apiPrefix.api}/users/${companyId}`,
    data
  ); 