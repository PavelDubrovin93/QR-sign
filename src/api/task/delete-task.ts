import { Delete } from "..";
import { config } from "../../configs/app.config";

export const deleteTask = (id: number | string) =>
  Delete<void, void>(`${config.BACKEND_URL}/api/taskboard/${id}`);
