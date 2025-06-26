import type { AxiosResponse } from "axios";
import { get } from "..";
import { config } from "../../configs/app.config";
import { type User } from "../types";

export const getUserProfile = () =>
  get<AxiosResponse<User>, void>(`${config.BACKEND_URL}/users/get_user_data`);
