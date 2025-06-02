import datetime

from app.models.dbModels.EntityDB import EntityDB
from sqlalchemy import Column, String, UUID, BigInteger, Integer, Boolean, DateTime, Float, ARRAY, Text


class UserEntity(EntityDB):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    tg_id = Column(BigInteger, nullable=False)
    name = Column(String(64), nullable=True)
    role = Column(String(25), nullable=False, default="user")  # user / administrator / moderator  - тут хранится общий статус по боту
    status = Column(String(25), nullable=False, default="live")  # live / ban / ...
    agreement_on_mailing = Column(Boolean, nullable=False, default=True)
    head_image_user = Column(String, nullable=False)
    # , default="тут какая-то ссылка на базовую фотку пользака 
    # (но если что, аву чела из тг можно скачивать, грузить в s3 и пихать сюда)"
    color_schema = Column(Integer, nullable=False, default=0)
    date_create_account = Column(DateTime, default=datetime.datetime.now)
    # но мб и datetime.datetime.now(), но вроде правильно так как я написал

    def __init__(
        self, 
        id=None, tg_id=None, name=None, company_id=None, role="user", status="live", agreement_on_mailing=None, head_image_user=None,
        color_schema=None, date_create_account=None
    ):
        self.id = id
        self.tg_id = tg_id
        self.name = name
        self.company_id = company_id
        self.role = role
        self.status = status
        self.agreement_on_mailing = agreement_on_mailing
        self.head_image_user = head_image_user
        self.color_schema = color_schema
        self.date_create_account = date_create_account

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tg_id": self.tg_id,
            "name": self.name,
            "company_id": self.company_id,
            "role": self.role,
            "status": self.status,
            "agreement_on_mailing": self.agreement_on_mailing,
            "head_image_user": self.head_image_user,
            "color_schema": self.color_schema,
            "date_create_account": self.date_create_account
        }


class CompanyEntity(EntityDB):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    image = Column(String, nullable=False)  # default="тут какая-то ссылка на базовую фотку компании"
    description = Column(String, nullable=True)
    owner_tg_id = Column(BigInteger, nullable=False)

    def __init__(
        self, 
        id=None, title=None, image=None, description=None, owner_tg_id=None
    ):
        self.id = id
        self.title = title
        self.image = image
        self.description = description
        self.owner_tg_id = owner_tg_id

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "image": self.image,
            "description": self.description,
            "owner_tg_id": self.owner_tg_id
        }



class UserCompanyEntity(EntityDB):
    __tablename__ = "users_companies"

    id = Column(Integer, primary_key=True, nullable=False)
    tg_id = Column(BigInteger, nullable=False)
    company_id = Column(BigInteger, nullable=True)
    work_group_id = Column(BigInteger, nullable=True)
    role = Column(String(25), nullable=False, default="worker")  # Тут можно хранить тип воркера (разнораб / обычный / прораб)
    
    
    def __init__(
        self, 
        id=None, tg_id=None, company_id=None, work_group_id=None, role=None
    ):
        self.id = id
        self.title = tg_id
        self.image = company_id
        self.description = work_group_id
        self.owner_tg_id = role

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tg_id": self.tg_id,
            "company_id": self.company_id,
            "work_group_id": self.work_group_id,
            "role": self.role
        }


class TasksUserEntity(EntityDB):
    __tablename__ = "tasks_user"

    id = Column(Integer, primary_key=True, nullable=False)
    tg_id = Column(BigInteger, nullable=False)
    task = Column(String, nullable=False)
    owner_tg_id = Column(BigInteger, nullable=False)
    company_id = Column(Integer, nullable=False)
    work_group_id = Column(Integer, nullable=False)
    image = Column(String, nullable=False)  # default="тут какая-то ссылка на базовую фотку таски"
    location = Column(ARRAY[Float, Float], nullable=False)
    type = Column()  # тут не помню как делать ссылку на таблицу
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now, nullable=False)
    updated_at = Column(DateTime, nullable=True)
    done_at = Column(DateTime, nullable=True)

    
    def __init__(
        self, 
        id=None, tg_id=None, task=None, owner_tg_id=None, company_id=None, work_group_id=None,
        image=None, location=None, type=None, description=None, created_at=None, updated_at=None, done_at=None
    ):
        self.id = id
        self.tg_id = tg_id
        self.task = task
        self.owner_tg_id = owner_tg_id
        self.company_id = company_id
        self.work_group_id = work_group_id
        self.image = image
        self.location = location
        self.type = type
        self.description = description
        self.created_at = created_at
        self.updated_at = updated_at
        self.done_at = done_at

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tg_id": self.tg_id,
            "task": self.task,
            "owner_tg_id": self.owner_tg_id,
            "company_id": self.company_id,
            "work_group_id": self.work_group_id,
            "image": self.image,
            "location": self.location,
            "type": self.type,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "done_at": self.done_at
        }


class TypeTaskEntity(EntityDB):
    __tablename__ = "type_tasks"

    id = Column(Integer, primary_key=True, nullable=False)
    type = Column(String, nullable=False)


    def __init__(
        self, 
        id=None, type=None
    ):
        self.id = id
        self.type = type

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type
        }

