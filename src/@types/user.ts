export interface User {
  id: number | null;
  user_id: number | null;
  default_company_choice: number | null;
  default_color: string;
  current_role: string;
  name_for_admin: string;
}

export interface UserCompanies {
  company_id: number | null;
  company_name: string;
  role: string;
}

export interface UsersInCompany {
  id: number | null;
  name: string;
  photo_url: string;
  tg_id: number | null;
  uc_id: number | null;
  workgroup_id: number | null;
  role?: string;
}
