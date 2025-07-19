from typing import List, Optional

from app.validation.dtoModels.TaskBoardDTO import TaskBoardDTO
from app.validation.dtoModels.TaskPointDTO import TaskPointDTO


class TaskBoardResponse(TaskBoardDTO):
    task_points: Optional[List[TaskPointDTO]] = None
