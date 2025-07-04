import { put } from "..";
import type { Task } from "../../@types/task";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const editTask = (data: Task) =>
  put<Task, Task>(`${config.BACKEND_URL}/${apiPrefix.api}/taskboard`, {
    ...data,
  });
