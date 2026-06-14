import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const recordsRouter = Router()
recordsRouter.use(authRequired)

// GET /api/records?babyId=&limit=30
recordsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { babyId, limit = '30', offset = '0' } = req.query
    let sql = 'SELECT * FROM records WHERE user_id = $1'
    const params: any[] = [req.user!.userId]
    let idx = 2
    if (babyId) { sql += ` AND baby_id = $${idx++}`; params.push(babyId) }
    sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`
    params.push(parseInt(limit as string), parseInt(offset as string))
    const result = await query(sql, params)
    return ok(res, result.rows, { total: result.rows.length })
  } catch (err: any) {
    return fail(res, '获取记录失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/records
recordsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { babyId, type, startedAt, endedAt, durationMin, detail, feedingSide, amountMl, sleepQuality, diaperType } = req.body
    if (!babyId || !type) return fail(res, '缺少必要字段：babyId, type')

    // 🔒 验证 baby 归属当前用户
    const ownerCheck = await query(
      'SELECT id FROM babies WHERE id = $1 AND user_id = $2',
      [babyId, req.user!.userId]
    )
    if (ownerCheck.rows.length === 0) {
      return fail(res, '无权操作此宝宝的数据', 'FORBIDDEN', 403)
    }

    const id = 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    const result = await query(
      `INSERT INTO records (id, baby_id, user_id, type, started_at, ended_at, duration_min, detail, feeding_side, amount_ml, sleep_quality, diaper_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, babyId, req.user!.userId, type,
       startedAt ? new Date(startedAt) : new Date(),
       endedAt ? new Date(endedAt) : null,
       durationMin || 0, detail || '',
       feedingSide || null, amountMl || null, sleepQuality || null, diaperType || null]
    )
    return ok(res, result.rows[0])
  } catch (err: any) {
    return fail(res, '保存记录失败', 'CREATE_FAILED', 500)
  }
})

// GET /api/records/since?timestamp= — 拉取服务端新记录
recordsRouter.get('/since', async (req: Request, res: Response) => {
  try {
    const since = req.query.timestamp ? new Date(parseInt(req.query.timestamp as string)) : new Date(0)
    const result = await query(
      'SELECT * FROM records WHERE user_id = $1 AND created_at > $2 ORDER BY created_at ASC LIMIT 500',
      [req.user!.userId, since]
    )
    return ok(res, result.rows, { total: result.rows.length })
  } catch (err: any) {
    return fail(res, '获取记录失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/records/batch — 批量同步本地记录到服务器
recordsRouter.post('/batch', async (req: Request, res: Response) => {
  try {
    const { records } = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return fail(res, '请提供要同步的记录数组')
    }
    // 🔒 限制每批最多 200 条
    if (records.length > 200) {
      return fail(res, '每批最多同步 200 条记录')
    }

    // 🔒 验证所有 baby 归属当前用户
    const babyIds = [...new Set(records.map((r: any) => r.babyId))]
    const ownerCheck = await query(
      'SELECT id FROM babies WHERE id = ANY($1) AND user_id = $2',
      [babyIds, req.user!.userId]
    )
    const validBabyIds = new Set(ownerCheck.rows.map((r: any) => r.id))
    const validRecords = records.filter((r: any) => validBabyIds.has(r.babyId))
    if (validRecords.length === 0) {
      return fail(res, '没有有效的宝宝记录', 'FORBIDDEN', 403)
    }

    // 🔧 批量 INSERT（单条SQL多行），性能远优于逐条循环
    let synced = 0
    const skipped = records.length - validRecords.length
    if (validRecords.length > 0) {
      const values: string[] = []
      const params: any[] = []
      let idx = 1
      for (const r of validRecords) {
        values.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6},$${idx+7},$${idx+8},$${idx+9},$${idx+10},$${idx+11},$${idx+12})`)
        params.push(
          r.id, r.babyId, req.user!.userId, r.type,
          r.startedAt ? new Date(r.startedAt) : new Date(),
          r.endedAt ? new Date(r.endedAt) : null,
          r.durationMin || 0, r.detail || '',
          r.feedingSide || null, r.amountMl || null, r.sleepQuality || null, r.diaperType || null,
          r.createdAt ? new Date(r.createdAt) : new Date()
        )
        idx += 13
      }
      const result = await query(
        `INSERT INTO records (id, baby_id, user_id, type, started_at, ended_at, duration_min, detail, feeding_side, amount_ml, sleep_quality, diaper_type, created_at)
         VALUES ${values.join(',')}
         ON CONFLICT (id) DO NOTHING`,
        params
      )
      synced = result.rowCount ?? validRecords.length
    }
    return ok(res, { synced, skipped })
  } catch (err: any) {
    return fail(res, '批量同步失败', 'BATCH_FAILED', 500)
  }
})
