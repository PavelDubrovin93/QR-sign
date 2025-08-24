import { post } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";
import type { WorkGroup } from "../../@types/group";

export const createWorkGroup = (data: any) =>
  post<WorkGroup, any>(
    `${config.BACKEND_URL}/${apiPrefix.api}/workgroups/create`,
    data
  );
