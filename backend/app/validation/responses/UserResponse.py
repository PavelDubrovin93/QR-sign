from app.validation.dtoModels.UserDTO import UserDTO


class UserResponse(UserDTO):
    ui_settings: int
