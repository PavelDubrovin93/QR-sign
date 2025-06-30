from app.validation.Entity import Entity
from typing import Optional


class WorkGroupDTO(Entity):
    id: Optional[int] = None
    title: str
    description: str | None = None
    company_id: int
