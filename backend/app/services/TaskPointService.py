from typing import List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.services.ITaskPointService import \
    ITaskPointService
from app.infrastructure.repositories.TaskBoardRepository import \
    TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import \
    TaskPointRepository
from app.validation.responses.TaskBoardResponse import (
    TaskPointDTO)


class TaskPointService(ITaskPointService):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.tb_repo = TaskBoardRepository(self.session)
        self.tp_repo = TaskPointRepository(self.session)

    async def get_taskpoints_by_taskboard_id(
        self, taskboard_id: int
    ) -> List[TaskPointDTO]:
        taskboard = await self.tb_repo.get_task_board_by_id(taskboard_id)
        if not taskboard:
            raise HTTPException(
                status_code=404, detail="Taskboard not found"
            )  # TODO: useless

        taskpoints = await self.tp_repo.get_task_point_by_taskboard_id(taskboard_id)

        return taskpoints
