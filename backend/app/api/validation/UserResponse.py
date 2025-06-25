from app.models.dtoModels.UserDTO import UserDTO


class UserResponse(UserDTO):
    ui_settings: int
