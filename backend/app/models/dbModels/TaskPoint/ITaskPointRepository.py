from abc import ABC, abstractmethod
from typing import Dict, List, Optional

from app.models.dbModels.TaskPoint.TaskPointEntity import TaskPointEntity


class ITaskPointRepository(ABC):
    """
    Интерфейс репозитория для работы с доской задач.
    """

    @abstractmethod
    async def get_task_point_by_id(self, id: int) -> Optional[Dict[str, any]]:
        """
        Возвращает задачу по указанному ID.
        :param id: Идентификатор задачи
        :return: словарь с информацией о задаче или None, если не найден
        """
        pass

    @abstractmethod
    async def get_task_point_by_taskboard_id(self, taskboard_id: int) -> List[TaskPointEntity]:
        """
        Возвращает задачу по указанному taskboard_id.
        :param taskboard_id: Идентификатор доски задач
        :return: список словарей с информацией обо всех задачах внутри этой доски
        """
        pass

    @abstractmethod
    async def get_task_point_by_taskboard_id_and_done_at(self, taskboard_id: int, done_at: str) -> List[TaskPointEntity]:
        """
        Возвращает все выполненые задачи по указанному идентификатору доски задач.
        :param taskboard_id: Идентификатор доски задач
        :param done_at: Время выполнения
        :return: список словарей с информацией обо всех выполненых задачах внутри этой доски
        """
        pass

    @abstractmethod
    async def get_task_point_by_taskboard_id_and_issued_at(self, taskboard_id: int, issued_at: str) -> List[TaskPointEntity]:
        """
        Возвращает все задачи по указанному идентификатору доски задач.
        :param taskboard_id: Идентификатор доски задач
        :param issued_at: Время выдачи
        :return: список словарей с информацией обо всех выданных задачах внутри этой доски
        """
        pass

    @abstractmethod
    async def get_task_point_by_taskboard_id_and_warning_at(self, taskboard_id: int, warning_at: str) -> List[TaskPointEntity]:
        """
        Возвращает все задачи по указанному идентификатору доски задач.
        :param taskboard_id: Идентификатор доски задач
        :param warning_at: Время предупреждения
        :return: список словарей с информацией обо всех предупрежденных задачах внутри этой доски
        """
        pass

    @abstractmethod
    async def add_task_point(self, new_task_point: TaskPointEntity) -> Dict[str, any]:
        """
        Добавляет новую задачу в базу данных.
        :param new_task_point: новый экземпляр задачи
        :return: словарь с информацией о добавленной задаче
        """
        pass

    # @abstractmethod
    # async def update_task_board(self, task_board: TaskPointEntity) -> Dict[str, any]:
    #     """
    #     Обновляет доску задач в базе данных.
    #     :param task_board: экземпляр доски задач
    #     :return: словарь с информацией об обновленной доске задач
    #     """
    #     pass

    # @abstractmethod
    # async def delete_task_board(self, task_board: TaskPointEntity) -> Dict[str, any]:
    #     """
    #     Удаляет доску задач из базы данных.
    #     :param task_board: экземпляр доски задач
    #     :return: словарь с информацией об удаленной доске задач
    #     """
    #     pass

    # @abstractmethod
    # async def delete_task_board_by_id(self, taskboard_id: int) -> Dict[str, any]:
    #     """
    #     Удаляет доску задач из базы данных.
    #     :param taskboard_id: Идентификатор доски задач
    #     :return: словарь с информацией об удаленной доске задач
    #     """
    #     pass

    # @abstractmethod
    # async def delete_task_board_by_taskboard_id(self, taskboard_id: int) -> Dict[str, any]:
    #     """
    #     Удаляет доску задач из базы данных.
    #     :param taskboard_id: Идентификатор доски задач
    #     :return: словарь с информацией об удаленной доске задач
    #     """
    #     pass
