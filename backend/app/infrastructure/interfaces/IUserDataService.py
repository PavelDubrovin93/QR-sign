from abc import ABC, abstractmethod
from typing import List
from app.models.dtoModels.UserDTO import UserDTO
from app.api.validation.TaskBoardResponse import TaskBoardResponse

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