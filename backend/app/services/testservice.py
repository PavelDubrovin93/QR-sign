from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.UISettingsRepository import UISettingsRepository

# Import your repositories and entities
from app.infrastructure.repositories.UserRepository import UserRepository
from app.models.dbModels.User.UserEntity import UserEntity as User


async def test_service(session: AsyncSession) -> Any:
    repo_user = UserRepository(session)
    repo_ui = UISettingsRepository(session)

    user = User(tg_id=608124825, name="test")

    data = await repo_user.add_user(new_user=user)

    return data
