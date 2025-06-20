from typing import List
from app.models.dtoModels.UserDTO import UserDTO
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.interfaces.IUserDataService import IUserDataService
from app.api.validation.TaskBoardResponse import TaskBoardResponse
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository

class UserDataService(IUserDataService):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def tasks_for_user(self, user: UserDTO) -> List[TaskBoardResponse]:
        user_id = user.id
        tp_repo = TaskPointRepository(self.session)
        tb_repo = TaskBoardRepository(self.session)
        tasks = await tp_repo.get_task_point_by_user_id(user_id)
        boards_map = {}
        for point in tasks:
            board_id = point.taskboard_id
            if board_id not in boards_map:
                taskboard = await tb_repo.get_task_board_by_id(board_id)
                boards_map[board_id] = TaskBoardResponse(
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
            boards_map[board_id].task_points.append(point)
        responses = list(boards_map.values())
        return responses



    async def unviewed_tasks_count_for_user(self, user: UserDTO) -> int:
        user_id = user.id
        tp_repo = TaskPointRepository(self.session)
        tasks = await tp_repo.get_task_point_by_user_id(user_id)
        unviewed_task_count = [tp for tp in tasks if tp.issued_at is None]
        return len(unviewed_task_count)
