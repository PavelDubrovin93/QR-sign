from abc import ABC, abstractmethod
from app.models.dtoModels.UserDTO import UserDTO


class IUserService(ABC):
    """
    Интерфейс сервиса для регистрации и работы с данными модели User.
    """

    @abstractmethod
    async def register_user_cold(self, tg_id: int, name: str) -> UserDTO:
        """
        Холодная регистрация пользователя (регистрация без ассоциации с конкретной компанией).
        :param tg_id: Телеграм ID пользователя
        :param name: Имя пользователя
        :return: Зарегистрированный пользователь
        """
        pass

    @abstractmethod
    async def register_user_hot(self, company_id: int, tg_id: int, name: str) -> UserDTO:
        """
        Горячая регистрация пользователя (регистрация с ассоциацией с конкретной компанией).
        :param company_id: ID компании
        :param tg_id: Телеграм ID пользователя
        :param name: Имя пользователя
        :return: Зарегистрированный пользователь
        """
        pass
