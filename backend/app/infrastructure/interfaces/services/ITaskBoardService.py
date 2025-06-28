from abc import ABC, abstractmethod
from typing import Optional

from app.validation.responses.TaskBoardResponse import TaskBoardResponse


class ITaskBoardService(ABC):
    """
    Интерфейс сервиса для работы с таскбордами.
    """

    @abstractmethod
    async def get_task_board_by_id(
        self, taskboard_id: int
    ) -> Optional[TaskBoardResponse]:
        """
        Получить таскборд по идентификатору.
        :param taskboard_id: ID таскборда
        :return: объект TaskBoardResponse или None
        """
        pass


    @abstractmethod
    async def delete_task_board_and_task_points_by_tb_id(self, taskboard_id: int) -> TaskBoardResponse:
        """
        Удалить таскборд и его таскпоинты по идентификатору.
        :param taskboard_id: ID таскборда
        :return: объект TaskBoardResponse
        """
        pass

    @abstractmethod
    async def edit_task_board_with_task_points(self, taskboard: TaskBoardResponse) -> TaskBoardResponse:
        """
        Редактировать таскборд.
        :param taskboard: объект TaskBoardResponse
        :return: объект TaskBoardResponse
        """
        pass