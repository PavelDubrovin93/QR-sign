import { Delete } from "..";
import { config } from "../../config";

export const deleteTask = (id: number | string) =>
  Delete<void, void>(`${config.BACKEND_URL}/api/task/delete/${id}`);
