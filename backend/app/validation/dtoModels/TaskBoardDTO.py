from typing import Optional, Union
from datetime import datetime
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
    created_by: Optional[int] = None
    admin_id: Optional[int] = None
    done_at: Optional[Union[datetime, str]] = None
