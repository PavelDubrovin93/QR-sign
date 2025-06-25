from typing import List, Optional

from app.models.dbModels.TaskBoard.ITaskBoardRepository import ITaskBoardRepository
from app.models.dbModels.TaskBoard.TaskBoardEntity import TaskBoardEntity as TaskBoard
from app.models.dtoModels.TaskBoardDTO import TaskBoardDTO
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class TaskBoardRepository(ITaskBoardRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_board_by_id(self, id: int) -> Optional[TaskBoardDTO]:
        query = select(TaskBoard).where(TaskBoard.id == id)
        result = await self.session.execute(query)
        task_board = result.scalar_one_or_none()
        task_board_dto = await self.__to_dto(task_board) if task_board else None
        return task_board_dto

    async def get_task_board_by_company_id(self, company_id: int) -> TaskBoardDTO:
        query = select(TaskBoard).where(TaskBoard.company_id == company_id)
        result = await self.session.execute(query)
        task_board = result.scalar_one_or_none()
        task_board_dto = await self.__to_dto(task_board) if task_board else None
        return task_board_dto

    async def get_task_board_by_work_group_id(self, work_group_id: int) -> TaskBoardDTO:
        query = select(TaskBoard).where(TaskBoard.work_group_id == work_group_id)
        result = await self.session.execute(query)
        task_board = result.scalar_one_or_none()
        task_board_dto = await self.__to_dto(task_board) if task_board else None
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
        task_boards_dto = [await self.__to_dto(task_board) for task_board in task_boards]
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
            done_at=new_task_board.done_at
        )
        self.session.add(new_task_board)
        await self.session.commit()
        return self.__to_dto(new_task_board)

    async def delete_task_board_by_id(self, task_board_id: int) -> None:
        query = select(TaskBoard).where(TaskBoard.id == task_board_id)
        result = await self.session.execute(query)
        task_board_to_delete = result.scalars().first()
        if task_board_to_delete is None:
            raise ValueError(f"Таскборд с id {task_board_id} не существует.")
        await self.session.delete(task_board_to_delete)
        await self.session.commit()

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
            done_at=taskboard.done_at
        )