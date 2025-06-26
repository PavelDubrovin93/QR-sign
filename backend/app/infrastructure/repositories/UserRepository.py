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
        user =  result.scalar_one_or_none()
        user_dto = await self.__to_dto(user) if user else None
        return user_dto

    async def get_user_by_tg_id(self, tg_id: int) -> Optional[UserDTO]:
        query = select(User).where(User.tg_id == tg_id)
        result = await self.session.execute(query)
        user = result.scalar_one_or_none()
        user_dto = await self.__to_dto(user) if user else None
        return user_dto

    async def get_user_all(self) -> List[UserDTO]:
        query = select(User)
        result = await self.session.execute(query)
        users = result.scalars().all()
        users_dto = [await self.__to_dto(user) for user in users]
        return users_dto

    async def add_user(self, new_user: UserDTO) -> Optional[UserDTO]:
        new_user = User(
            name=new_user.name,
            tg_id=new_user.tg_id,
            photo_url=new_user.photo_url
        )
        self.session.add(new_user)
        await self.session.commit()
        user_dto = await self.__to_dto(new_user)
        return user_dto
    
    async def update_user(self, user_data: UserDTO) -> Optional[UserDTO]:
        query = select(User).where(User.id == User.id)
        result = await self.session.execute(query)
        existing_user = result.scalars().first()
        if existing_user is None:
            new_user =  self.create_ui_settings(user_data)
            return new_user
        existing_user.tg_id = user_data.tg_id
        existing_user.name = user_data.name
        existing_user.photo_url = user_data.photo_url
        existing_user.default_company_choice = user_data.default_company_choice

        await self.session.commit()
        await self.session.refresh(existing_user)
        user_dto = await self.__to_dto(existing_user) if existing_user else None
        return user_dto 

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
            photo_url=user.photo_url
        )