from app.models.dtoModels.Entity import Entity


class UISettingsDTO(Entity):
    id: int
    user_id: int
    default_company_choice: int  # ID компании по умолчанию
    default_color: str
