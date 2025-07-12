from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.services.IUISettingsService import \
    IUISettingsService
from app.infrastructure.repositories.UISettingsRepository import \
    UISettingsRepository
from app.infrastructure.repositories.UserCompanyRepository import \
    UserCompanyRepository
from app.infrastructure.repositories.UserRepository import UserRepository
from app.models.dbEnums.RoleType import RoleType
from app.validation.dtoModels.UISettingsDTO import UISettingsDTO
from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.validation.dtoModels.UserDTO import UserDTO
from app.validation.responses.UISettingResponse import UISettingResponse


class UISettingsService(IUISettingsService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_settings(self, user: UserDTO) -> UISettingResponse:
        ui_repo = UISettingsRepository(self.session)
        uc_repo = UserCompanyRepository(self.session)
        settings = await ui_repo.get_ui_settings_by_user_id(user.id)

        role = RoleType.PENDING

        if settings.default_company_choice is not None:
            user_company = await uc_repo.get_user_company_by_company_id(
                settings.default_company_choice
            )
            role = RoleType(user_company.role)

        response = UISettingResponse(
            id=settings.id,
            name_for_admin=user.name,
            user_id=settings.user_id,
            default_company_choice=settings.default_company_choice,
            default_color=settings.default_color,
            current_role=role,
        )

        return response

    async def update_user_settings(
        self, updated_settings: UISettingResponse
    ) -> UISettingResponse:
        ui_repo = UISettingsRepository(self.session)
        uc_repo = UserCompanyRepository(self.session)
        user_repo = UserRepository(self.session)

        user = await user_repo.get_user_by_id(updated_settings.user_id)
        settings = await ui_repo.get_ui_settings_by_user_id(user.id)
        uc = await uc_repo.get_user_company_by_company_id(
            settings.default_company_choice
        )

        updated_settings_dto = UISettingsDTO(
            user_id=updated_settings.user_id,
            default_company_choice=updated_settings.default_company_choice,
            default_color=updated_settings.default_color,
        )

        await ui_repo.update_ui_settings(updated_settings_dto)
        updated_user_dto = UserDTO(
            id=user.id,
            tg_id=user.tg_id,
            name=updated_settings.name_for_admin,
            photo_url=user.photo_url,
        )

        await user_repo.update_user(updated_user_dto)
        updated_uc_dto = UserCompanyDTO(
            id=uc.id,
            user_id=uc.user_id,
            company_id=uc.company_id,
            workgroup_id=uc.workgroup_id,
            role=updated_settings.current_role,
        )

        await uc_repo.update_user_company(updated_uc_dto)

        return updated_settings
