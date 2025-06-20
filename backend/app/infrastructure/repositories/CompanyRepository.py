from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.Company.CompanyEntity import CompanyEntity as Company
from app.models.dbModels.Company.ICompanyRepository import ICompanyRepository
from app.models.dtoModels.CompanyDTO import CompanyDTO


class CompanyRepository(ICompanyRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_company_by_id(self, company_id: int) -> Optional[CompanyDTO]:
        query = select(Company).where(Company.id == company_id)
        result = await self.session.execute(query)
        company = result.scalars().first()
        return company.to_dto() if company else None

    async def get_companies(self) -> List[CompanyDTO]:
        query = select(Company)
        result = await self.session.execute(query)
        companies = result.scalars().all()
        return [company.to_dto() for company in companies]

    async def create_company(self, company_data: CompanyDTO) -> CompanyDTO:
        new_company = Company(
            title=company_data.title,
            description=company_data.description,
            image_url=company_data.image_url,
            invite_qr=company_data.invite_qr,
            subscription_type=company_data.subscription_type,
            expire_at=company_data.expire_at,
            )
        self.session.add(new_company)
        await self.session.commit()
        await self.session.refresh(new_company)
        return new_company.to_dto()

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
            invite_qr=company.invite_qr
        )
