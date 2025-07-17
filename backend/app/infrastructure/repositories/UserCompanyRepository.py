from typing import List, Optional

from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.interfaces.repositories.IUserCompanyRepository import \
    IUserCompanyRepository
from app.models.dbModels.UserCompany.UserCompanyEntity import \
    UserCompanyEntity as UserCompany
from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO


class UserCompanyRepository(IUserCompanyRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_company_by_id(self, record_id: int) -> Optional[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.id == record_id)
        result = await self.session.execute(query)
        usercompany = result.scalar_one_or_none()
        usercompany_dto = await self.__to_dto(usercompany) if usercompany else None
        return usercompany_dto

    async def get_user_company_by_company_id(
        self, company_id: int
    ) -> Optional[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.company_id == company_id)
        result = await self.session.execute(query)
        usercompany = result.scalars().first()
        usercompany_dto = await self.__to_dto(usercompany) if usercompany else None
        return usercompany_dto

    async def get_user_companies_for_user(self, user_id: int) -> List[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.user_id == user_id)
        result = await self.session.execute(query)
        usercompanies = result.scalars().all()
        usercompanies_dto = [
            await self.__to_dto(usercompany) if usercompany else None
            for usercompany in usercompanies
        ]
        return usercompanies_dto

    async def create_user_company(
        self, uc_data: UserCompanyDTO
    ) -> Optional[UserCompanyDTO]:
        new_uc = UserCompany(
            user_id=uc_data.user_id,
            company_id=uc_data.company_id,
            workgroup_id=uc_data.workgroup_id,
            role=uc_data.role,
        )

        self.session.add(new_uc)
        await self.session.commit()
        await self.session.refresh(new_uc)
        usercompany_dto = await self.__to_dto(new_uc) if new_uc else None
        return usercompany_dto

    async def update_user_company(
        self, uc_data: UserCompanyDTO
    ) -> Optional[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.id == uc_data.id)
        result = await self.session.execute(query)
        existing_uc = result.scalars().first()
        if existing_uc is None:
            new_uc = self.create_user_company(uc_data)
            return new_uc
        existing_uc.user_id = uc_data.user_id
        existing_uc.company_id = uc_data.company_id
        existing_uc.workgroup_id = uc_data.workgroup_id
        existing_uc.role = uc_data.role
        await self.session.commit()
        await self.session.refresh(existing_uc)
        uc_dto = await self.__to_dto(existing_uc) if existing_uc else None
        return uc_dto

    async def delete_user_company_by_id(self, user_company_id: int) -> None:
        query = select(UserCompany).where(UserCompany.id == user_company_id)
        result = await self.session.execute(query)
        user_company_to_delete = result.scalars().first()
        if user_company_to_delete is None:
            raise ValueError(f"Запись UC с id {user_company_to_delete} не существует.")
        await self.session.delete(user_company_to_delete)
        await self.session.commit()

    async def get_all_users_in_company_with_company_id(
        self, company_id: int
    ) -> List[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.company_id == company_id)
        result = await self.session.execute(query)
        usercompanies = result.scalars().all()

        usercompanies_dto = [
            await self.__to_dto(usercompany) if usercompany else None
            for usercompany in usercompanies
        ]

        return usercompanies_dto

    async def get_all_uc_in_company_by_workgroup_id(
        self, workgroup_id: int
    ) -> List[UserCompanyDTO]:
        query = select(UserCompany).where(UserCompany.workgroup_id == workgroup_id)
        result = await self.session.execute(query)
        usercompanies = result.scalars().all()
        usercompanies_dto = [
            await self.__to_dto(usercompany) if usercompany else None
            for usercompany in usercompanies
        ]

        return usercompanies_dto

    async def get_user_company_by_company_id_and_user_id(
        self, company_id: int, user_id: int
    ) -> Optional[UserCompanyDTO]:
        query = select(UserCompany).where(
            and_(UserCompany.company_id == company_id, UserCompany.user_id == user_id)
        )

        result = await self.session.execute(query)
        usercompany = result.scalars().first()

        usercompany_dto = await self.__to_dto(usercompany) if usercompany else None
        return usercompany_dto

    async def __to_dto(self, usercompany: UserCompany) -> UserCompanyDTO:
        return UserCompanyDTO(
            id=usercompany.id,
            user_id=usercompany.user_id,
            company_id=usercompany.company_id,
            workgroup_id=usercompany.workgroup_id,
            role=usercompany.role,
        )
