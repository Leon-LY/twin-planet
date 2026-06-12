/**
 * JWT 认证中间件
 */
import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt'
import { fail } from '../utils/response'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/** 必须登录 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'UNAUTHORIZED', '请先登录', 401)
  }

  try {
    const token = header.slice(7)
    req.user = verifyToken(token)
    next()
  } catch {
    return fail(res, 'TOKEN_EXPIRED', '登录已过期，请重新登录', 401)
  }
}

/** 可选登录（不强制，但如果有 token 就解析） */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice(7))
    } catch { /* token 无效也继续，但不注入 user */ }
  }
  next()
}
