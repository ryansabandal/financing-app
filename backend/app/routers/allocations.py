from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.models import AllocationConfig

router = APIRouter()


class AllocationCreate(BaseModel):
    category: str
    percentage: float


class AllocationResponse(BaseModel):
    id: int
    category: str
    percentage: float

    class Config:
        from_attributes = True


@router.get("", response_model=list[AllocationResponse])
async def list_allocations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AllocationConfig))
    return result.scalars().all()


@router.post("", response_model=AllocationResponse)
async def create_allocation(
    data: AllocationCreate,
    db: AsyncSession = Depends(get_db),
):
    allocation = AllocationConfig(category=data.category, percentage=data.percentage)
    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    return allocation
