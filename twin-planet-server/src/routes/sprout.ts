/**
 * 萌芽日记 API — 双胞胎互动记录
 */
import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const sproutRouter = Router()
sproutRouter.use(authRequired)

// GET /api/sprout
sproutRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '30' } = req.query
    const result = await query(
      `SELECT * FROM sprout_entries WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
      [req.user!.userId, parseInt(limit as string)]
    )
    return ok(res, result.rows)
  } catch (err: any) {
    return fail(res, '获取失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/sprout
sproutRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { twinGroupId, type, babyAName, babyBName, note } = req.body
    if (!twinGroupId || !type) return fail(res, '缺少必要字段')

    const id = 'sprout-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    await query(
      `INSERT INTO sprout_entries (id, twin_group_id, user_id, type, baby_a_name, baby_b_name, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, twinGroupId, req.user!.userId, type, babyAName || '', babyBName || '', note || '']
    )
    return ok(res, { id, message: '已保存' })
  } catch (err: any) {
    return fail(res, '保存失败', 'CREATE_FAILED', 500)
  }
})
