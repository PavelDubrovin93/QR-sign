import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getAmountTasks = () =>
  get<number, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/user_data/amount_of_new_tasks`
  );
