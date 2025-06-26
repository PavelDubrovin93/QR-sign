from app.validation.dtoModels.UISettingsDTO import UISettingsDTO


class UISettingResponse(UISettingsDTO):
    current_role: str
    name_for_admin: str
