from app.models.dtoModels.UISettingsDTO import UISettingsDTO
from app.models.dtoModels.UserDTO import UserDTO
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.UISettingsRepository import UISettingsRepository


class UISettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_settings(self, user: UserDTO) -> UISettingsDTO:
        repo = UISettingsRepository(self.session)
        user_id = user.id
        settings = await repo.get_ui_settings_by_user_id(user_id)
        return settings

    async def update_user_settings(self, updated_settings: UISettingsDTO) -> UISettingsDTO:
        repo = UISettingsRepository(self.session)
        settings = await repo.update_ui_settings(updated_settings)
        return settings

