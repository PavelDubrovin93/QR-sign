from typing import List, Optional
import datetime as dt
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.interfaces.repositories.ITaskPointRepository import \
    ITaskPointRepository
from app.models.dbModels.TaskBoard.TaskBoardEntity import \
    TaskBoardEntity as TaskBoard
from app.models.dbModels.TaskPoint.TaskPointEntity import \
    TaskPointEntity as TaskPoint
from app.models.dbModels.UserCompany.UserCompanyEntity import \
    UserCompanyEntity as UserCompany
from app.models.dbModels.WorkGroup.WorkGroupEntity import \
    WorkGroupEntity as WorkGroup
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
        query = (
            select(TaskPoint)
            .where(TaskPoint.taskboard_id == taskboard_id)
            .order_by(TaskPoint.created_at)
        )
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

        task_point_entity = TaskPoint(
            title=new_task_point.title,
            taskboard_id=new_task_point.taskboard_id,
            thumbnails=new_task_point.thumbnails,
            mark_icon=new_task_point.mark_icon,
            coordinates=new_task_point.coordinates,
            points=new_task_point.points,
            qrcode=new_task_point.qrcode,
            description=new_task_point.description,
            voice_massage=new_task_point.voice_message,
            done_at=new_task_point.done_at,
            issued_at=new_task_point.issued_at,
            warning_at=new_task_point.warning_at,
        )

        self.session.add(task_point_entity)
        await self.session.commit()
        await self.session.refresh(task_point_entity)
        task_point_dto = await self.__to_dto(task_point_entity) if task_point_entity else None
        return task_point_dto

    async def delete_task_point_by_id(self, task_point_id: int) -> None:
        query = select(TaskPoint).where(TaskPoint.id == task_point_id)
        result = await self.session.execute(query)
        task_board_to_delete = result.scalars().first()
        if task_board_to_delete is None:
            raise ValueError(f"Таскпоинт с id {task_point_id} не существует.")
        await self.session.delete(task_board_to_delete)
        await self.session.commit()

    async def delete_task_point_by_taskboard_id(self, taskboard_id: int) -> None:
        query = select(TaskPoint).where(TaskPoint.taskboard_id == taskboard_id)
        result = await self.session.execute(query)
        task_points = result.scalars().all()

        for task_point in task_points:
            if task_point is None:
                raise HTTPException(
                    status_code=404, detail=f"Task Point {task_point} not found"
                )
            await self.session.delete(task_point)

        await self.session.commit()

        task_point_dto_list = [
            await self.__to_dto(task_point) for task_point in task_points
        ]

        return task_point_dto_list

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

    async def edit_task_point_by_dto(
        self, new_task_point: TaskPointDTO
    ) -> TaskPointDTO:
        if new_task_point.id is None:
            real_new_task_point = await self.add_task_point(new_task_point=TaskPointDTO(
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
                warning_at=new_task_point.warning_at
            ))
            return real_new_task_point
        query = select(TaskPoint).where(TaskPoint.id == new_task_point.id)
        result = await self.session.execute(query)
        task_point = result.scalar_one_or_none()

        if task_point is None:
            raise ValueError(f"Таскпоинт с id {new_task_point.id} не существует.")

        task_point.title = new_task_point.title
        task_point.taskboard_id = new_task_point.taskboard_id
        task_point.thumbnails = new_task_point.thumbnails
        task_point.mark_icon = new_task_point.mark_icon
        task_point.coordinates = new_task_point.coordinates
        task_point.points = new_task_point.points
        task_point.qrcode = new_task_point.qrcode
        task_point.description = new_task_point.description
        task_point.voice_message = new_task_point.voice_message
        task_point.done_at = dt.datetime.fromisoformat(new_task_point.done_at) or None
        task_point.issued_at = dt.datetime.fromisoformat(new_task_point.issued_at) or None
        task_point.warning_at = new_task_point.warning_at

        await self.session.commit()
        await self.session.refresh(task_point)
        task_point_dto = await self.__to_dto(task_point) if task_point else None
        return task_point_dto

    async def edit_task_points_by_dto_list(
        self, task_points: List[TaskPointDTO], task_board: int
    ):
        #  Проверяем есть ли записи в запросе
        task_points_to_return = []
        if task_points:
            #  если записи есть, сличаем с тем, что у нас есть в бд
            db_taskpoints = await self.get_task_point_by_taskboard_id(
                taskboard_id=task_board
            )
            existing_ids = {tp.id for tp in db_taskpoints}
            incoming_ids = {tp.id for tp in task_points}
            #  удаляем те записи, которых нет в запросе, но есть в бд
            to_delete_ids = existing_ids - incoming_ids
            for taskpoint_id in to_delete_ids:
                await self.delete_task_point_by_id(taskpoint_id)
            # Редактируем записи которые есть в запросе
            for task_point in task_points:
                #  Если есть записи, которых нету в бд, они обрабатываются в edit_task_point_by_dto
                result = await self.edit_task_point_by_dto(new_task_point=task_point)
                task_points_to_return.append(result)
        #  Если в запросе нет записей - удаляем все записи связанные с таскбордом
        else:
            await self.delete_task_point_by_taskboard_id(task_board)
        return task_points_to_return

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
            voice_message=taskpoint.voice_massage,
            done_at=taskpoint.done_at,
            issued_at=taskpoint.issued_at,
            warning_at=taskpoint.warning_at,
        )
