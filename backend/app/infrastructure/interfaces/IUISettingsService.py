from abc import ABC, abstractmethod
from app.models.dtoModels.UISettingsDTO import UISettingsDTO
from app.models.dtoModels.UserDTO import UserDTO

class IUISettingsService(ABC):
    """
    Интерфейс сервиса для работы с настройками интерфейса пользователя.
    """

    @abstractmethod
    async def get_user_settings(self, user: UserDTO) -> UISettingsDTO:
        """
        Получить настройки интерфейса пользователя.
        :param user: Пользователь
        :return: Настройки интерфейса пользователя
        """
        pass

    @abstractmethod
    async def update_user_settings(self, updated_settings: UISettingsDTO) -> UISettingsDTO:
        """
        Обновить настройки интерфейса пользователя.
        :param updated_settings: Новое состояние настроек
        :return: Обновленное состояние настроек
        """
        pass