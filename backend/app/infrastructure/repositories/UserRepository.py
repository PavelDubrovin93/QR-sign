from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.dbModels.User.IUserRepository import IUserRepository
from app.models.dbModels.User.UserEntity import UserEntity as User
from app.models.dtoModels.UserDTO import UserDTO



class UserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_id(self, id: int) -> Optional[UserDTO]:
        query = select(User).where(User.id == id)
        result = await self.session.execute(query)
        user = result.scalars().first()
        return user.to_dto() if user else None

    async def get_user_by_tg_id(self, tg_id: int) -> Optional[UserDTO]:
        query = select(User).where(User.tg_id == tg_id)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        return user.to_dto()

    async def get_user_all(self) -> List[UserDTO]:
        query = select(User)
        result = await self.session.execute(query)
        users = result.scalars().all()
        return [user.to_dto() for user in users]

    async def add_user(self, new_user: UserDTO) -> Optional[UserDTO]:
        new_user = User(
            name=new_user.name,
            tg_id=new_user.tg_id,
            ui_settings=new_user.ui_settings
        )
        self.session.add(new_user)
        await self.session.commit()
        return new_user.to_dto()

    async def delete_user_by_id(self, user_id: int) -> None:
        query = select(User).where(User.id == user_id)
        result = await self.session.execute(query)
        user_to_delete = result.scalars().first()
        if user_to_delete is None:
            raise ValueError(f"Пользователь с id {user_id} не существует.")
        await self.session.delete(user_to_delete)
        await self.session.commit()

    async def __to_dto(self, user: User) -> UserDTO:
        return UserDTO(
            id=user.id,
            name=user.name,
            tg_id=user.tg_id,
            ui_settings=user.ui_settings
        )