from abc import ABC, abstractmethod

from app.validation.responses.UserResponse import CreateUserResponse, UserResponse


class IUserService(ABC):
    """
    Интерфейс сервиса для регистрации и работы с данными модели User.
    """

    @abstractmethod
    async def register_user_cold(
        self, new_user_data: CreateUserResponse
    ) -> UserResponse:
        """
        Холодная регистрация пользователя (регистрация без ассоциации с конкретной компанией).
        :param tg_id: Телеграм ID пользователя
        :param name: Имя пользователя
        :return: Зарегистрированный пользователь
        """
        pass

    @abstractmethod
    async def delete_user(self, user_id: int) -> bool:
        """
        Холодная регистрация пользователя (регистрация без ассоциации с конкретной компанией).
        :param user_id: ID пользователя
        :return: True, если удаление прошло успехно
        """
        pass

    @abstractmethod
    async def register_user_hot(
        self, company_id: int, new_user_data: CreateUserResponse
    ) -> UserResponse:
        """
        Горячая регистрация пользователя (регистрация с ассоциацией с конкретной компанией).
        :param company_id: ID компании
        :param tg_id: Телеграм ID пользователя
        :param name: Имя пользователя
        :return: Зарегистрированный пользователь
        """
        pass
