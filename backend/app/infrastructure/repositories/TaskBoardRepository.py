from typing import List, Optional

from app.models.dbModels.TaskBoard.ITaskBoardRepository import ITaskBoardRepository
from app.models.dbModels.TaskBoard.TaskBoardEntity import TaskBoardEntity as TaskBoard
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class UserRepository(ITaskBoardRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_board_by_id(self, id: int) -> Optional[dict]:
        query = select(TaskBoard).where(TaskBoard.id == id)
        result = await self.session.execute(query)
        user = result.scalars().first()
        return user.to_dict() if user else None

    async def get_task_board_by_company_id(self, company_id: int) -> TaskBoard:
        query = select(TaskBoard).where(TaskBoard.company_id == company_id)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return user

    async def get_task_board_by_work_group_id(self, work_group_id: int) -> TaskBoard:
        query = select(TaskBoard).where(TaskBoard.work_group_id == work_group_id)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return user
    
    async def get_task_board_by_type(self, type: str) -> TaskBoard:
        query = select(TaskBoard).where(TaskBoard.type == type)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return user

    async def get_task_board_all(self) -> List[dict]:
        query = select(TaskBoard)
        result = await self.session.execute(query)
        task_boards = result.scalars().all()
        return [task_board.to_dict() for task_board in task_boards]
    
    async def add_task_board(self, new_user: TaskBoard) -> dict:
        self.session.add(new_user)
        await self.session.commit()
        return new_user.to_dict()
