from app.infrastructure.db.session import fastapi_get_db 
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.UserRepository import UserRepository


db_dep = Annotated[AsyncSession, Depends(fastapi_get_db)]

async def get_current_user(
    request: Request, session: AsyncSession = Depends(fastapi_get_db), authorization: int | None = Header(None)
):
    if authorization is None:
       raise HTTPException(status_code=403, detail="Authorization header is missing")
    
    user_repo = UserRepository(session)
    user = await user_repo.get_user_by_tg_id(tg_id=authorization)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
