from typing import List, Optional
import datetime as dt
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.interfaces.repositories.ITaskBoardRepository import \
    ITaskBoardRepository
from app.models.dbModels.TaskBoard.TaskBoardEntity import \
    TaskBoardEntity as TaskBoard
from app.models.dbModels.UserCompany.UserCompanyEntity import \
    UserCompanyEntity as UserCompany  # TODO: FIX LATER
from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.responses.TaskBoardResponse import TaskBoardResponse
from app.infrastructure.repositories.UserCompanyRepository import UserCompanyRepository


# pesos
class TaskBoardRepository(ITaskBoardRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_board_by_id(self, id: int) -> Optional[TaskBoardDTO]:
        query = select(TaskBoard).where(TaskBoard.id == id)
        result = await self.session.execute(query)
        task_board = result.scalar_one_or_none()
        task_board_dto = await self.__to_dto(task_board) if task_board else None
        return task_board_dto

    async def get_task_boards_by_company_id(self, company_id: int) -> List[TaskBoardDTO]:
        query = select(TaskBoard).where(TaskBoard.company_id == company_id)
        result = await self.session.execute(query)
        task_boards = result.scalars().all()
        task_boards_dto = [
            await self.__to_dto(task_board) for task_board in task_boards
        ]
        return task_boards_dto

    async def get_task_boards_by_work_group_id(self, work_group_id: int) -> TaskBoardDTO:
        query = select(TaskBoard).where(TaskBoard.work_group_id == work_group_id)
        result = await self.session.execute(query)
        task_boards = result.scalars().all()
        task_board_dto = [await self.__to_dto(task_board) for task_board in task_boards]
        return task_board_dto

    async def get_task_board_by_type(self, type: str) -> TaskBoardDTO:
        query = select(TaskBoard).where(TaskBoard.type == type)
        result = await self.session.execute(query)
        task_board = result.scalar_one_or_none()
        task_board_dto = await self.__to_dto(task_board) if task_board else None
        return task_board_dto

    async def get_task_board_all(self) -> List[TaskBoardDTO]:
        query = select(TaskBoard)
        result = await self.session.execute(query)
        task_boards = result.scalars().all()
        task_boards_dto = [
            await self.__to_dto(task_board) for task_board in task_boards
        ]
        return task_boards_dto

    async def add_task_board(self, new_task_board: TaskBoardDTO) -> TaskBoardDTO:
        new_task_board = TaskBoard(
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
        )
        self.session.add(new_task_board)
        await self.session.commit()
        taskboard_dto = await self.__to_dto(new_task_board)
        return taskboard_dto

    async def delete_task_board_by_id(self, task_board_id: int) -> TaskBoardResponse:
        query = select(TaskBoard).where(TaskBoard.id == task_board_id)
        result = await self.session.execute(query)
        task_board_to_delete = result.scalars().first()

        if task_board_to_delete is None:
            raise HTTPException(status_code=404, detail="Task Board not found")

        await self.session.delete(task_board_to_delete)
        await self.session.commit()

        return TaskBoardResponse(
            id=task_board_to_delete.id,
            title=task_board_to_delete.title,
            company_id=task_board_to_delete.company_id,
            work_group_id=task_board_to_delete.work_group_id,
            image=task_board_to_delete.image,
            location=task_board_to_delete.location,
            type=task_board_to_delete.type,
            description=task_board_to_delete.description or "",
            done_at=task_board_to_delete.done_at,
            task_points=[],
        )

    async def edit_task_board(self, taskboard: TaskBoardDTO):
        query = select(TaskBoard).where(TaskBoard.id == taskboard.id)
        result = await self.session.execute(query)
        task_board_to_edit = result.scalars().first()

        if task_board_to_edit is None:
            raise HTTPException(status_code=404, detail="Task Board not found")

        task_board_to_edit.title = taskboard.title
        task_board_to_edit.company_id = taskboard.company_id
        task_board_to_edit.work_group_id = taskboard.work_group_id
        task_board_to_edit.image = taskboard.image
        task_board_to_edit.location = taskboard.location
        task_board_to_edit.type = taskboard.type
        task_board_to_edit.description = taskboard.description or ""
        task_board_to_edit.admin_id = taskboard.admin_id
        task_board_to_edit.done_at = dt.datetime.strptime(taskboard.done_at, '%Y-%m-%dT%H:%M:%S')

        await self.session.commit()

        return taskboard

    async def get_taskboards_by_work_group_id(self, work_group_id: int) -> List[TaskBoardDTO]:
        query = select(TaskBoard).where(TaskBoard.work_group_id == work_group_id)
        result = await self.session.execute(query)
        task_boards = result.scalars().all()
        task_boards_dto = [
            await self.__to_dto(task_board) for task_board in task_boards
        ]
        return task_boards_dto

    async def get_task_boards_by_company_id_and_user_id(
        self, company_id: int, user_id: int
    ) -> List[TaskBoardDTO]:
        uc_repo = UserCompanyRepository(self.session)
        # Получаем ВСЕ записи UserCompany для пользователя в данной компании
        user_companies = await uc_repo.get_user_companies_by_company_id_and_user_id(company_id=company_id, user_id=user_id)
        
        all_task_boards = []
        processed_workgroup_ids = set()
        
        for user_company in user_companies:
            # Проверяем, что у пользователя есть workgroup и мы еще не обрабатывали эту группу
            if user_company.workgroup_id is not None and user_company.workgroup_id not in processed_workgroup_ids:
                processed_workgroup_ids.add(user_company.workgroup_id)
                # Получаем задачи для каждой workgroup
                task_boards_in_group = await self.get_taskboards_by_work_group_id(work_group_id=user_company.workgroup_id)
                all_task_boards.extend(task_boards_in_group)
        
        return all_task_boards

    async def get_taskboard_by_admin_id(self, admin_id: int) -> List[TaskBoardDTO]:
        query = select(TaskBoard).where(TaskBoard.admin_id == admin_id)
        result = await self.session.execute(query)
        task_boards = result.scalars().all()
        task_boards_dto = [
            await self.__to_dto(task_board) for task_board in task_boards
        ]
        return task_boards_dto

    async def __to_dto(self, taskboard: TaskBoard) -> TaskBoardDTO:
        return TaskBoardDTO(
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
