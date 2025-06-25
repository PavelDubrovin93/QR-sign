from app.models.dtoModels.Entity import Entity


class UserCompanyResponse(Entity):
    company_id: int
    company_name: str
    role: str