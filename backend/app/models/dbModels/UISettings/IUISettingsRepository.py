from abc import ABC, abstractmethod
from typing import Optional

#from app.models.dbModels.UISettings.UISettingsEntity import UISettingsEntity as UISettings
from app.models.dbModels.UISettings.UISettingsEntity import UISettingsEntity


class IUISettingsRepository(ABC):
    """
    Интерфейс репозитория для работы с UI-настройками пользователей.
    """

    @abstractmethod
    async def get_ui_settings_by_user_id(self, user_id: int) -> Optional[UISettingsEntity]:
        """
        Получить настройки интерфейса по идентификатору пользователя.
        :param user_id: ID пользователя
        :return: объект UISetting или None
        """
        pass

    @abstractmethod
    async def create_ui_settings(self, settings_data: dict) -> UISettingsEntity:
        """
        Создать новые настройки интерфейса.
        :param settings_data: Данные для новых настроек
        :return: созданный объект UISetting
        """
        pass
