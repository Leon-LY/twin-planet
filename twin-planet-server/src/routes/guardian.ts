/**
 * 守护系统路由 — GET/PUT /api/guardian/energy
 */
import { Router } from 'express'
import { ok, fail } from '../utils/response'
import { requireAuth } from '../middleware/auth'

export const guardianRoutes = Router()
guardianRoutes.use(requireAuth)

// 当前 MVP 阶段：电量数据暂存 Redis / 前端本地
// 后续 Phase 3 会实现完整的持久化 + 趋势分析

guardianRoutes.get('/energy', async (_req, res) => {
  try {
    // TODO: 从 Redis 或数据库中读取电量历史
    return ok(res, {
      mom: { level: 5, reason: '后端电量系统待接入', updatedAt: Date.now() },
      dad: { level: 5, reason: '后端电量系统待接入', updatedAt: Date.now() },
    })
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

guardianRoutes.put('/energy', async (req, res) => {
  try {
    const { who, level, reason } = req.body
    if (!who || level === undefined) {
      return fail(res, 'MISSING_FIELDS', '缺少必填字段：who, level')
    }
    // TODO: 存入 Redis
    return ok(res, { who, level: Math.max(1, Math.min(10, Math.round(level))), reason: reason || '', updatedAt: Date.now() })
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})
