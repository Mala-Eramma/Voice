from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from .database import Base


class CalculationHistory(Base):

    __tablename__ = "calculation_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    expression = Column(
        String,
        nullable=False
    )

    answer = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )