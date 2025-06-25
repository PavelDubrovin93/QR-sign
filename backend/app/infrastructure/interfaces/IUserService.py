from abc import ABC, abstractmethod
from app.models.dtoModels.UserDTO import UserDTO
from app.api.validation.UserResponse import UserResponse



class IUserService(ABC):
    """
    Интерфейс сервиса для регистрации и работы с данными модели User.
    """

    @abstractmethod
    async def register_user_cold(self, company_id: int, new_user_data: UserDTO) -> UserResponse:
        """
        Холодная регистрация пользователя (регистрация без ассоциации с конкретной компанией).
        :param tg_id: Телеграм ID пользователя
        :param name: Имя пользователя
        :return: Зарегистрированный пользователь
        """
        pass

    @abstractmethod
    async def register_user_hot(self, company_id: int, new_user_data: UserDTO) -> UserResponse:
        """
        Горячая регистрация пользователя (регистрация с ассоциацией с конкретной компанией).
        :param company_id: ID компании
        :param tg_id: Телеграм ID пользователя
        :param name: Имя пользователя
        :return: Зарегистрированный пользователь
        """
        pass
