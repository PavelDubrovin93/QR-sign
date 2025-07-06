import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface UserExistsResponse {
  exists: boolean;
  user_id: number | null;
  is_first_time: boolean;
}

export const checkUserExists = (tgId: number) =>
  get<UserExistsResponse, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/users/check/${tgId}`
  ); 