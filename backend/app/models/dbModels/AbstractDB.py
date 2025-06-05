from sqlalchemy import Column, DateTime, Integer, func


class AbstractDBM:
    """Общие поля для всех моделей."""

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=None)
