import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import type { Task } from "../../@types/task";

export const getTasksByCompany = (company_id: string) =>
  get<Task[], void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/taskboard/get_tasks_by_company/${company_id}`
  );
