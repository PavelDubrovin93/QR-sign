from typing import Optional

from app.validation.Entity import Entity


class WorkGroupDTO(Entity):
    id: Optional[int] = None
    title: str
    description: str | None = None
    company_id: int
