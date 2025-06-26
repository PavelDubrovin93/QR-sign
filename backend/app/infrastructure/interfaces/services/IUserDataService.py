from abc import ABC, abstractmethod
from typing import List

from app.validation.responses.TaskBoardResponse import TaskBoardResponse
from app.validation.responses.UserCompanyResponse import UserCompanyResponse
from app.validation.dtoModels.UserDTO import UserDTO


class IUserDataService(ABC):
    """
    Интерфейс сервиса для обработки данных пользователя.
    """

    @abstractmethod
    async def tasks_for_user(self, user: UserDTO) -> List[TaskBoardResponse]:
        """
        Получить список досок задач для пользователя.
        :param user: Пользователь
        :return: Список досок задач
        """
        pass

    @abstractmethod
    async def unviewed_tasks_count_for_user(self, user: UserDTO) -> int:
        """
        Подсчитать количество непросмотренных задач пользователя.
        :param user: Пользователь
        :return: Количество непросмотренных задач
        """
        pass

    @abstractmethod
    async def companies_for_user(self, user: UserDTO) -> List[UserCompanyResponse]:
        """
        Получить список компаний для пользователя.
        :param user: Пользователь
        :return: Список компаний
        """
        pass
