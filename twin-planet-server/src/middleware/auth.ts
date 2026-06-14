import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
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

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return fail(res, '未登录，请先授权', 'UNAUTHORIZED', 401)
  }
  try {
    const token = header.slice(7)
    const secret = process.env.JWT_SECRET || 'dev-secret'
    req.user = jwt.verify(token, secret) as JwtPayload
    next()
  } catch {
    return fail(res, '登录已过期，请重新登录', 'TOKEN_EXPIRED', 401)
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret'
      req.user = jwt.verify(header.slice(7), secret) as JwtPayload
    } catch { /* ignore invalid token */ }
  }
  next()
}
