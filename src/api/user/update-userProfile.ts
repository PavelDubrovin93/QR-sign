import { post } from "..";
import type { User } from "../../@types/user";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const updateUserProfile = (data: User) =>
  post<void, User>(
    `${config.BACKEND_URL}/${apiPrefix.api}/settings/set_settings`,
    {
      ...data,
    }
  );
