from typing import List, Optional

from app.models.dbModels.TaskPoint.ITaskPointRepository import ITaskPointRepository
from app.models.dbModels.TaskPoint.TaskPointEntity import TaskPointEntity as TaskPoint
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class TaskPointRepository(ITaskPointRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_point_by_id(self, id: int) -> Optional[dict]:
        query = select(TaskPoint).where(TaskPoint.id == id)
        result = await self.session.execute(query)
        user = result.scalars().first()
        return user.to_dict() if user else None

    async def get_task_point_by_taskboard_id(self, taskboard_id: int) -> List[dict]:
        query = select(TaskPoint).where(TaskPoint.taskboard_id == taskboard_id)
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dict() for task_point in task_points]

    async def get_task_point_by_taskboard_id_and_done_at(self, taskboard_id: int, done_at: str) -> List[dict]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id,
            TaskPoint.done_at == done_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dict() for task_point in task_points]

    async def get_task_point_by_taskboard_id_and_issued_at(self, taskboard_id: int, issued_at: str) -> List[dict]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id,
            TaskPoint.issued_at == issued_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dict() for task_point in task_points]

    async def get_task_point_by_taskboard_id_and_warning_at(self, taskboard_id: int, warning_at: str) -> List[dict]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id,
            TaskPoint.warning_at == warning_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dict() for task_point in task_points]
    
    async def add_task_point(self, new_task_point: TaskPoint) -> dict:
        self.session.add(new_task_point)
        await self.session.commit()
        return new_task_point.to_dict()
