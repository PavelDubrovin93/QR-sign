from fastapi import APIRouter

from app.api.routes import UserRoute
from app.api.routes import TestRoute



api_router = APIRouter()

api_router.include_router(UserRoute.router, prefix="/user", tags=["user"])
api_router.include_router(TestRoute.router, prefix="/test", tags=["test"])
