from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.interfaces.repositories.ICompanyRepository import (
    ICompanyRepository,
)
from app.models.dbModels.Company.CompanyEntity import CompanyEntity as Company
from app.validation.dtoModels.CompanyDTO import CompanyDTO
from app.validation.responses.CompanyResposnse import CreateCompanyResponse


class CompanyRepository(ICompanyRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_company_by_id(self, company_id: int) -> Optional[CompanyDTO]:
        query = select(Company).where(Company.id == company_id)
        result = await self.session.execute(query)
        company = result.scalar_one_or_none()
        company_dto = await self.__to_dto(company) if company else None
        return company_dto

    async def get_companies(self) -> List[CompanyDTO]:
        query = select(Company)
        result = await self.session.execute(query)
        companies = result.scalars().all()
        companies_dto = [await self.__to_dto(company) for company in companies]
        return companies_dto

    async def create_company(self, company_data: CreateCompanyResponse) -> CompanyDTO:
        new_company = Company(
            title=company_data.title,
            description=company_data.description,
            image=company_data.image_url,
            invite_qr=company_data.invite_qr,
            subscription_type=company_data.subscription_type,
            expire_at=company_data.expire_at,
        )
        self.session.add(new_company)
        await self.session.commit()
        await self.session.refresh(new_company)
        company_dto = await self.__to_dto(new_company) if new_company else None
        return company_dto

    async def delete_company_by_id(self, company_id: int) -> None:
        query = select(Company).where(Company.id == company_id)
        result = await self.session.execute(query)
        company_to_delete = result.scalars().first()
        if company_to_delete is None:
            raise ValueError(f"Компания с id {company_id} не существует.")
        await self.session.delete(company_to_delete)
        await self.session.commit()

    async def __to_dto(self, company: Company) -> CompanyDTO:
        return CompanyDTO(
            id=company.id,
            title=company.title,
            image=company.image,
            description=company.description,
            subscription_type=company.subscription_type,
            expire_at=company.expire_at,
            invite_qr=company.invite_qr,
        )
