from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.InviteConformResponse import InviteConformResponse
from app.infrastructure.interfaces.services.ICompanyService import ICompanyService
from app.infrastructure.repositories.CompanyRepository import CompanyRepository
from app.infrastructure.repositories.UserCompanyRepository import UserCompanyRepository
from app.validation.dtoModels.CompanyDTO import CompanyDTO
from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.validation.dtoModels.UserDTO import UserDTO


class CompanyService(ICompanyService):

    def __init__(self, session: AsyncSession):
        self.uc_repo = UserCompanyRepository(session)
        self.company_repo = CompanyRepository(session)

    async def create_new_company(
        self, user: UserDTO, company: CompanyDTO
    ) -> Optional[CompanyDTO]:
        new_copmany = await self.company_repo.create_company(company)
        self.uc_repo.create_user_company(
            UserCompanyDTO(
                user_id=user.id,
                company_id=new_copmany.id,
                workgroup_id=None,
                role="admin",
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

    async def update_user_company_role(
        self, uc_id: int, new_role: str
    ) -> Optional[UserCompanyDTO]:
        uc = await self.uc_repo.get_user_company_by_company_id(uc_id)
        updated_uc_dto = UserCompanyDTO(
            id=uc.id,
            user_id=uc.user_id,
            company_id=uc.company_id,
            workgroup_id=uc.workgroup_id,
            role=new_role,
        )
        await self.uc_repo.update_user_company(updated_uc_dto)
        return updated_uc_dto

    async def delete_user_company(self, uc_id: int) -> None:
        result = await self.uc_repo.delete_user_company_by_id(uc_id)
        return result
