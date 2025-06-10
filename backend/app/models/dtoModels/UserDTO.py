from app.models.dtoModels.Entity import Entity


class UserDTO(Entity):
    id: int
    tg_ig: int
    name: str
    ui_settings: int
