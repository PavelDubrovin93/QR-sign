from app.models.dtoModels.Entity import Entity

from typing import Optional


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
