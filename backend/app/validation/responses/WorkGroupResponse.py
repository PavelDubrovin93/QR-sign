from typing import List

from app.validation.dtoModels.UserCompanyDTO import UserCompanyDTO
from app.validation.dtoModels.UserDTO import UserDTO
from app.validation.dtoModels.WorkGroupDTO import WorkGroupDTO
from app.validation.Entity import Entity
from app.validation.responses.TaskBoardResponse import TaskBoardResponse


class CreateWorkGroupResponse(Entity):
    title: str
    description: str | None = None
    company_id: int


class UserAndUC(Entity):
    user: UserDTO
    uc: UserCompanyDTO


class WorkGroupAndTaskboardResponse(Entity):
    taskboards: List[TaskBoardResponse]
    users: List[UserAndUC]
    workgroup: WorkGroupDTO
