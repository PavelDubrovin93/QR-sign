from fastapi import APIRouter

from app.api.routes import TestRoute, UserRoute, UserDataRoute, UISettingRoute, QRCodeRoute, TaskBoard

api_router = APIRouter()

api_router.include_router(UserRoute.router, prefix="/user", tags=["user"])
api_router.include_router(TestRoute.router, prefix="/test", tags=["test"])
api_router.include_router(UserDataRoute.router, prefix="/user_data", tags=["user_data"])
api_router.include_router(UISettingRoute.router, prefix="/settings", tags=["settings"])
api_router.include_router(QRCodeRoute.router, prefix="/qr_code", tags=["qr_code"])
api_router.include_router(TaskBoard.router, prefix="/taskboard", tags=["taskboard"])
