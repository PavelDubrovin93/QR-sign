from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.session import fastapi_get_db
from app.api.dependenices.user_dependecy import get_current_user
from app.models.dtoModels.CompanyDTO import CompanyDTO
from app.models.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.services.CompanyService import CompanyService
from app.api.validation.InviteConformResponse import InviteConformResponse


router = APIRouter()

@router.post("", response_model=CompanyDTO)
async def create_company(
    new_company: CompanyDTO,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(fastapi_get_db)
    ) -> CompanyDTO:
    service = CompanyService(session)
    company = await service.create_new_company(current_user, new_company)
    return company

@router.get("{uc_id}", response_model=InviteConformResponse)
async def get_confirmation_info(
    uc_id: int,
    session: AsyncSession = Depends(fastapi_get_db)
):
    service = CompanyService(session)
    info = await service.get_confirmation_info(uc_id)
    if info is None:
        return {"error": "запись UserCompany не найдена"}
    return info

@router.post("{uc_id}", response_model=UserCompanyDTO)
async def update_user_company_role(
    uc_id: int,
    new_role: str,
    session: AsyncSession = Depends(fastapi_get_db)
    ) -> UserCompanyDTO:
    service = CompanyService(session)
    updated_uc = await service.update_user_company_role(uc_id, new_role)
    return updated_uc

@router.delete("{uc_id}")
async def delete_user_company(
    uc_id: int,
    session: AsyncSession = Depends(fastapi_get_db)
    ):
    service = CompanyService(session)
    await service.delete_user_company(uc_id)
    return {"message": "запись UserCompany удалена"}