import { post } from "..";
import type { CreateTaskPayload, Task } from "../../@types/task";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const createTask = (data: CreateTaskPayload) =>
  post<Task, CreateTaskPayload>(
    `${config.BACKEND_URL}/${apiPrefix.api}/taskboard`,
    data
  );
