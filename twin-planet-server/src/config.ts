/**
 * 配置加载 — 从环境变量读取，提供默认值
 */
// 🔒 配置从环境变量读取，生产环境不提供 fallback 敏感值
function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) {
    throw new Error(`缺少必需的环境变量: ${key}`)
  }
  return val
}

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
  },
}
