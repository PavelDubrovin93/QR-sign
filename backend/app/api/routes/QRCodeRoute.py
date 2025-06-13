from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dtoModels.TaskPointDTO import TaskPointDTO
from app.infrastructure.db.session import fastapi_get_db
from app.services.QRCodeService import QRCodeService

router = APIRouter()

@router.get("/{qr_code_binary}/", response_model=TaskPointDTO)
async def get_task_point_by_qr_code(qr_code_binary: bytes, session: AsyncSession = Depends(fastapi_get_db)) -> TaskPointDTO:
    service = QRCodeService(session)
    task_point = await service.get_task_point_by_qr_code(qr_code_binary)
    if task_point is None:
        raise HTTPException(status_code=404, detail="Task point not found")
    return task_point
