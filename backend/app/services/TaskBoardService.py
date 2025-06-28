from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.TaskBoardResponse import TaskBoardResponse
from app.infrastructure.interfaces.services.ITaskBoardService import ITaskBoardService
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository


class TaskBoardService(ITaskBoardService):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.tb_repo = TaskBoardRepository(self.session)
        self.tp_repo = TaskPointRepository(self.session)

    async def get_task_board_by_id(self, taskboard_id: int) -> TaskBoardResponse:
        taskboard = await self.tb_repo.get_task_board_by_id(taskboard_id)
        
        if taskboard is None:
            raise HTTPException(status_code=404, detail="Task Board not found")

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

        task_points = self.tp_repo.get_task_point_by_taskboard_id(taskboard_id)
        taskboard_response.task_points = task_points
        return taskboard

    async def delete_task_board_and_task_points_by_tb_id(self, taskboard_id: int) -> TaskBoardResponse:
        task_points = await self.tp_repo.delete_task_point_by_taskboard_id(taskboard_id)
        taskboard = await self.tb_repo.delete_task_board_by_id(taskboard_id)
        
        taskboard.task_points = task_points
        
        return taskboard
    
    async def edit_task_board_with_task_points(self, taskboard: TaskBoardResponse):
        await self.tb_repo.edit_task_board(
            taskboard=TaskBoardDTO(
                id=taskboard.id,
                title=taskboard.title,
                company_id=taskboard.company_id,
                work_group_id=taskboard.work_group_id,
                image=taskboard.image,
                location=taskboard.location,
                type=taskboard.type,
                description=taskboard.description or "",
                done_at=taskboard.done_at
        ))

        await self.tp_repo.edit_task_points_by_dto_list(
            task_points=taskboard.task_points
        )

        return TaskBoardResponse
