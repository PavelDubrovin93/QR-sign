from app.infrastructure.db.session import fastapi_get_db 
from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.UserRepository import UserRepository

from logging import getLogger
logger = getLogger(__name__)

db_dep = Annotated[AsyncSession, Depends(fastapi_get_db)]

async def get_current_user(
    db: AsyncSession = Depends(fastapi_get_db), authorization: str | None = Header(None)
):
    if authorization is None:
        return None

    user = await UserRepository.get_user_by_tg_id(authorization)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
