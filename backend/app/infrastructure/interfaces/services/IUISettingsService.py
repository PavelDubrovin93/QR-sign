from abc import ABC, abstractmethod

from app.validation.dtoModels.UserDTO import UserDTO
from app.validation.responses.UISettingResponse import UISettingResponse


class IUISettingsService(ABC):
    """
    Интерфейс сервиса для работы с настройками интерфейса пользователя.
    """

    @abstractmethod
    async def get_user_settings(self, user: UserDTO) -> UISettingResponse:
        """
        Получить настройки интерфейса пользователя.
        :param user: Пользователь
        :return: Настройки интерфейса пользователя
        """
        pass

    @abstractmethod
    async def update_user_settings(
        self, updated_settings: UISettingResponse
    ) -> UISettingResponse:
        """
        Обновить настройки интерфейса пользователя.
        :param updated_settings: Новое состояние настроек
        :return: Обновленное состояние настроек
        """
        pass
