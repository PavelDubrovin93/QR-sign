import { get } from "..";
import type { WorkGroup } from "../../@types/group";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getWorkGroupsSelect = (company_id: string) =>
  get<WorkGroup[], void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/workgroups/workgroups_by_company/${company_id}`
  );
