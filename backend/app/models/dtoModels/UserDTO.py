from app.models.dtoModels.Entity import Entity
from type import Optional


class UserDTO(Entity):
    id: Optional[int]
    tg_id: int
    name: str
    photo_url: str
