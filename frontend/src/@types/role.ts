export type Role = "owner" | "admin" | "foreman" | "employer" | "not_approved";

export const Roles = {
  OWNER: "owner",
  ADMIN: "admin",
  FOREMAN: "foreman",
  EMPLOYER: "employer",
  NOT_APPROVED: "not_approved",
} as const;
