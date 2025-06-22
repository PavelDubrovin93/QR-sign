import { post } from "..";
import { config } from "../../config";
import { type TaskRequest } from "../types";

export const createTask = (data: TaskRequest) =>
  post<void, TaskRequest>(`${config.BACKEND_URL}/api/task/create`, data);
