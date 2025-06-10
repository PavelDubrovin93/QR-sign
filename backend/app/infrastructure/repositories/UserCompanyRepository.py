from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.UserCompany.IUserCompanyRepository import (
    IUserCompanyRepository,
)
from app.models.dbModels.UserCompany.UserCompanyEntity import (
    UserCompanyEntity as UserCompany,
)
from app.models.dtoModels.UserCompanyDTO import UserCompanyDTO


class UserCompanyRepository(IUserCompanyRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_company_by_id(self, record_id: int) -> Optional[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.id == record_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_user_companies_for_user(self, user_id: int) -> List[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create_user_company(self, uc_data: UserCompanyDTO) -> Optional[UserCompanyDTO]:
        new_uc = UserCompany(
            user_id=uc_data.user_id,
            company_id=uc_data.company_id,
            workgroup_id=uc_data.workgroup_id,
            role=uc_data.role
        )
        self.session.add(new_uc)
        await self.session.commit()
        await self.session.refresh(new_uc)
        return new_uc.to_dto()

    async def delete_user_company_by_id(self, user_company_id: int) -> None:
        query = select(UserCompany).where(UserCompany.id == user_company_id)
        result = await self.session.execute(query)
        user_company_to_delete = result.scalars().first()
        if user_company_to_delete is None:
            raise ValueError(f"Запись UC с id {user_company_to_delete} не существует.")
        await self.session.delete(user_company_to_delete)
        await self.session.commit()