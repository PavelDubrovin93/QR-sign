import datetime

from app.models.dbModels.EntityDB import EntityDB
from sqlalchemy import Column, String, UUID, BigInteger, Integer, Boolean, DateTime


class UserEntity(EntityDB):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, nullable=False)
    tg_id = Column(BigInteger, nullable=False)
    name = Column(String(64), nullable=True)
    status = Column(String(25), nullable=False, default="live")  # live / ban / ...
    agreement_on_mailing = Column(Boolean, nullable=False, default=True)
    head_image_user = Column(String, nullable=False)
    # , default="тут какая-то ссылка на фотку базового пользака 
    # (но если что, аву чела из тг можно скачивать, грузить в s3 и пихать сюда)"
    color_schema = Column(Integer, nullable=False, default=0)
    date_create_account = Column(DateTime, default=datetime.datetime.now)
    # но мб и datetime.datetime.now(), но вроде правильно так как я написал

    def __init__(
        self, 
        id=None, tg_id=None, name=None, company_id=None, status="live", agreement_on_mailing=None, head_image_user=None,
        color_schema=None, date_create_account=None
    ):
        self.id = id
        self.tg_id = tg_id
        self.name = name
        self.company_id = company_id
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
            "status": self.status,
            "agreement_on_mailing": self.agreement_on_mailing,
            "head_image_user": self.head_image_user,
            "color_schema": self.color_schema,
            "date_create_account": self.date_create_account
        }


class CompanyEntity(EntityDB):
    __tablename__ = "companies"

    



class UserCompanyEntity(EntityDB):
    __tablename__ = "user_company"
    
    # company_id = Column(BigInteger, nullable=True)
    # role = Column(String(25), nullable=False, default="user")  # user / administrator / moderator
    # work_group_id = Column(BigInteger, nullable=True)

    ...
