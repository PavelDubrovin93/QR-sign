from app.models.dtoModels.Entity import Entity


class UserDTO(Entity):
    id: int
    tg_ig: int
    name: str
    company_id: int  # дописать при добавлении модели company
