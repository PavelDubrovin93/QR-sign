from app.validation.Entity import Entity

class CreateUserResponse(Entity):
    tg_id: int
    name: str
    photo_url: str

class UserResponse(CreateUserResponse):
    id: int
    ui_settings: int

class UsersInCompanyResponse(CreateUserResponse):
    id: int
    uc_id: int