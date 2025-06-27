import type { AxiosResponse } from "axios";
import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import type { User } from "../../@types/user";

export const getUserProfile = () =>
  get<User, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/settings/get_settings`
  );
