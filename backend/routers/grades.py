"""
年级相关 API 路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Grade
from pydantic import BaseModel

router = APIRouter()


class GradeResponse(BaseModel):
    """年级响应模型"""
    id: str
    name: str | None = None
    cover: str | None = None
    mark_note: str | None = None

    class Config:
        from_attributes = True


@router.get("/grades", response_model=list[GradeResponse])
async def get_grades(db: Session = Depends(get_db)):
    """
    获取所有年级列表
    按年级 id 升序排序
    """
    grades = db.query(Grade).order_by(Grade.id).all()
    return grades
