from app.api.routes import UserRout
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(UserRout.router, prefix="/user", tags=["user"])
