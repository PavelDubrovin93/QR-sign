from fastapi import APIRouter

from app.api.routes import UserRoute, UserDataRoute, UISettingRoute, QRCodeRoute, TaskBoardRoute

api_router = APIRouter()

api_router.include_router(UserRoute.router, prefix="/user", tags=["user"])
api_router.include_router(UserDataRoute.router, prefix="/user_data", tags=["user_data"])
api_router.include_router(UISettingRoute.router, prefix="/settings", tags=["settings"])
api_router.include_router(QRCodeRoute.router, prefix="/qr_code", tags=["qr_code"])
api_router.include_router(TaskBoardRoute.router, prefix="/taskboard", tags=["taskboard"])
