/**
 * 语音交接路由
 * 语音便签的同步、上传、下载
 */
import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const handoverRouter = Router()
handoverRouter.use(authRequired)

// POST /api/handover — 上传语音消息
handoverRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { babyId, audioUrl, durationSec, text } = req.body
    if (!audioUrl && !text) {
      return fail(res, '请提供语音或文字内容')
    }

    const id = 'voice-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    await query(
      `INSERT INTO handover_messages (id, user_id, baby_id, audio_url, duration_sec, text)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.user!.userId, babyId || null, audioUrl || null, durationSec || 0, text || null]
    )
    return ok(res, { id, message: "已保存" })
  } catch (err: any) {
    console.error('[Handover] Upload error:', err.message)
    return fail(res, '保存失败', 'UPLOAD_FAILED', 500)
  }
})

// GET /api/handover — 获取交接记录
handoverRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { babyId, limit = '20' } = req.query
    let sql = `
      SELECT hm.*, u.nickname as author_name
      FROM handover_messages hm
      LEFT JOIN users u ON u.id = hm.user_id
      WHERE hm.user_id = $1
    `
    const params: any[] = [req.user!.userId]
    let idx = 2
    if (babyId) {
      sql += ` AND hm.baby_id = $${idx++}`
      params.push(babyId)
    }
    sql += ` ORDER BY hm.created_at DESC LIMIT $${idx}`
    params.push(parseInt(limit as string))

    const result = await query(sql, params)
    return ok(res, result.rows)
  } catch (err: any) {
    return fail(res, '获取失败', 'FETCH_FAILED', 500)
  }
})

// GET /api/handover/since?timestamp= — 拉取新消息（换手机恢复）
handoverRouter.get('/since', async (req: Request, res: Response) => {
  try {
    const since = req.query.timestamp
      ? new Date(parseInt(req.query.timestamp as string))
      : new Date(0)
    const result = await query(
      `SELECT hm.*, u.nickname as author_name
       FROM handover_messages hm
       LEFT JOIN users u ON u.id = hm.user_id
       WHERE hm.user_id = $1 AND hm.created_at > $2
       ORDER BY hm.created_at ASC LIMIT 100`,
      [req.user!.userId, since]
    )
    return ok(res, result.rows)
  } catch (err: any) {
    return fail(res, '获取失败', 'FETCH_FAILED', 500)
  }
})

// DELETE /api/handover/:id — 删除单条消息
handoverRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await query(
      'DELETE FROM handover_messages WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    )
    return ok(res, { message: "已删除" })
  } catch (err: any) {
    return fail(res, '删除失败', 'DELETE_FAILED', 500)
  }
})
