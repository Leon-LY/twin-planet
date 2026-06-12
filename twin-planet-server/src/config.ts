/**
 * 配置加载 — 从环境变量读取，提供默认值
 */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://twin_planet_user:tp_dev_2026@localhost:5432/twin_planet',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379/2',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: '24h',
  wechat: {
    appid: process.env.WECHAT_APPID || 'wxee2ef767a77058db',
    secret: process.env.WECHAT_SECRET || '',
  },
}
