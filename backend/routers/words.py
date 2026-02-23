"""
单词相关 API 路由
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db, Word
from pydantic import BaseModel
from typing import Optional
import random

router = APIRouter()


class WordResponse(BaseModel):
    """单词响应模型"""
    id: int
    word: str
    grade: str
    unit: int
    phonetic: str | None = None
    chinese_definition: str | None = None
    mark: str | None = None
    page: int | None = None

    class Config:
        from_attributes = True


@router.get("/words", response_model=list[WordResponse])
async def get_words(
    grade: str = Query(..., description="年级 ID"),
    unit: int | None = Query(None, description="单元编号，不传则返回年级所有单词"),
    db: Session = Depends(get_db)
):
    """
    获取单词列表
    按单元、页码、id 排序
    """
    query = db.query(Word).filter(Word.grade == grade)

    if unit is not None:
        query = query.filter(Word.unit == unit)

    # 按单元、页码、id 排序
    words = query.order_by(Word.unit, Word.page, Word.id).all()
    return words


@router.get("/words/random", response_model=list[WordResponse])
async def get_random_words(
    grade: str = Query(..., description="年级 ID"),
    units: str = Query(..., description="单元编号列表，逗号分隔，如 '1,2,3'"),
    count: int = Query(999, description="随机获取数量"),
    db: Session = Depends(get_db)
):
    """
    随机获取单词
    """
    unit_list = [int(u.strip()) for u in units.split(",")]

    # 获取指定单元的单词
    words = db.query(Word).filter(
        Word.grade == grade,
        Word.unit.in_(unit_list)
    ).all()

    # 随机抽取
    if len(words) > count:
        words = random.sample(words, count)

    # 打乱顺序
    random.shuffle(words)
    return words


@router.get("/words/{word_id}", response_model=WordResponse)
async def get_word(word_id: int, db: Session = Depends(get_db)):
    """获取单个单词详情"""
    word = db.query(Word).filter(Word.id == word_id).first()
    return word
