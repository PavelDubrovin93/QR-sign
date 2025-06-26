import type { Task } from "../@types/task";

export type TaskResponse = {
  data: Task[];
  // other fields...
};

export type TaskRequest = {
  data: {

  }
}

export interface User {
  id: number | null;
  tg_id: number | null;
  photo_url: string;
  name: string;
  ui_settings: number | null;
}