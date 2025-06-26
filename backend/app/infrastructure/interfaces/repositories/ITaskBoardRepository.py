from abc import ABC, abstractmethod
from typing import List, Optional

from app.models.dbModels.TaskBoard.TaskBoardEntity import TaskBoardEntity
from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO


class ITaskBoardRepository(ABC):
    """
    Интерфейс репозитория для работы с доской задач.
    """

    @abstractmethod
    async def get_task_board_by_id(self, id: int) -> Optional[TaskBoardDTO]:
        """
        Возвращает доску задач по указанному ID.
        :param id: Идентификатор доски задач
        :return: словарь с информацией о доской задач или None, если не найден
        """
        pass

    @abstractmethod
    async def get_task_board_by_company_id(
        self, company_id: int
    ) -> Optional[TaskBoardDTO]:
        """
        Возвращает доску задач по указанному Company ID.
        :param company_id: Идентификатор компании
        :return: экземпляр TaskBoard или None, если доска задач не найден
        """
        pass

    @abstractmethod
    async def get_task_board_by_work_group_id(
        self, work_group_id: int
    ) -> Optional[TaskBoardDTO]:
        """
        Возвращает доску задач по указанному Work Group ID.
        :param work_group_id: Идентификатор рабочей группы
        :return: экземпляр TaskBoard или None, если доска задач не найден
        """
        pass

    @abstractmethod
    async def get_task_board_by_type(self, type: str) -> Optional[TaskBoardDTO]:
        """
        Возвращает доску задач по указанному Type.
        :param type: Тип задачи
        :return: экземпляр TaskBoard или None, если доска задач не найден
        """
        pass

    @abstractmethod
    async def get_task_board_all(self) -> List[TaskBoardDTO]:
        """
        Возвращает список всех доск задач.
        :return: Список словарей с информацией обо всех досках задач
        """
        pass

    @abstractmethod
    async def add_task_board(self, new_task_board: TaskBoardEntity) -> TaskBoardDTO:
        """
        Добавляет новую доску задач в базу данных.
        :param new_task_board: новый экземпляр доски задач
        :return: словарь с информацией о добавленной доске задач
        """
        pass

    @abstractmethod
    async def delete_task_board_by_id(self, task_board_id: int) -> None:
        """
        Удалить доску задач по id.
        :param task_board_id: ID компании
        """
        pass
