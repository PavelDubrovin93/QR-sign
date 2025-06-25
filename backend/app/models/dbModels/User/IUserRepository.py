from abc import ABC, abstractmethod
from typing import List, Optional

from app.models.dtoModels.UserDTO import UserDTO



class IUserRepository(ABC):
    """
    Интерфейс репозитория для работы с пользователями.
    """

    @abstractmethod
    async def get_user_by_id(self, id: int) -> Optional[UserDTO]:
        """
        Возвращает пользователя по указанному ID.
        :param id: Идентификатор пользователя
        :return: словарь с информацией о пользователе или None, если не найден
        """
        pass

    @abstractmethod
    async def get_user_by_tg_id(self, tg_id: int) -> Optional[UserDTO]:
        """
        Возвращает пользователя по его Telegram ID.
        :param tg_id: Телеграм-идентификатор пользователя
        :return: экземпляр User или None, если пользователь не найден
        """
        pass

    @abstractmethod
    async def get_user_all(self) -> List[UserDTO]:
        """
        Возвращает список всех пользователей.
        :return: Список словарей с информацией обо всех пользователях
        """
        pass

    @abstractmethod
    async def add_user(self, new_user: UserDTO) -> Optional[UserDTO]:
        """
        Добавляет нового пользователя в базу данных.
        :param new_user: новый экземпляр пользователя
        :return: словарь с информацией о добавленном пользователе
        """
        pass

    @abstractmethod
    async def delete_user_by_id(self, user_id: int) -> None:
        """
        Удаляет пользователя по id.
        :param task_point_id: ID пользователя
        """
        pass