import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { fail } from '../utils/response'

export interface JwtPayload {
  userId: string
  openid: string
  role: string
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// 🔒 统一 JWT secret 来源
function getJwtSecret(): string {
  return config.jwtSecret || process.env.JWT_SECRET || ''
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return fail(res, '未登录，请先授权', 'UNAUTHORIZED', 401)
  }
  try {
    const token = header.slice(7)
    const secret = getJwtSecret()
    if (!secret) {
      console.error('JWT_SECRET 未配置，无法验证 token')
      return fail(res, '服务器配置错误', 'SERVER_ERROR', 500)
    }
    req.user = jwt.verify(token, secret) as JwtPayload
    next()
  } catch (err: any) {
    const msg = err.name === 'TokenExpiredError' ? '登录已过期，请重新登录' : '登录已过期，请重新登录'
    return fail(res, msg, 'TOKEN_EXPIRED', 401)
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const secret = getJwtSecret()
      if (secret) {
        req.user = jwt.verify(header.slice(7), secret) as JwtPayload
      }
    } catch { /* ignore invalid token */ }
  }
  next()
}
