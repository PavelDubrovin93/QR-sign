from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository

class TaskBoardService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_board_by_id(self, taskboard_id: int) -> TaskBoardDTO:
        repo = TaskBoardRepository(self.session)
        taskboard = await repo.get_task_board_by_id(taskboard_id)
        if taskboard is None:
            return None
        return taskboard