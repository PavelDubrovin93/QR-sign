from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.validation.responses.TaskBoardResponse import TaskBoardResponse
from app.infrastructure.interfaces.services.ITaskPointService import ITaskPointService
from app.infrastructure.repositories.TaskBoardRepository import TaskBoardRepository
from app.infrastructure.repositories.TaskPointRepository import TaskPointRepository

from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.responses.TaskBoardResponse import CreateTaskBoardResponse

from typing import List


class TaskPointService(ITaskPointService):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.tb_repo = TaskBoardRepository(self.session)
        self.tp_repo = TaskPointRepository(self.session)