/**
 * 今天我做了什么 API — 家人贡献日志
 */
import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const contributionRouter = Router()
contributionRouter.use(authRequired)

// GET /api/contribution
contributionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '30' } = req.query
    const result = await query(
      `SELECT ce.*, u.nickname as user_name FROM contribution_entries ce
       LEFT JOIN users u ON u.id = ce.user_id
       WHERE ce.user_id = $1 ORDER BY ce.recorded_at DESC LIMIT $2`,
      [req.user!.userId, parseInt(limit as string)]
    )
    return ok(res, result.rows)
  } catch (err: any) {
    return fail(res, '获取失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/contribution
contributionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { category, note } = req.body
    if (!category) return fail(res, '缺少必要字段：category')

    const id = 'contrib-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    await query(
      `INSERT INTO contribution_entries (id, user_id, category, note)
       VALUES ($1, $2, $3, $4)`,
      [id, req.user!.userId, category, note || '']
    )
    return ok(res, { id, message: '已保存' })
  } catch (err: any) {
    return fail(res, '保存失败', 'CREATE_FAILED', 500)
  }
})
