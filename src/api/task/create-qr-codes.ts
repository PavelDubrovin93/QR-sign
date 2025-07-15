import { post } from "..";
import { config } from "../../configs/app.config";
import { apiPrefix } from "../constants";

interface CreateQRCodesPayload {
  task_board_ids: number[];
}

interface QRCodeResponse {
  message: string;
  status: string;
}

export const createQRCodes = (payload: CreateQRCodesPayload) =>
  post<QRCodeResponse, CreateQRCodesPayload>(
    `${config.BACKEND_URL}/${apiPrefix.api}/qr_code/create_qr_code_file`,
    payload
  ); 