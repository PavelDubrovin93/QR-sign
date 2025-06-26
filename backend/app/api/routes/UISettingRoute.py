from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dtoModels.UISettingsDTO import UISettingsDTO
from app.infrastructure.db.session import fastapi_get_db
from app.api.dependenices.user_dependecy import get_current_user
from app.services.UISettingsService import UISettingsService
from app.api.validation.UISettingResponse import UISettingResponse


router = APIRouter()

@router.get("/get_settings", response_model=UISettingsDTO)
async def get_user_settings(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(fastapi_get_db)
) -> UISettingsDTO:
    service = UISettingsService(session)
    settings = await service.get_user_settings(current_user)
    return settings

@router.post("/set_settings", response_model=UISettingsDTO)
async def update_user_settings(
    updated_settings: UISettingResponse,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(fastapi_get_db)
) -> UISettingsDTO:
    service = UISettingsService(session)
    updated = await service.update_user_settings(updated_settings)
    return updated
