#!/bin/bash
# 双宝手帐 · 后端部署脚本
# 目标服务器: 49.232.49.175
# 用法: ./deploy.sh [user@host]

HOST="${1:-root@49.232.49.175}"
REMOTE_DIR="/opt/twin-planet-server"

echo "=== 双宝手帐 · 部署 ==="
echo "目标: $HOST:$REMOTE_DIR"

# 1. 构建 TypeScript
echo "[1/4] 编译 TypeScript..."
npm run build

# 2. 打包
echo "[2/4] 打包部署文件..."
tar czf /tmp/twin-planet-deploy.tar.gz \
  dist/ \
  package.json \
  package-lock.json \
  docker-compose.yml \
  Dockerfile \
  nginx.conf \
  .env 2>/dev/null

# 3. 上传
echo "[3/4] 上传到服务器..."
scp /tmp/twin-planet-deploy.tar.gz "$HOST:/tmp/"

# 4. 远程部署
echo "[4/4] 远程部署..."
ssh "$HOST" << 'REMOTE'
  cd /opt/twin-planet-server 2>/dev/null || mkdir -p /opt/twin-planet-server && cd /opt/twin-planet-server
  tar xzf /tmp/twin-planet-deploy.tar.gz
  docker compose down 2>/dev/null
  docker compose up -d --build
  echo "部署完成！"
  docker compose ps
REMOTE

rm /tmp/twin-planet-deploy.tar.gz
echo "=== 部署完毕 ==="
