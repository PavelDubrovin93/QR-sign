from typing import List, Optional

from app.models.dbModels.User.IUserRepository import IUserRepository
from app.models.dbModels.User.UserEntity import UserEntity as User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class UserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_id(self, id: int) -> Optional[dict]:
        query = select(User).where(User.id == id)
        result = await self.session.execute(query)
        user = result.scalars().first()
        return user.to_dict() if user else None

    async def get_user_by_tg_id(self, tg_id: int) -> User:
        query = select(User).where(User.tg_id == tg_id)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return user

    async def get_user_all(self) -> List[dict]:
        query = select(User)
        result = await self.session.execute(query)
        users = result.scalars().all()
        return [user.to_dict() for user in users]

    async def add_user(self, new_user: User) -> dict:
        self.session.add(new_user)
        await self.session.commit()
        return new_user.to_dict()
