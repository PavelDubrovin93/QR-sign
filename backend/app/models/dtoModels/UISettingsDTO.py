from app.models.dtoModels.Entity import Entity


class UISettingsDTO(Entity):
    id: int = None
    user_id: int
    default_company_choice: int  = 1
    default_color: str = '#0000FF'
