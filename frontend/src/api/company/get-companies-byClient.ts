import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getCompaniesByClient = () =>
// позже поменять тип
  get<any, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/user_data/get_user_companies`
  );
