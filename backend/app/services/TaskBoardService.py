from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.TaskBoardResponse import TaskBoardResponse, TaskPointResponse
from app.infrastructure.interfaces.services.ITaskBoardService import ITaskBoardService
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository
from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.dtoModels.TaskPointDTO import TaskPointDTO
from app.validation.responses.TaskBoardResponse import (
    CreateTaskBoardResponse,
    TaskBoardResponse
)
from typing import List


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
        new_task_board = await self.tb_repo.edit_task_board(
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

        new_task_points = await self.tp_repo.edit_task_points_by_dto_list(
            task_points=taskboard.task_points
        )

        return TaskBoardResponse(
            id=new_task_board.id,
            title=new_task_board.title,
            company_id=new_task_board.company_id,
            work_group_id=new_task_board.work_group_id,
            image=new_task_board.image,
            location=new_task_board.location,
            type=new_task_board.type,
            description=new_task_board.description or "",
            done_at=new_task_board.done_at,
            task_points=new_task_points
        )
    
    async def get_task_boards_by_company_id_and_user_tg_id(self, company_id: int, user_tg_id: int) -> List[TaskBoardResponse]:
        taskboards = await self.tb_repo.get_task_boards_by_company_id_and_user_tg_id(company_id=company_id, user_id=user_tg_id)
        return taskboards
    
    async def create_taskboard(self, taskboard_data: CreateTaskBoardResponse) -> TaskBoardResponse:
        new_taskboard = await self.tb_repo.add_task_board(
            new_task_board=TaskBoardDTO(
                title=taskboard_data.title,
                company_id=taskboard_data.company_id,
                work_group_id=taskboard_data.work_group_id,
                image=taskboard_data.image,
                location=taskboard_data.location,
                type=taskboard_data.type,
                description=taskboard_data.description or "",
            )
        )

        task_point_to_return = []

        for task_point in taskboard_data.task_points:
            new_taskpoint = await self.tp_repo.add_task_point(new_task_point=TaskPointDTO(
                title=task_point.title,
                taskboard_id=new_taskboard.id,
                thumbnails=task_point.thumbnails,
                mark_icon=task_point.mark_icon,
                coordinates=task_point.coordinates,
                points=task_point.points,
                qrcode=task_point.qrcode,
                description=task_point.description,
                voice_message=task_point.voice_message,
                )
            )
            task_point_to_return.append(TaskPointResponse(
                id=new_taskpoint.id,
                title=new_taskpoint.title,
                taskboard_id=new_taskpoint.taskboard_id,
                thumbnails=new_taskpoint.thumbnails,
                mark_icon=new_taskpoint.mark_icon,
                coordinates=new_taskpoint.coordinates,
                points=new_taskpoint.points,
                qrcode=new_taskpoint.qrcode,
                description=new_taskpoint.description,
                voice_message=new_taskpoint.voice_message,
                done_at=new_taskpoint.done_at,
                issued_at=new_taskpoint.issued_at,
                warning_at=new_taskpoint.warning_at
            ))


        new_taskboard_to_return = TaskBoardResponse(
            id=new_taskboard.id,
            title=new_taskboard.title,
            company_id=new_taskboard.company_id,
            work_group_id=new_taskboard.work_group_id,
            image=new_taskboard.image,
            location=new_taskboard.location,
            type=new_taskboard.type,
            description=new_taskboard.description or "",
            task_points=task_point_to_return
        )

        return new_taskboard_to_return

    async def get_taskboard_by_work_group_id(self, work_group_id: int) -> List[TaskBoardDTO]:
        taskboard = await self.tb_repo.get_task_board_by_work_group_id(work_group_id=work_group_id)
        return taskboard
