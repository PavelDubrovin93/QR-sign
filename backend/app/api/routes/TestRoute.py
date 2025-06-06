from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.testservice import test_service

router = APIRouter()

# @router.post("/user", status_code=201)
# async def register(user: UserDTO, session: AsyncSession = Depends(fastapi_get_db)):
#     user = await add_user(username=user.name, email=user.email, password=user.password, session=session)
#     return user


@router.get("/test")
async def test():
    return {"test": "test"}


@router.post("/create_user")
async def create_user(session: AsyncSession = Depends(fastapi_get_db)):
    data = await test_service(session=session)
    return data
