from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.UISettings.IUISettingsRepository import IUISettingsRepository
from app.models.dbModels.UISettings.UISettingsEntity import UISettingsEntity
from app.models.dtoModels.UISettingsDTO import UISettingsDTO



class UISettingsRepository(IUISettingsRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_ui_settings_by_user_id(
        self, user_id: int
    ) -> Optional[UISettingsDTO]:
        query = select(UISettingsEntity).where(UISettingsEntity.user_id == user_id)
        result = await self.session.execute(query)
        ui_settings = result.scalars().first()
        return self.__to_dto(ui_settings)

    async def create_ui_settings(self, settings_data: UISettingsDTO) -> Optional[UISettingsDTO]:
        new_settings = UISettingsEntity(
            user_id=settings_data.user_id,
            default_company_choice=settings_data.default_company_choice,
            default_color=settings_data.default_color
        )
        self.session.add(new_settings)
        await self.session.commit()
        await self.session.refresh(new_settings)  # ???
        return self.__to_dto(new_settings)

    async def update_ui_settings(self, settings_data: UISettingsDTO) -> Optional[UISettingsDTO]:
        query = select(UISettingsEntity).where(UISettingsEntity.user_id == settings_data.user_id)
        result = await self.session.execute(query)
        existing_settings = result.scalars().first()
        if existing_settings is None:
            new_settings =  self.create_ui_settings(settings_data)
            return new_settings
        existing_settings.default_company_choice = settings_data.default_company_choice
        existing_settings.default_color = settings_data.default_color

        await self.session.commit()
        await self.session.refresh(existing_settings)
        return self.__to_dto(existing_settings)

    async def __to_dto(self, uisetting: UISettingsEntity) -> UISettingsDTO:
        return UISettingsDTO(
            id=uisetting.id,
            user_id=uisetting.user_id,
            default_company_choice=uisetting.default_company_choice,
            default_color=uisetting.default_color
        )
