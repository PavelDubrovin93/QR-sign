from typing import List
from app.models.dtoModels.TaskPointDTO import TaskPointDTO
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository

class UserDataService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def tasks_for_user(self, user_id: str) -> List[TaskPointDTO]:
        repo = TaskPointRepository(self.session)
        tasks = await repo.get_task_point_by_user_id(user_id)
        return tasks


    async def unviewed_tasks_count_for_user(self, user_id: str) -> int:
        tasks = await self.tasks_for_user(user_id)
        unviewed_task_count = [tp for tp in tasks if tp.issued_at is None]
        return len(unviewed_task_count)
