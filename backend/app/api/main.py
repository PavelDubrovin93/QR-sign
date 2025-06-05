from fastapi import APIRouter

from app.api.routes import UserRout

api_router = APIRouter()

api_router.include_router(UserRout.router, prefix="/user", tags=["user"])
