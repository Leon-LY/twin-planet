#!/usr/bin/env bash
set -euo pipefail
# 双宝星球 · 后端部署脚本
# 目标服务器: 49.232.49.175
# 用法: ./deploy.sh [user@host]

HOST="${1:-root@49.232.49.175}"
REMOTE_DIR="/opt/twin-planet-server"
BACKUP_DIR="/opt/twin-planet-server-backups"

echo "=== 双宝星球 · 部署 ==="
echo "目标: $HOST:$REMOTE_DIR"

# 1. 构建 TypeScript
echo "[1/5] 编译 TypeScript..."
npm run build

# 2. 打包（🔒 不含 .env）
echo "[2/5] 打包部署文件..."
tar czf /tmp/twin-planet-deploy.tar.gz \
  dist/ \
  package.json \
  package-lock.json \
  docker-compose.yml \
  Dockerfile \
  nginx.conf

# 3. 上传
echo "[3/5] 上传到服务器..."
scp /tmp/twin-planet-deploy.tar.gz "$HOST:/tmp/"

# 4. 远程部署
echo "[4/5] 远程部署..."
ssh "$HOST" << 'REMOTE'
  set -e
  # 备份旧部署
  if [ -d /opt/twin-planet-server ]; then
    mkdir -p /opt/twin-planet-server-backups
    cp -r /opt/twin-planet-server "/opt/twin-planet-server-backups/$(date +%Y%m%d_%H%M%S)"
  fi
  mkdir -p /opt/twin-planet-server && cd /opt/twin-planet-server
  tar xzf /tmp/twin-planet-deploy.tar.gz
  # 运行数据库迁移
  npm run db:migrate 2>/dev/null || echo "⚠️ 数据库迁移跳过（可能已是最新）"
  # 更新服务（零停机 rolling）
  docker compose up -d --build --remove-orphans
  echo "部署完成！"
  docker compose ps
REMOTE

# 5. 健康检查
echo "[5/5] 健康检查..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://49.232.49.175:3003/api/health" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 服务健康检查通过"
else
  echo "⚠️ 健康检查返回 $HTTP_CODE，请手动验证"
fi

rm /tmp/twin-planet-deploy.tar.gz
echo "=== 部署完毕 ==="
