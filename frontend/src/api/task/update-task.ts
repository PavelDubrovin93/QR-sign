import { patch } from "..";
import { config } from "../../configs/app.config";
import { type TaskRequest } from "../types";

export const updateTask = (data: TaskRequest, id: number | string) =>
  patch<void, TaskRequest>(`${config.BACKEND_URL}/api/task/edit/${id}`, {
    ...data,
  });
