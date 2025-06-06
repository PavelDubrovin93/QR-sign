from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession


# импортируете свой репозиторий и энтити для теста
from app.infrastructure.repositories.UserRepository import UserRepository
from app.infrastructure.repositories.UISettingsRepository import UISettingsRepository

from app.models.dbModels.User.UserEntity import UserEntity as User

from typing import Any


async def test_service(session: AsyncSession) -> Any:
    repo_user = UserRepository(session)
    repo_ui = UISettingsRepository(session)

    user = User(username='test', email='test@ya.ru', password='test')
    data = await UserRepository.add_user(new_user=user)

    return data

    # user_repo = UserRepository(session)
    # user = await user_repo.find_by_email(email)
    # if user:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail="User with given email already exist",
    #     )
    # auth = AuthService()
    # hashed_password = auth.get_password_hash(password)
    # new_user = User(
    #     id=uuid4(),
    #     username=username,
    #     email=email,
    #     hashed_password=hashed_password,
    # )

    # await user_repo.add_user(new_user)
    # return new_user