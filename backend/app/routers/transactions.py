from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models import Transaction

router = APIRouter()


class TransactionCreate(BaseModel):
    amount: float
    date: date
    category: str
    type: str
    description: str = ""


class TransactionResponse(BaseModel):
    id: int
    amount: float
    date: date
    category: str
    type: str
    description: str

    class Config:
        from_attributes = True


@router.get("", response_model=list[TransactionResponse])
async def list_transactions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Transaction).order_by(Transaction.date.desc()))
    return result.scalars().all()


@router.post("", response_model=TransactionResponse)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    tx = Transaction(
        amount=data.amount,
        date=data.date,
        category=data.category,
        type=data.type,
        description=data.description,
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx
