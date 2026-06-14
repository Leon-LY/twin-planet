/**
 * 家庭管理路由
 * 伴侣邀请、家庭关联、成员管理
 */
import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const familyRouter = Router()
familyRouter.use(authRequired)

/** 生成家庭成员统计数据 */
async function getFamilyStats(familyId: string) {
  const members = await query(
    'SELECT id, nickname, role, avatar FROM users WHERE family_id = $1',
    [familyId]
  )
  // 获取家庭成员的宝宝（通过 user_id IN 家庭成员）
  const memberIds = members.rows.map((m: any) => m.id)
  const babies = memberIds.length > 0
    ? await query(
        'SELECT id, name, nickname, gender, birth_date FROM babies WHERE user_id = ANY($1) ORDER BY birth_date',
        [memberIds]
      )
    : { rows: [] }
  return {
    memberCount: members.rows.length,
    members: members.rows,
    babyCount: babies.rows.length,
    babies: babies.rows,
  }
}

// POST /api/family/create — 创建家庭
familyRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const { name } = req.body

    // 检查用户是否已有家庭
    const existing = await query('SELECT family_id FROM users WHERE id = $1', [userId])
    if (existing.rows[0]?.family_id) {
      return fail(res, '你已经在家庭中了', 'ALREADY_IN_FAMILY')
    }

    const familyId = 'fam-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
    await query(
      'INSERT INTO families (id, name, created_by) VALUES ($1, $2, $3)',
      [familyId, name || '我们的家', userId]
    )
    await query('UPDATE users SET family_id = $1 WHERE id = $2', [familyId, userId])

    const stats = await getFamilyStats(familyId)
    return ok(res, { familyId, ...stats, message: "家庭创建成功" })
  } catch (err: any) {
    console.error('[Family] Create error:', err.message)
    return fail(res, '创建家庭失败', 'CREATE_FAILED', 500)
  }
})

// POST /api/family/invite — 生成邀请令牌
familyRouter.post('/invite', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId

    // 获取用户家庭
    const user = await query('SELECT family_id, nickname FROM users WHERE id = $1', [userId])
    if (!user.rows[0]?.family_id) {
      return fail(res, '请先创建家庭', 'NO_FAMILY')
    }

    const familyId = user.rows[0].family_id
    const token = 'inv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10)

    // 邀请24小时有效
    await query(
      `INSERT INTO family_invites (token, family_id, created_by, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
      [token, familyId, userId]
    )

    return ok(res, {
      token,
      inviterName: user.rows[0].nickname || '家人',
      expiresIn: '24小时',
      // 小程序的分享路径
      sharePath: `/pages/index/index?invite=${token}`,
    })
  } catch (err: any) {
    console.error('[Family] Invite error:', err.message)
    return fail(res, '生成邀请失败', 'INVITE_FAILED', 500)
  }
})

// POST /api/family/join — 接受邀请
familyRouter.post('/join', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const { token } = req.body

    if (!token) return fail(res, '缺少邀请令牌', 'MISSING_TOKEN')

    // 验证令牌
    const invite = await query(
      `SELECT * FROM family_invites
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    )
    if (invite.rows.length === 0) {
      return fail(res, '邀请已过期或不存在', 'INVALID_TOKEN')
    }

    // 检查是否已有家庭
    const existing = await query('SELECT family_id FROM users WHERE id = $1', [userId])
    if (existing.rows[0]?.family_id) {
      return fail(res, '你已经在家庭中了，请先退出', 'ALREADY_IN_FAMILY')
    }

    const familyId = invite.rows[0].family_id

    // 加入家庭
    await query('UPDATE users SET family_id = $1 WHERE id = $2', [familyId, userId])
    // 标记令牌已使用
    await query('UPDATE family_invites SET used = true, used_by = $1, used_at = NOW() WHERE token = $2',
      [userId, token])

    const stats = await getFamilyStats(familyId)
    return ok(res, { familyId, ...stats, message: "成功加入家庭！" })
  } catch (err: any) {
    console.error('[Family] Join error:', err.message)
    return fail(res, '加入家庭失败', 'JOIN_FAILED', 500)
  }
})

// GET /api/family — 获取当前家庭信息
familyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const user = await query('SELECT family_id FROM users WHERE id = $1', [userId])
    if (!user.rows[0]?.family_id) {
      return ok(res, { hasFamily: false })
    }
    const stats = await getFamilyStats(user.rows[0].family_id)
    return ok(res, { hasFamily: true, familyId: user.rows[0].family_id, ...stats })
  } catch (err: any) {
    return fail(res, '获取家庭信息失败', 'FETCH_FAILED', 500)
  }
})

// POST /api/family/leave — 离开家庭
familyRouter.post('/leave', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    await query('UPDATE users SET family_id = NULL WHERE id = $1', [userId])
    return ok(res, { message: "已离开家庭" })
  } catch (err: any) {
    return fail(res, '操作失败', 'LEAVE_FAILED', 500)
  }
})
