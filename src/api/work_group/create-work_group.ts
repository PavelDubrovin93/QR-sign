import { post } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const createWorkGroup = (data: any) =>
  post<void, any>(
    `${config.BACKEND_URL}/${apiPrefix.api}/workgroups/create`,
    data
  );
