from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.UserService import UserService
from app.validation.responses.UserResponse import CreateUserResponse, UserResponse
from app.infrastructure.repositories.UserRepository import UserRepository
from starlette.status import HTTP_204_NO_CONTENT

router = APIRouter()



@router.get("/check/{tg_id}", response_model=dict)
async def check_user_exists(
    tg_id: int, session: AsyncSession = Depends(fastapi_get_db)
) -> dict:
    user_repo = UserRepository(session)
    user = await user_repo.get_user_by_tg_id(tg_id=tg_id)
    
    return {
        "exists": user is not None,
        "user_id": user.id if user else None,
        "is_first_time": user is None
    }

@router.post("", response_model=UserResponse, status_code=201)
async def cold_register(
    new_user_data: CreateUserResponse, session: AsyncSession = Depends(fastapi_get_db)
) -> UserResponse:
    service = UserService(session)
    user = await service.register_user_cold(new_user_data)
    return user


@router.delete("/{user_id}", status_code=HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(fastapi_get_db),
):
    service = UserService(session)
    deleted_user = await service.delete_user(user_id)
    
    if not deleted_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")


@router.post("/{company_id}", response_model=UserResponse, status_code=201)
async def hot_register(
    company_id: int,
    new_user_data: CreateUserResponse,
    session: AsyncSession = Depends(fastapi_get_db),
) -> UserResponse:
    service = UserService(session)
    user = await service.register_user_hot(company_id, new_user_data)
    return user
