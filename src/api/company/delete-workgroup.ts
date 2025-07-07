import { Delete } from "../index";

export interface DeleteWorkgroupRequest {
  workgroup_id: number;
}

export interface DeleteWorkgroupResponse {
  message: string;
}

export const deleteWorkgroup = async (
  workgroupId: number
): Promise<DeleteWorkgroupResponse> => {
  try {
    const response = await Delete<DeleteWorkgroupResponse, any>(
      `/api/workgroups/delete/${workgroupId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting workgroup:", error);
    throw error;
  }
}; 