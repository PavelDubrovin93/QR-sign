import { post } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface CreateCompanyRequest {
  title: string;
  description?: string;
  subscription_type?: string;
  expire_at?: string;
  invite_qr?: string;
  image_url?: string;
}

export interface CreateCompanyResponse {
  id: number;
  title: string;
  description?: string;
  subscription_type?: string;
  expire_at?: string;
  invite_qr?: string;
  image_url?: string;
}

export const createCompany = (data: CreateCompanyRequest) =>
  post<CreateCompanyResponse, CreateCompanyRequest>(
    `${config.BACKEND_URL}/${apiPrefix.api}/companies`,
    data
  ); 