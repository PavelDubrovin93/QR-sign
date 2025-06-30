from typing import Optional

from app.validation.Entity import Entity


class TaskBoardDTO(Entity):
    id: Optional[int] = None
    title: str
    company_id: int
    work_group_id: int
    image: str
    location: list
    type: str
    description: Optional[str]
    done_at: Optional[str] = None
