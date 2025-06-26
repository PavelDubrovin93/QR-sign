
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.UserRepository import UserRepository
from app.infrastructure.repositories.UISettingsRepository import UISettingsRepository
from app.infrastructure.repositories.UserCompanyRepository import UserCompanyRepository
from app.infrastructure.repositories.WorkGroupRepository import WorkGroupRepository
from app.models.dtoModels.UserDTO import UserDTO
from app.models.dtoModels.UISettingsDTO import UISettingsDTO
from app.models.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.infrastructure.interfaces.IUserService import IUserService
from app.api.validation.UserResponse import UserResponse
from app.models.dbEnums.RoleType import RoleType

class UserService(IUserService):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.uisettings_repo = UISettingsRepository(session)
        self.usercompany_repo = UserCompanyRepository(session)
        self.workgroup_repo = WorkGroupRepository(session)
    
    async def register_user_cold(self, new_user_data: UserDTO) -> UserResponse:
        new_user = await self.user_repo.add_user(new_user_data)
        print(123123123, new_user.id)
        new_ui_settings = await self.uisettings_repo.create_ui_settings(
            UISettingsDTO(
                user_id=new_user.id
            )
        )
        await self.usercompany_repo.create_user_company(
            UserCompanyDTO(
                user_id=new_user.id,
            )
        )
        new_user_response = UserResponse(
            id=new_user.id,
            tg_id=new_user.tg_id,
            name=new_user.name,
            photo_url=new_user.photo_url,
            ui_settings=new_ui_settings.id
        )
        return new_user_response

    async def register_user_hot(self, company_id: int, new_user_data: UserDTO) -> UserResponse:
        new_user = await self.user_repo.add_user(new_user_data)
        new_ui_settings = await self.uisettings_repo.create_ui_settings(
            UISettingsDTO(
                user_id=new_user.id
            )
        )
        default_company_workgroup_id = await self.workgroup_repo.get_work_groups_by_company(company_id)[0].id  # Нужен репч
        await self.usercompany_repo.create_user_company(
            UserCompanyDTO(
                user_id=new_user.id,
                company_id=company_id,
                workgroup_id=default_company_workgroup_id,
            )
        )
        new_user_response = UserResponse(
            id=new_user.id,
            tg_id=new_user.tg_id,
            name=new_user.name,
            photo_url=new_user.photo_url,
            ui_settings=new_ui_settings.id
        )
        return new_user_response
