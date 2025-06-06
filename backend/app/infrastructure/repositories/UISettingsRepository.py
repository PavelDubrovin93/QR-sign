from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.UISettings.IUISettingsRepository import IUISettingsRepository
from app.models.dbModels.UISettings.UISettingsEntity import UISettingsEntity


class UISettingsRepository(IUISettingsRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_ui_settings_by_user_id(
        self, user_id: int
    ) -> Optional[UISettingsEntity]:
        query = select(UISettingsEntity).where(UISettingsEntity.user_id == user_id)
        result = await self.session.execute(query)

        return result.scalars().first()

    async def create_ui_settings(self, settings_data: dict) -> UISettingsEntity:
        new_settings = UISettingsEntity(**settings_data)
        self.session.add(new_settings)
        await self.session.commit()
        await self.session.refresh(new_settings)

        return new_settings
