import { get } from "..";
import type { AmountTasks } from "../../@types/task";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getAmountTasks = () =>
  get<AmountTasks, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/user_data/amount_of_new_tasks`
  );
