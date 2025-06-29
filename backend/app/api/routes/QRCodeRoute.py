from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.QRCodeService import QRCodeService
from app.validation.dtoModels.TaskPointDTO import TaskPointDTO
from app.validation.responses.QRCodeResponse import QRCodeResponse

from fastapi.responses import FileResponse

from PIL import Image
from reportlab.pdfgen import canvas
import qrcode
import os

router = APIRouter()


@router.get("/{qr_code_binary}/", response_model=TaskPointDTO)
async def get_task_point_by_qr_code(
    qr_code_binary: bytes, session: AsyncSession = Depends(fastapi_get_db)
) -> TaskPointDTO:
    service = QRCodeService(session)
    task_point = await service.get_task_point_by_qr_code(qr_code_binary)
    if task_point is None:
        raise HTTPException(status_code=404, detail="Task point not found")
    return task_point


@router.post("/create_qr_code_file")
async def create_qr_code_by_task_point_id(
    data: QRCodeResponse, session: AsyncSession = Depends(fastapi_get_db),
) -> FileResponse:
    
    service = QRCodeService(session)

    pdf_path = "qr_codes.pdf"
    c = canvas.Canvas(pdf_path)

    # Параметры для размещения QR-кодов
    cols = 2
    rows = 3
    qr_size = 150
    margin = 20
    page_width = 595
    page_height = 842

    for i, taskboard_id in enumerate(data.task_board_ids):
        if i > 0 and i % (cols * rows) == 0:
            c.showPage()

        url = f"{taskboard_id}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        temp_img_path = f"temp_qr_{taskboard_id}.png"
        img.save(temp_img_path)

        x = margin + (i % cols) * (qr_size + margin)
        y = page_height - margin - (i // cols % rows) * (qr_size + margin) - qr_size

        c.drawImage(temp_img_path, x, y, width=qr_size, height=qr_size)
        c.drawString(x, y - 15, url)

        os.remove(temp_img_path)

    c.save()

    return FileResponse(pdf_path, media_type='application/pdf', filename="qr_codes.pdf")