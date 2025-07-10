from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.UserResponse import CreateUserResponse, UserResponse
from app.infrastructure.interfaces.services.IUserService import IUserService
from app.infrastructure.repositories.UISettingsRepository import UISettingsRepository
from app.infrastructure.repositories.UserCompanyRepository import UserCompanyRepository
from app.infrastructure.repositories.UserRepository import UserRepository
from app.infrastructure.repositories.WorkGroupRepository import WorkGroupRepository
from app.validation.dtoModels.UISettingsDTO import UISettingsDTO
from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.validation.dtoModels.UserDTO import UserDTO
from app.models.dbEnums.RoleType import RoleType


class UserService(IUserService):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.uisettings_repo = UISettingsRepository(session)
        self.usercompany_repo = UserCompanyRepository(session)
        self.workgroup_repo = WorkGroupRepository(session)

    async def register_user_cold(self, new_user_data: CreateUserResponse) -> UserResponse:
        new_user = await self.user_repo.add_user(
            new_user=UserDTO(
                tg_id=new_user_data.tg_id,
                name=new_user_data.name,
                photo_url=new_user_data.photo_url,
            )
        )
        new_ui_settings = await self.uisettings_repo.create_ui_settings(
            UISettingsDTO(user_id=new_user.id)
        )
        new_user_response = UserResponse(
            id=new_user.id,
            tg_id=new_user.tg_id,
            name=new_user.name,
            photo_url=new_user.photo_url,
            ui_settings=new_ui_settings.id,
        )
        return new_user_response


    async def delete_user(self, user_id: int) -> bool:
        deleted = await self.user_repo.delete_user_by_id(user_id=user_id)
        return True

    async def register_user_hot(
        self, company_id: int, new_user_data: CreateUserResponse
    ) -> UserResponse:
        new_user = await self.user_repo.add_user(
            new_user=UserDTO(
                tg_id=new_user_data.tg_id,
                name=new_user_data.name,
                photo_url=new_user_data.photo_url,
            )
        )
        new_ui_settings = await self.uisettings_repo.create_ui_settings(
            UISettingsDTO(user_id=new_user.id)
        )

        await self.usercompany_repo.create_user_company(
            UserCompanyDTO(
                user_id=new_user.id,
                company_id=company_id,
                workgroup_id=None,
                role=RoleType.PENDING
            )
        )

        new_user_response = UserResponse(
            id=new_user.id,
            tg_id=new_user.tg_id,
            name=new_user.name,
            photo_url=new_user.photo_url,
            ui_settings=new_ui_settings.id,
        )

        return new_user_response
