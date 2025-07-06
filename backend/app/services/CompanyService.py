from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.InviteConformResponse import InviteConformResponse
from app.infrastructure.interfaces.services.ICompanyService import ICompanyService
from app.infrastructure.repositories.CompanyRepository import CompanyRepository
from app.infrastructure.repositories.UserCompanyRepository import UserCompanyRepository
from app.infrastructure.repositories.UserRepository import UserRepository
from app.validation.dtoModels.CompanyDTO import CompanyDTO
from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.validation.dtoModels.UserDTO import UserDTO
from app.validation.responses.CompanyResposnse import CreateCompanyResponse
from app.validation.responses.UserResponse import UsersInCompanyResponse
from app.models.dbEnums.RoleType import RoleType

from typing import List


class CompanyService(ICompanyService):

    def __init__(self, session: AsyncSession):
        self.uc_repo = UserCompanyRepository(session)
        self.company_repo = CompanyRepository(session)
        self.user_repo = UserRepository(session)

    async def create_new_company(
        self, user: UserDTO, company: CreateCompanyResponse
    ) -> Optional[CompanyDTO]:
        new_copmany = await self.company_repo.create_company(company)
        await self.uc_repo.create_user_company(
            UserCompanyDTO(
                user_id=user.id,
                company_id=new_copmany.id,
                workgroup_id=None,
                role=RoleType.ADMIN,
            )
        )
        return new_copmany

    async def get_confirmation_info(
        self, uc_id: int
    ) -> Optional[InviteConformResponse]:
        uc = await self.uc_repo.get_user_company_by_id(uc_id)
        if uc is None:
            return None

        user = await self.user_repo.get_user_by_id(uc.user_id)
        company = await self.company_repo.get_company_by_id(uc.company_id)

        confirmation_info = InviteConformResponse(
            user_name=user.name, company_title=company.title
        )
        return confirmation_info

    async def update_user_company(
        self, uc_id: int, new_user_company: UserCompanyDTO
    ) -> Optional[UserCompanyDTO]:
        uc = await self.uc_repo.get_user_company_by_id(uc_id)
        # dafuck?
        # role = new_user_company.role if new_user_company.role is not None else uc.role
        # workgroup_id = new_user_company.workgroup_id if new_user_company.workgroup_id is not None else uc.workgroup_id
        updated_uc_dto = UserCompanyDTO(
            id=uc.id,
            user_id=new_user_company.user_id,
            company_id=new_user_company.company_id,
            workgroup_id=new_user_company.workgroup_id,
            role=uc.role,
        )
        data = await self.uc_repo.update_user_company(updated_uc_dto)
        return data

    async def delete_user_company(self, uc_id: int) -> None:
        result = await self.uc_repo.delete_user_company_by_id(uc_id)
        return result
    
    async def get_all_users_in_company_and_uc_id(self, company_id: int) -> List[UsersInCompanyResponse]:
        user_companies = await self.uc_repo.get_all_users_in_company_with_company_id(company_id=company_id)
        users = [await self.user_repo.get_user_by_id(uc.user_id) for uc in user_companies]

        ret_list = []
        for user in users:
            ret_list.append(UsersInCompanyResponse(
                id=user.id,
                tg_id=user.tg_id,
                name=user.name,
                photo_url=user.photo_url,
                uc_id=user_companies[users.index(user)].id
            ))

        return ret_list

