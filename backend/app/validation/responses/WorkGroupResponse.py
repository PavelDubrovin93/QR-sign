from app.validation.Entity import Entity
from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO
from app.validation.responses.TaskBoardResponse import TaskBoardResponse

class CreateWorkGroupResponse(Entity):
    title: str
    description: str | None = None
    company_id: int


class WorkGroupAndTaskboardResponse(Entity):
    workgroup: WorkGroupDTO
    taskboards: list[TaskBoardResponse]
