"""
单词学习应用 - FastAPI 后端服务
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# 创建 FastAPI 应用实例
app = FastAPI(
    title="单词学习应用 API",
    description="提供年级、单元、单词等数据接口",
    version="1.0.0"
)

# 配置 CORS 跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入路由
from routers import grades, units, words, audio

# 注册路由
app.include_router(grades.router, prefix="/api", tags=["年级"])
app.include_router(units.router, prefix="/api", tags=["单元"])
app.include_router(words.router, prefix="/api", tags=["单词"])
app.include_router(audio.router, prefix="/api", tags=["音频"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
