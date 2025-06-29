from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import fastapi_get_db
from app.services.TaskPointService import TaskPointService


from app.api.dependenices.user_dependecy import get_current_user

from typing import List


router = APIRouter()