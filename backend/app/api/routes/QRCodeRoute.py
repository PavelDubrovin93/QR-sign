import os
import aiohttp
import asyncio

import qrcode
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependenices.user_dependecy import get_current_user
from app.infrastructure.db.session import fastapi_get_db
from app.services.QRCodeService import QRCodeService
from app.validation.dtoModels.TaskPointDTO import TaskPointDTO
from app.validation.responses.QRCodeResponse import QRCodeResponse

# Захардкоженный токен бота (замените на ваш)
TELEGRAM_BOT_TOKEN = "7860099344:AAGvWO6sG2l4qXwTJhGGJxKHEBvz0m0HFGk"
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

async def send_document_to_user(chat_id: int, file_path: str, caption: str = ""):
    """Отправляет документ пользователю через Telegram бота"""
    try:
        async with aiohttp.ClientSession() as session:
            with open(file_path, 'rb') as file:
                data = aiohttp.FormData()
                data.add_field('chat_id', str(chat_id))
                data.add_field('document', file, filename='qr_codes.pdf', content_type='application/pdf')
                if caption:
                    data.add_field('caption', caption)
                
                async with session.post(f"{TELEGRAM_API_URL}/sendDocument", data=data) as response:
                    result = await response.json()
                    return result.get('ok', False)
    except Exception as e:
        print(f"Ошибка отправки файла: {e}")
        return False

router = APIRouter()


token = "7435937163:AAH3zVpfI2BFkMElcONYFhSTSsZQNYfqDQo"

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
    data: QRCodeResponse,
    session: AsyncSession = Depends(fastapi_get_db),
    current_user = Depends(get_current_user),
) -> dict:

    service = QRCodeService(session)

    # Проверяем что task_board_ids не пустой
    if not data.task_board_ids:
        raise HTTPException(status_code=400, detail="task_board_ids is required")

    pdf_path = "qr_codes.pdf"
    c = canvas.Canvas(pdf_path)

    cols = 2
    rows = 3
    qr_size = 150
    margin = 20
    page_width = 595
    page_height = 842

    for i, taskboard_id in enumerate(data.task_board_ids):
        if i > 0 and i % (cols * rows) == 0:
            c.showPage()

        url = f"DOMENTUT/taskboard/{taskboard_id}"  # admin - /admin-taskboard/1
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

    # Отправляем файл пользователю через Telegram бота
    try:
        success = await send_document_to_user(
            chat_id=current_user.tg_id,
            file_path=pdf_path,
            caption=f"QR-коды для {len(data.task_board_ids)} таскбордов"
        )
        
        # Удаляем временный файл
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        if success:
            return {"message": "QR-коды отправлены в Telegram", "status": "success"}
        else:
            return {"message": "Ошибка отправки в Telegram", "status": "error"}
            
    except Exception as e:
        # Удаляем временный файл в случае ошибки
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=f"Ошибка отправки файла: {str(e)}")
