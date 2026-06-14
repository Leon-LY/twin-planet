import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const growthRouter = Router()
growthRouter.use(authRequired)

// GET /api/growth?babyId=
growthRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { babyId } = req.query
    let sql = `SELECT gm.* FROM growth_measurements gm 
               JOIN babies b ON gm.baby_id = b.id 
               WHERE b.user_id = $1`
    const params: any[] = [req.user!.userId]
    if (babyId) { sql += ' AND gm.baby_id = $2'; params.push(babyId) }
    sql += ' ORDER BY gm.date ASC'
    const result = await query(sql, params)
    return ok(res, result.rows)
  } catch (err: any) {
    return fail(res, '获取生长数据失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/growth
growthRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { babyId, date, ageMonths, weight, height, headCirc, note } = req.body
    if (!babyId || !date) return fail(res, '缺少必要字段：babyId, date')

    const id = 'gm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    const result = await query(
      `INSERT INTO growth_measurements (id, baby_id, date, age_months, weight, height, head_circ, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, babyId, date, ageMonths || 0, weight || 0, height || 0, headCirc || null, note || '']
    )
    return ok(res, result.rows[0])
  } catch (err: any) {
    return fail(res, '保存测量失败', 'CREATE_FAILED', 500)
  }
})
