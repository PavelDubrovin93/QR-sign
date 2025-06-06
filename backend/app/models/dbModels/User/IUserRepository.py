from abc import ABC, abstractmethod
from typing import Dict, List, Optional

from app.models.dbModels.User.UserEntity import UserEntity


class IUserRepository(ABC):
    """
    Интерфейс репозитория для работы с пользователями.
    """

    @abstractmethod
    async def get_user_by_id(self, id: int) -> Optional[Dict[str, any]]:
        """
        Возвращает пользователя по указанному ID.
        :param id: Идентификатор пользователя
        :return: словарь с информацией о пользователе или None, если не найден
        """
        pass

    @abstractmethod
    async def get_user_by_tg_id(self, tg_id: int) -> Optional[UserEntity]:
        """
        Возвращает пользователя по его Telegram ID.
        :param tg_id: Телеграм-идентификатор пользователя
        :return: экземпляр User или None, если пользователь не найден
        """
        pass

    @abstractmethod
    async def get_user_all(self) -> List[Dict[str, any]]:
        """
        Возвращает список всех пользователей.
        :return: Список словарей с информацией обо всех пользователях
        """
        pass

    @abstractmethod
    async def add_user(self, new_user: UserEntity) -> Dict[str, any]:
        """
        Добавляет нового пользователя в базу данных.
        :param new_user: новый экземпляр пользователя
        :return: словарь с информацией о добавленном пользователе
        """
        pass
