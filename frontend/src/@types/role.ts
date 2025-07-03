export type Role = "admin" | "employer" | "not_approved";

export const Roles = {
  ADMIN: "admin",
  EMPLOYER: "employer",
  NOT_APPROVED: "not_approved",
} as const;
