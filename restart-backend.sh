#!/bin/bash

# 重启后端服务脚本

echo "正在停止后端服务..."
# 查找并停止正在运行的 uvicorn 进程
pkill -f "uvicorn main:app" 2>/dev/null

# 等待进程完全停止
sleep 1

echo "正在启动后端服务..."
cd "$(dirname "$0")/backend"

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "错误: 虚拟环境不存在，请先创建: python -m venv venv"
    exit 1
fi

# 激活虚拟环境并启动
source venv/bin/activate
python main.py

# 如果在 macOS 上使用 .app 终端，可能需要用 exec python
# exec python main.py
