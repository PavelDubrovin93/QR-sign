import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export const getWorkGroupsByCompanyId = (company_id: string) =>
  get<any, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/workgroups/workgroups_and_taskboards_by_company_id/${company_id}`
  );
