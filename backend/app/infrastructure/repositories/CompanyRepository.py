from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.Company.CompanyEntity import CompanyEntity as Company
from app.models.dbModels.Company.ICompanyRepository import IUserRepository


class CompanyRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_company_by_id(self, company_id: int) -> Optional[Company]:
        query = select(Company).where(Company.id == company_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_companies(self) -> List[Company]:
        query = select(Company)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create_company(self, company_data: dict) -> Company:
        new_company = Company(**company_data)
        self.session.add(new_company)
        await self.session.commit()
        await self.session.refresh(new_company)
        return new_company
