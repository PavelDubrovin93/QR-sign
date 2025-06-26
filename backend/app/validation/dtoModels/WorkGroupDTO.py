from app.validation.Entity import Entity


class WorkGroupDTO(Entity):
    id: int
    title: str
    description: str | None = None
    company_id: int
