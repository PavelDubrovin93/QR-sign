from app.models.dtoModels.Entity import Entity


class UserDTO(Entity):
    id: int
    tg_id: int
    name: str
    photo_url: str
