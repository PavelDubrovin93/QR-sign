from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.UserService import UserService
from app.validation.dtoModels.UserDTO import UserDTO

router = APIRouter()


@router.post("", response_model=UserDTO, status_code=201)
async def cold_register(
    new_user_data: UserDTO, session: AsyncSession = Depends(fastapi_get_db)
) -> UserDTO:
    service = UserService(session)
    user = await service.register_user_cold(new_user_data)
    return user


@router.post("/{company_id}", response_model=UserDTO, status_code=201)
async def hot_register(
    company_id: int,
    new_user_data: UserDTO,
    session: AsyncSession = Depends(fastapi_get_db),
) -> UserDTO:
    service = UserService(session)
    user = await service.register_user_hot(company_id, new_user_data)
    return user
