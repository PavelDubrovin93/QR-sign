from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.interfaces.repositories.ITaskPointRepository import (
    ITaskPointRepository,
)
from app.models.dbModels.TaskBoard.TaskBoardEntity import TaskBoardEntity as TaskBoard
from app.models.dbModels.TaskPoint.TaskPointEntity import TaskPointEntity as TaskPoint
from app.models.dbModels.UserCompany.UserCompanyEntity import (
    UserCompanyEntity as UserCompany,
)
from app.models.dbModels.WorkGroup.WorkGroupEntity import WorkGroupEntity as WorkGroup
from app.validation.dtoModels.TaskPointDTO import TaskPointDTO


class TaskPointRepository(ITaskPointRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_task_point_by_id(self, id: int) -> Optional[TaskPointDTO]:
        query = select(TaskPoint).where(TaskPoint.id == id)
        result = await self.session.execute(query)
        task_point = result.scalar_one_or_none()
        task_point_dto = await self.__to_dto(task_point) if task_point else None
        return task_point_dto

    async def get_task_point_by_taskboard_id(
        self, taskboard_id: int
    ) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(TaskPoint.taskboard_id == taskboard_id)
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        task_points_dto = [
            await self.__to_dto(task_point) for task_point in task_points
        ]
        return task_points_dto

    async def get_task_point_by_taskboard_id_and_done_at(
        self, taskboard_id: int, done_at: str
    ) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id, TaskPoint.done_at == done_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        task_points_dto = [
            await self.__to_dto(task_point) for task_point in task_points
        ]
        return task_points_dto

    async def get_task_point_by_taskboard_id_and_issued_at(
        self, taskboard_id: int, issued_at: str
    ) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id, TaskPoint.issued_at == issued_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        task_points_dto = [
            await self.__to_dto(task_point) for task_point in task_points
        ]
        return task_points_dto

    async def get_task_point_by_taskboard_id_and_warning_at(
        self, taskboard_id: int, warning_at: str
    ) -> List[TaskPointDTO]:
        query = select(TaskPoint).where(
            TaskPoint.taskboard_id == taskboard_id, TaskPoint.warning_at == warning_at
        )
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        task_points_dto = [
            await self.__to_dto(task_point) for task_point in task_points
        ]
        return task_points_dto

    async def add_task_point(self, new_task_point: TaskPointDTO) -> TaskPointDTO:

        new_task_point = TaskPoint(
            id=new_task_point.id,
            title=new_task_point.title,
            taskboard_id=new_task_point.taskboard_id,
            thumbnails=new_task_point.thumbnails,
            mark_icon=new_task_point.mark_icon,
            coordinates=new_task_point.coordinates,
            points=new_task_point.points,
            qrcode=new_task_point.qrcode,
            description=new_task_point.description,
            voice_message=new_task_point.voice_message,
            done_at=new_task_point.done_at,
            issued_at=new_task_point.issued_at,
            warning_at=new_task_point.warning_at,
        )
        self.session.add(new_task_point)
        await self.session.commit()
        task_point_dto = await self.__to_dto(new_task_point) if new_task_point else None
        return task_point_dto

    async def delete_task_point_by_id(self, task_point_id: int) -> None:
        query = select(TaskPoint).where(TaskPoint.id == task_point_id)
        result = await self.session.execute(query)
        task_board_to_delete = result.scalars().first()
        if task_board_to_delete is None:
            raise ValueError(f"Таскпоинт с id {task_point_id} не существует.")
        await self.session.delete(task_board_to_delete)
        await self.session.commit()

    async def get_task_point_by_user_id(self, user_id: int) -> List[TaskPointDTO]:
        subquery_workgroups = (
            select(UserCompany.workgroup_id)
            .join(WorkGroup, WorkGroup.id == UserCompany.workgroup_id)
            .filter(UserCompany.user_id == user_id)
        ).scalar_subquery()

        subquery_taskboards = (
            select(TaskBoard.id)
            .join(WorkGroup, WorkGroup.id == TaskBoard.work_group_id)
            .filter(WorkGroup.id.in_(subquery_workgroups))
        ).scalar_subquery()

        query = select(TaskPoint).where(TaskPoint.taskboard_id.in_(subquery_taskboards))
        result = await self.session.execute(query)
        task_points = result.scalars().all()
        task_points_dto = [
            await self.__to_dto(task_point) for task_point in task_points
        ]
        return task_points_dto

    async def get_task_point_by_qr(
        self, qr_code_binary: bytes
    ) -> Optional[TaskPointDTO]:
        query = select(TaskPoint).where(TaskPoint.qrcode == qr_code_binary)
        result = await self.session.execute(query)
        task_point = result.scalar_one_or_none()
        task_point_dto = await self.__to_dto(task_point) if task_point else None
        return task_point_dto

    async def __to_dto(self, taskpoint: TaskPoint) -> TaskPointDTO:
        return TaskPointDTO(
            id=taskpoint.id,
            title=taskpoint.title,
            taskboard_id=taskpoint.taskboard_id,
            thumbnails=taskpoint.thumbnails,
            mark_icon=taskpoint.mark_icon,
            coordinates=taskpoint.coordinates,
            points=taskpoint.points,
            qrcode=taskpoint.qrcode,
            description=taskpoint.description,
            voice_message=taskpoint.voice_message,
            done_at=taskpoint.done_at,
            issued_at=taskpoint.issued_at,
            warning_at=taskpoint.warning_at,
        )
