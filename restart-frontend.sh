#!/bin/bash

# 重启前端服务脚本

echo "正在停止前端服务..."
# 查找并停止正在运行的 vite 进程
pkill -f "vite" 2>/dev/null

# 等待进程完全停止
sleep 1

echo "正在启动前端服务..."
cd "$(dirname "$0")/frontend"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "错误: node_modules 不存在，请先运行: npm install"
    exit 1
fi

# 启动前端开发服务器
npm run dev
