"""
数据库连接和模型定义
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.hybrid import hybrid_property
from typing import Generator
import config

# 创建数据库引擎
engine = create_engine(
    f"sqlite:///{config.DATABASE_PATH}",
    connect_args={"check_same_thread": False}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类
Base = declarative_base()

# 数据库模型
class Grade(Base):
    """年级表模型"""
    __tablename__ = "grade"

    id = Column(String(50), primary_key=True)
    name = Column(String(100))
    cover = Column(Text)
    mark_note = Column(Text)


class Unit(Base):
    """单元表模型"""
    __tablename__ = "unit"

    grade = Column(String(50), primary_key=True)
    unit = Column(Integer, primary_key=True)
    name = Column(String(500))

    # 关联单词列表
    words = relationship(
        "Word",
        primaryjoin="and_(Unit.grade == Word.grade, Unit.unit == Word.unit)",
        foreign_keys="[Word.grade, Word.unit]",
        lazy="dynamic",
        viewonly=True
    )

    @hybrid_property
    def word_count(self):
        """计算该单元的单词数量"""
        return self.words.count()


class Word(Base):
    """单词表模型"""
    __tablename__ = "word"

    id = Column(Integer, primary_key=True, autoincrement=True)
    word = Column(String(500))
    grade = Column(String(500), index=True)
    unit = Column(Integer, index=True)
    phonetic = Column(String(500))
    chinese_definition = Column(String(500))
    mark = Column(String(500))
    page = Column(Integer, nullable=True)


# 获取数据库会话
def get_db() -> Generator[Session, None, None]:
    """依赖注入：获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
