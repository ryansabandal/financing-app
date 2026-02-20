from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, Enum
from sqlalchemy.sql import func

from app.database import Base


class AllocationConfig(Base):
    __tablename__ = "allocation_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50), nullable=False, unique=True)
    percentage = Column(Numeric(5, 2), nullable=False)


class IncomeEntry(Base):
    __tablename__ = "income_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False)
    category = Column(String(50), nullable=False)
    type = Column(String(20), nullable=False)  # income | expense
    description = Column(String(255), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
