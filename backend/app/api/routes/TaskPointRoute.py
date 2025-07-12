
from fastapi import APIRouter


router = APIRouter()


@router.get("/tasks")
async def tasks_for_user():
    pass
