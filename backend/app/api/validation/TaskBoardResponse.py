from typing import List
from app.models.dtoModels.TaskPointDTO import TaskPointDTO
from app.models.dtoModels.TaskBoardDTO import TaskBoardDTO


class TaskBoardResponse(TaskBoardDTO):
    task_points: List[TaskPointDTO]
