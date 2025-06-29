from app.validation.Entity import Entity


class CreateWorkGroupResponse(Entity):
    title: str
    description: str | None = None
    company_id: int
