from typing import List, Optional

from app.models.dbModels.TaskPoint.ITaskPointRepository import ITaskPointRepository
from app.models.dbModels.TaskPoint.TaskPointEntity import TaskPointEntity as TaskPoint
from app.models.dtoModels.TaskPointDTO import TaskPointDTO
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class TaskPointRepository(ITaskPointRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_point_by_id(self, id: int) -> Optional[TaskPointDTO]:
        query = select(TaskPoint).where(TaskPoint.id == id)
        result = await self.session.execute(query)
        task_point = result.scalars().first()
        return task_point.to_dto() if task_point else None

    async def get_task_point_by_taskboard_id(self, taskboard_id: int) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(TaskPoint.taskboard_id == taskboard_id)
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dto() for task_point in task_points]

    async def get_task_point_by_taskboard_id_and_done_at(self, taskboard_id: int, done_at: str) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id,
            TaskPoint.done_at == done_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dto() for task_point in task_points]

    async def get_task_point_by_taskboard_id_and_issued_at(self, taskboard_id: int, issued_at: str) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id,
            TaskPoint.issued_at == issued_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dto() for task_point in task_points]

    async def get_task_point_by_taskboard_id_and_warning_at(self, taskboard_id: int, warning_at: str) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id,
            TaskPoint.warning_at == warning_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        return [task_point.to_dto() for task_point in task_points]
    
    async def add_task_point(self, new_task_point: TaskPointDTO) -> TaskPointDTO:
        
        new_task_point = TaskPoint(
            id=self.id,
            title=self.title,
            taskboard_id=self.taskboard_id,
            thumbnails=self.thumbnails,
            mark_icon=self.mark_icon,
            coordinates=self.coordinates,
            points=self.points,
            qrcode=self.qrcode,
            description=self.description,
            voice_message=self.voice_message,
            done_at=self.done_at,
            issued_at=self.issued_at,
            warning_at=self.warning_at
        )
        self.session.add(new_task_point)
        await self.session.commit()
        return new_task_point.to_dto()

    async def delete_task_point_by_id(self, task_point_id: int) -> None:
        query = select(TaskPoint).where(TaskPoint.id == task_point_id)
        result = await self.session.execute(query)
        task_board_to_delete = result.scalars().first()
        if task_board_to_delete is None:
            raise ValueError(f"Таскпоинт с id {task_point_id} не существует.")
        await self.session.delete(task_board_to_delete)
        await self.session.commit()