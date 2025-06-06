from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.dbModels.EntityDB import EntityDB


class WorkGroup(EntityDB):
    __tablename__ = "work_groups"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Связь с компанией
    company = relationship("Company", back_populates="work_groups")
