from app.infrastructure.db.session import fastapi_get_db 
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.infrastructure.repositories.UserRepository import UserRepository

db_dep = Annotated[AsyncSession, Depends(fastapi_get_db)]

def get_current_user(
    db: AsyncSession = Depends(fastapi_get_db), authorization: str | None = Header(None)
):
    if authorization is None:
        return None
    user = await UserRepository.get_user_by_id(authorization)
    return user.id
