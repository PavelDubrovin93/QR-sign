import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

export interface UpdateUserRoleRequest {
  id: number;
  user_id: number;
  company_id: number;
  workgroup_id?: number | null;
  role: "admin" | "employer" | "not_approved";
}

export interface UpdateUserRoleResponse {
  id: number;
  user_id: number;
  company_id: number;
  workgroup_id?: number | null;
  role: string;
}

export const updateUserRole = async (
  ucId: number,
  updateData: UpdateUserRoleRequest
): Promise<{ data: UpdateUserRoleResponse }> => {
  const url = `${config.BACKEND_URL}/${apiPrefix.api}/companies/${ucId}/role`;
  
  console.log("updateUserRole - Making request to:", url);
  console.log("updateUserRole - Request data:", updateData);
  
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    console.log("updateUserRole - Response status:", response.status);
    console.log("updateUserRole - Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("updateUserRole - Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log("updateUserRole - Response data:", data);
    return { data };
  } catch (error) {
    console.error("updateUserRole - Error:", error);
    throw error;
  }
}; 