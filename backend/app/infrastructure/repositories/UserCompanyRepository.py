from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.UserCompany.IUserCompanyRepository import (
    IUserCompanyRepository,
)
from app.models.dbModels.UserCompany.UserCompanyEntity import (
    UserCompanyEntity as UserCompany,
)


class UserCompanyRepository(IUserCompanyRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_company_by_id(self, record_id: int) -> Optional[UserCompany]:
        query = select(UserCompany).where(UserCompany.id == record_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_user_companies_for_user(self, user_id: int) -> List[UserCompany]:
        query = select(UserCompany).where(UserCompany.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create_user_company(self, uc_data: dict) -> UserCompany:
        new_uc = UserCompany(**uc_data)
        self.session.add(new_uc)
        await self.session.commit()
        await self.session.refresh(new_uc)
        return new_uc
