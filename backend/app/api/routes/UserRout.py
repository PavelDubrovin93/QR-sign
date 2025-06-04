from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from infrastructure.db.session import fastapi_get_db
from models.dtoModels import UserDTO

router = APIRouter()

# @router.post("/user", status_code=201)
# async def register(user: UserDTO, session: AsyncSession = Depends(fastapi_get_db)):
#     user = await add_user(username=user.name, email=user.email, password=user.password, session=session)
#     return user
