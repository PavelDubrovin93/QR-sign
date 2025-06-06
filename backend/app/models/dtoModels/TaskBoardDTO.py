from app.models.dtoModels.Entity import Entity


class TaskBoardDTO(Entity):
    id: int
    title: str
    company_id: int
    work_group_id: int
    image: str
    location: list
    type: str
    description: str
    done_at: str