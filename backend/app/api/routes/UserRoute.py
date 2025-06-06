from fastapi import APIRouter

router = APIRouter()

# @router.post("/user", status_code=201)
# async def register(user: UserDTO, session: AsyncSession = Depends(fastapi_get_db)):
#     user = await add_user(username=user.name, email=user.email, password=user.password, session=session)
#     return user
