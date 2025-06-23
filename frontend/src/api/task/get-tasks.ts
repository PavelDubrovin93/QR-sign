import { get } from "..";
import { config } from "../../config";
import { type TaskResponse } from "../types";

export const getTasks = () =>
  get<TaskResponse, void>(`${config.BACKEND_URL}/api/task`);
