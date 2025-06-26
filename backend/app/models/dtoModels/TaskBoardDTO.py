from typing import Optional

from app.validation.dtoModels.Entity import Entity


class TaskBoardDTO(Entity):
    id: int
    title: str
    company_id: int
    work_group_id: int
    image: str
    location: list
    type: str
    description: Optional[str]
    done_at: Optional[str]
