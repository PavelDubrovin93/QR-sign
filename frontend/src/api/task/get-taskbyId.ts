import type { AxiosResponse } from "axios";
import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import type { Task } from "../../@types/task";

export const getTaskById = (taskboard_id: string) =>
  get<Task, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/taskboard/${taskboard_id}`
  );
