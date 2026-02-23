"""
单元相关 API 路由
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db, Unit
from pydantic import BaseModel

router = APIRouter()


class UnitResponse(BaseModel):
    """单元响应模型"""
    grade: str
    unit: int
    name: str
    word_count: int

    class Config:
        from_attributes = True


@router.get("/units", response_model=list[UnitResponse])
async def get_units(
    grade: str = Query(..., description="年级 ID，如 3A, 3B, 4A"),
    db: Session = Depends(get_db)
):
    """
    获取指定年级的单元列表
    按单元编号升序排序
    """
    units = db.query(Unit).filter(Unit.grade == grade).order_by(Unit.unit).all()
    return units
