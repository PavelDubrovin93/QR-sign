from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.TaskBoardResponse import TaskBoardResponse, TaskPointDTO
from app.infrastructure.interfaces.services.ITaskBoardService import ITaskBoardService
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository
from app.infrastructure.repositories.UserRepository import UserRepository
from app.services.UserDataService import UserDataService
from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.dtoModels.TaskPointDTO import TaskPointDTO
from app.validation.dtoModels.UserDTO import UserDTO
from app.models.dbEnums.RoleType import RoleType
from app.validation.responses.TaskBoardResponse import (
    TaskBoardResponse
)
from typing import List


class TaskBoardService(ITaskBoardService):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.tb_repo = TaskBoardRepository(self.session)
        self.tp_repo = TaskPointRepository(self.session)
        self.user_repo = UserRepository(self.session)
        self.user_data_service = UserDataService(self.session)
    
    async def get_task_board_by_id(self, taskboard_id: int) -> TaskBoardResponse:
        taskboard = await self.tb_repo.get_task_board_by_id(taskboard_id)
        
        if taskboard is None:
            raise HTTPException(status_code=404, detail="Task Board not found")

        taskpoints = await self.tp_repo.get_task_point_by_taskboard_id(taskboard_id)
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
            created_by=taskboard.created_by,
            admin_id=taskboard.admin_id,
            task_points=taskpoints
        )

        return taskboard_response

    async def delete_task_board_and_task_points_by_tb_id(self, taskboard_id: int, user: UserDTO) -> TaskBoardResponse:

        async def conform_delete(taskboard_id):
            task_points = await self.tp_repo.delete_task_point_by_taskboard_id(taskboard_id)
            taskboard = await self.tb_repo.delete_task_board_by_id(taskboard_id)
            taskboard.task_points = task_points
            return taskboard          

        taskboard = await self.tb_repo.get_task_board_by_id(taskboard_id)
        if taskboard is None or user.id is None:
            return None
        
        user_role = await self.user_data_service.get_user_role(user_id=user.id, company_id=taskboard.company_id)
        creator_role = await self.user_data_service.get_user_role(user_id=taskboard.created_by, company_id=taskboard.company_id)
        if creator_role == RoleType.OWNER and creator_role == user_role:
            await conform_delete(taskboard_id)
        elif creator_role == RoleType.OWNER:
            return None
        else:
            await conform_delete(taskboard_id)


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
                created_by=taskboard.created_by,
                admin_id=taskboard.admin_id,
                done_at=taskboard.done_at
            )
        )
        new_task_points = await self.tp_repo.edit_task_points_by_dto_list(
            task_points=taskboard.task_points,
            task_board=taskboard.id
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
            created_by=new_task_board.created_by,
            admin_id=new_task_board.admin_id,
            done_at=new_task_board.done_at,
            task_points=new_task_points
        )
    
    async def get_task_boards_by_company_id_and_user_id(self, company_id: int, user_id: int) -> List[TaskBoardResponse]:
        user_role = await self.user_data_service.get_user_role(user_id=user_id, company_id=company_id)
        if user_role == RoleType.OWNER:
            taskboards = await self.tb_repo.get_task_boards_by_company_id(company_id=company_id)
        elif user_role == RoleType.ADMIN:
            # Для админа получаем задачи из всех workgroup'ов, где он участник
            taskboards = await self.tb_repo.get_task_boards_by_company_id_and_user_id(company_id=company_id, user_id=user_id)
        else:
            taskboards = await self.tb_repo.get_task_boards_by_company_id_and_user_id(company_id=company_id, user_id=user_id)
        taskboards_to_response = []
        for taskboard in taskboards:
            taskpoints = await self.tp_repo.get_task_point_by_taskboard_id(taskboard.id)
            taskboards_to_response.append(TaskBoardResponse(
            id=taskboard.id,
            title=taskboard.title,
            company_id=taskboard.company_id,
            work_group_id=taskboard.work_group_id,
            image=taskboard.image,
            location=taskboard.location,
            type=taskboard.type,
            description=taskboard.description or "",
            task_points=taskpoints
            ))
        return taskboards_to_response
    
    async def create_taskboard(self, taskboard_data: TaskBoardResponse, creator: UserDTO) -> TaskBoardResponse:
        print(creator.id, creator.name)
        new_taskboard = await self.tb_repo.add_task_board(
            new_task_board=TaskBoardDTO(
                title=taskboard_data.title,
                company_id=taskboard_data.company_id,
                work_group_id=taskboard_data.work_group_id,
                image=taskboard_data.image,
                location=taskboard_data.location,
                type=taskboard_data.type,
                created_by=creator.id,
                admin_id=taskboard_data.admin_id,
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
            task_point_to_return.append(new_taskpoint)


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
        taskboard = await self.tb_repo.get_taskboards_by_work_group_id(work_group_id=work_group_id)
        return taskboard
