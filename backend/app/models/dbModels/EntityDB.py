from sqlalchemy import Column, DateTime, Integer, MetaData, func
from sqlalchemy.orm import as_declarative, declared_attr

# Создаём объект metadata
metadata = MetaData()


@as_declarative(metadata=metadata)
class EntityDB:
    """
    Базовая модель для всех ORM-моделей.
    """

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=None)
    metadata = None

    @declared_attr
    def __tablename__(cls) -> str:
        """
        Автоматически задаёт имя таблицы, если не указано явно.
        """
        return cls.__name__.lower()
