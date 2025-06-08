from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.testservice import test_service
from app.services.testservice import create_company as create_company_service
from app.services.testservice import create_tb as create_tb_service
from app.services.testservice import create_wg as create_wg_service
from app.services.testservice import create_tp as create_tp_service

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

@router.post("/create_company")
async def create_company(session: AsyncSession = Depends(fastapi_get_db)):
    data = await create_company_service(session=session)
    return data


@router.post("/create_tb")
async def create_tb(session: AsyncSession = Depends(fastapi_get_db)):
    data = await create_tb_service(session=session)
    return data


@router.post("/create_wg")
async def create_wg(session: AsyncSession = Depends(fastapi_get_db)):
    data = await create_wg_service(session=session)
    return data


@router.post("/create_tp")
async def create_tp(session: AsyncSession = Depends(fastapi_get_db)):
    data = await create_tp_service(session=session)
    return data 