
from abc import ABC, abstractmethod
from typing import Optional
from app.api.validation.TaskBoardResponse import TaskBoardResponse

class ITaskBoardService(ABC):
    """
    Интерфейс сервиса для работы с таскбордами.
    """

    @abstractmethod
    async def get_task_board_by_id(self, taskboard_id: int) -> Optional[TaskBoardResponse]:
        """
        Получить таскборд по идентификатору.
        :param taskboard_id: ID таскборда
        :return: объект TaskBoardResponse или None
        """
        pass