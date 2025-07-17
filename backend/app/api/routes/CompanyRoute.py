import re
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependenices.user_dependecy import get_current_user
from app.infrastructure.core.s3 import BASE64_PATTERN, S3Service
from app.infrastructure.db.session import fastapi_get_db
from app.services.CompanyService import CompanyService
from app.validation.dtoModels.CompanyDTO import CompanyDTO
from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.validation.responses.CompanyResposnse import CreateCompanyResponse
from app.validation.responses.InviteConformResponse import \
    InviteConformResponse
from app.validation.responses.UserResponse import UsersInCompanyResponse

router = APIRouter()


@router.post("", response_model=CompanyDTO)
async def create_company(
    new_company: CreateCompanyResponse,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(fastapi_get_db),
) -> CompanyDTO:

    if new_company.image_url != None and re.match(
        BASE64_PATTERN, new_company.image_url
    ):
        s3_service = S3Service()
        uploaded_url = s3_service.upload_image(new_company.image_url)
        if uploaded_url:
            new_company.image_url = uploaded_url
        else:
            raise HTTPException(
                status_code=500, detail="Ошибка при загрузке изображения."
            )

    service = CompanyService(session)
    company = await service.create_new_company(user=current_user, company=new_company)
    return company


@router.get("/{uc_id}", response_model=InviteConformResponse)
async def get_confirmation_info(
    uc_id: int, session: AsyncSession = Depends(fastapi_get_db)
):
    service = CompanyService(session)
    info = await service.get_confirmation_info(uc_id)
    if info is None:
        raise HTTPException(status_code=404, detail="UserCompany not found")
    return info


@router.put("/{uc_id}", response_model=UserCompanyDTO)
async def update_user_company_role(
    uc_id: int,
    new_user_company: UserCompanyDTO,
    session: AsyncSession = Depends(fastapi_get_db),
) -> UserCompanyDTO:
    service = CompanyService(session)
    updated_uc = await service.update_user_company(uc_id, new_user_company)
    return updated_uc


@router.put("/{uc_id}/role", response_model=UserCompanyDTO)
#  Лишняя ручка
async def update_user_company_role(
    uc_id: int,
    new_user_company: UserCompanyDTO,
    session: AsyncSession = Depends(fastapi_get_db),
) -> UserCompanyDTO:
    service = CompanyService(session)
    updated_uc = await service.update_user_company(uc_id, new_user_company)
    return updated_uc


@router.delete("/{uc_id}")
async def delete_user_company(
    uc_id: int, session: AsyncSession = Depends(fastapi_get_db)
):
    service = CompanyService(session)
    await service.delete_user_company(uc_id)
    return {"message": "запись UserCompany удалена"}


@router.get(
    "/get_all_users_in_company_and_uc_id/{company_id}",
    response_model=List[UsersInCompanyResponse],
)
async def get_user_companies(
    company_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(fastapi_get_db),
) -> List[UsersInCompanyResponse]:
    service = CompanyService(session)
    companies = await service.get_all_users_in_company_and_uc_id(company_id=company_id)
    return companies
