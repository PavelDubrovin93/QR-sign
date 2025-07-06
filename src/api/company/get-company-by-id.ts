import { get } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface CompanyInfo {
  id: number;
  title: string;
  description?: string;
  subscription_type?: string;
  expire_at?: string;
  invite_qr?: string;
  image_url?: string;
}

export const getCompanyById = (companyId: number) =>
  get<CompanyInfo, void>(
    `${config.BACKEND_URL}/${apiPrefix.api}/companies/${companyId}`
  ); 