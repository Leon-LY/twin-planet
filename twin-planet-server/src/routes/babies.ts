import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const babiesRouter = Router()
babiesRouter.use(authRequired)

// GET /api/babies
babiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM babies WHERE user_id = $1 ORDER BY birth_order',
      [req.user!.userId]
    )
    return ok(res, result.rows)
  } catch (err: any) {
    return fail(res, '获取宝宝列表失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/babies
babiesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, nickname, gender, birthDate, birthOrder, color, birthWeight, birthHeight } = req.body
    if (!name || !gender || !birthDate || !birthOrder) {
      return fail(res, '请填写宝宝的必要信息：名字、性别、出生日期、出生顺序')
    }

    const id = 'baby-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    const result = await query(
      `INSERT INTO babies (id, user_id, name, nickname, gender, birth_date, birth_order, color, birth_weight, birth_height)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, req.user!.userId, name, nickname || '', gender, birthDate, birthOrder, color || '#E07B3E', birthWeight || 0, birthHeight || 0]
    )
    return ok(res, result.rows[0], undefined)
  } catch (err: any) {
    return fail(res, '添加宝宝失败', 'CREATE_FAILED', 500)
  }
})

// PUT /api/babies/:id
babiesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, nickname, avatar, isActive } = req.body
    const updates: string[] = []; const values: any[] = []; let idx = 1
    if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name) }
    if (nickname !== undefined) { updates.push(`nickname = $${idx++}`); values.push(nickname) }
    if (avatar !== undefined) { updates.push(`avatar = $${idx++}`); values.push(avatar) }
    if (isActive !== undefined) { updates.push(`is_active = $${idx++}`); values.push(isActive) }
    if (updates.length === 0) return fail(res, '没有要更新的字段')
    values.push(req.params.id, req.user!.userId)

    const result = await query(
      `UPDATE babies SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    )
    if (result.rows.length === 0) return fail(res, '宝宝不存在', 'NOT_FOUND', 404)
    return ok(res, result.rows[0])
  } catch (err: any) {
    return fail(res, '更新失败', 'UPDATE_FAILED', 500)
  }
})
