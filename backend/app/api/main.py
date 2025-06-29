from fastapi import APIRouter

from app.api.routes import (
    CompanyRoute,
    QRCodeRoute,
    TaskBoardRoute,
    UISettingRoute,
    UserDataRoute,
    UserRoute,
    TaskPointRoute
)

api_router = APIRouter()

api_router.include_router(UserRoute.router, prefix="/users", tags=["users"])
api_router.include_router(UserDataRoute.router, prefix="/user_data", tags=["user_data"])
api_router.include_router(UISettingRoute.router, prefix="/settings", tags=["settings"])
api_router.include_router(QRCodeRoute.router, prefix="/qr_code", tags=["qr_code"])
api_router.include_router(
    TaskBoardRoute.router, prefix="/taskboard", tags=["taskboard"]
)
api_router.include_router(TaskPointRoute.router, prefix="/taskpoints", tags=["user_data"])
api_router.include_router(CompanyRoute.router, prefix="/companies", tags=["companies"])
