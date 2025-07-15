import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

interface CreateQRCodesPayload {
  task_board_ids: number[];
}

interface QRCodeResponse {
  message: string;
  status: string;
}

export async function createQRCodes(payload: CreateQRCodesPayload): Promise<QRCodeResponse> {
  const response = await fetch(`${config.BACKEND_URL}/${apiPrefix.api}/qr_code/create_qr_code_file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
} 