from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.TaskBoardResponse import TaskBoardResponse
from app.infrastructure.interfaces.services.ITaskBoardService import ITaskBoardService
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository


class TaskBoardService(ITaskBoardService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_board_by_id(self, taskboard_id: int) -> TaskBoardResponse:
        tb_repo = TaskBoardRepository(self.session)
        tp_repo = TaskPointRepository(self.session)
        taskboard = await tb_repo.get_task_board_by_id(taskboard_id)
        if taskboard is None:
            return None
        taskboard_response = TaskBoardResponse(
            id=taskboard.id,
            title=taskboard.title,
            company_id=taskboard.company_id,
            work_group_id=taskboard.work_group_id,
            image=taskboard.image,
            location=taskboard.location,
            type=taskboard.type,
            description=taskboard.description or "",
            done_at=taskboard.done_at,
        )
        task_points = tp_repo.get_task_point_by_taskboard_id(taskboard_id)
        taskboard_response.task_points = task_points
        return taskboard
