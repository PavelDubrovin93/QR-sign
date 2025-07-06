import type { Task } from "../@types/task";

export type TaskResponse = {
  data: Task[];
  // other fields...
};

export type TaskRequest = {
  data: {};
};
