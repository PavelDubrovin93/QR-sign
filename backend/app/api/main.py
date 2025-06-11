from fastapi import APIRouter

from app.api.routes import TestRoute, UserRoute, UserDataRoute, UISettingRoute

api_router = APIRouter()

api_router.include_router(UserRoute.router, prefix="/user", tags=["user"])
api_router.include_router(TestRoute.router, prefix="/test", tags=["test"])
api_router.include_router(UserDataRoute.router, prefix="/user_data", tags=["user_data"])
api_router.include_router(UISettingRoute.router, prefix="/settings", tags=["user_data"])
