from sqlalchemy import Column, DateTime, Integer, MetaData, func
from sqlalchemy.orm import as_declarative, declared_attr

metadata = MetaData()


@as_declarative(metadata=metadata)
class EntityDB:
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=None)
    metadata = None

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
