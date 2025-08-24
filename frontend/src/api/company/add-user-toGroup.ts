import { put } from "..";
import type { Task } from "../../@types/task";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const addUserToGroup = (data: any, company_id: string) =>
  put<Task, Task>(
    `${config.BACKEND_URL}/${apiPrefix.api}/companies/${company_id}`,
    {
      ...data,
    }
  );
