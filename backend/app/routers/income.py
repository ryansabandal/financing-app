from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models import IncomeEntry

router = APIRouter()


class IncomeCreate(BaseModel):
    amount: float
    date: date


class IncomeResponse(BaseModel):
    id: int
    amount: float
    date: date

    class Config:
        from_attributes = True


@router.get("", response_model=list[IncomeResponse])
async def list_income(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IncomeEntry).order_by(IncomeEntry.date.desc()))
    return result.scalars().all()


@router.post("", response_model=IncomeResponse)
async def create_income(
    data: IncomeCreate,
    db: AsyncSession = Depends(get_db),
):
    entry = IncomeEntry(amount=data.amount, date=data.date)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry
