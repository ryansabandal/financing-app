from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
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
    result = await db.execute(
        select(func.coalesce(func.sum(AllocationConfig.percentage), 0))
    )
    current_total = float(result.scalar() or 0)
    new_total = current_total + data.percentage
    if new_total > 100:
        raise HTTPException(
            400,
            f"Total allocation would be {new_total:.1f}%. Cannot exceed 100%.",
        )
    allocation = AllocationConfig(category=data.category, percentage=data.percentage)
    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    return allocation


@router.delete("/{allocation_id}")
async def delete_allocation(
    allocation_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AllocationConfig).where(AllocationConfig.id == allocation_id)
    )
    allocation = result.scalar_one_or_none()
    if not allocation:
        raise HTTPException(404, "Allocation not found")
    await db.delete(allocation)
    await db.commit()
    return {"ok": True}
