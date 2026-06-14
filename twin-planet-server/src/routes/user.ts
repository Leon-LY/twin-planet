/**
 * 用户数据管理路由
 * 数据删除（PIPL合规）、导出、账号注销
 */
import { Router, Request, Response } from 'express'
import { query } from '../config/database'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const userRouter = Router()
userRouter.use(authRequired)

// DELETE /api/user/data — 删除用户所有数据（PIPL 合规）
userRouter.delete('/data', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const tables = [
      'records', 'growth_measurements', 'sprout_entries',
      'contribution_entries', 'duty_tasks', 'school_decisions',
      'handover_messages', 'family_invites',
    ]

    for (const table of tables) {
      await query(`DELETE FROM ${table} WHERE user_id = $1`, [userId])
      // 也清理 created_by 引用的数据
      if (table === 'family_invites') {
        await query(`DELETE FROM ${table} WHERE created_by = $1`, [userId])
      }
    }

    // 清理宝宝数据
    await query('DELETE FROM babies WHERE user_id = $1', [userId])

    // 清理家庭（如果是创建者且无其他成员）
    const family = await query(
      `SELECT f.id, (SELECT COUNT(*) FROM users WHERE family_id = f.id) as member_count
       FROM families f WHERE f.created_by = $1`, [userId]
    )
    for (const f of family.rows) {
      if (f.member_count <= 1) {
        await query('DELETE FROM families WHERE id = $1', [f.id])
      }
    }

    // 清理用户自身
    await query('UPDATE users SET family_id = NULL WHERE id = $1', [userId])

    return ok(res, { message: '所有数据已从服务器删除' })
  } catch (err: any) {
    console.error('[User] Data deletion error:', err.message)
    return fail(res, '删除失败', 'DELETE_FAILED', 500)
  }
})

// GET /api/user/export — 导出用户数据（完整副本，PIPL 可携带权）
userRouter.get('/export', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const data: Record<string, any> = {}

    const tables = ['records', 'growth_measurements', 'babies', 'sprout_entries',
      'contribution_entries', 'duty_tasks', 'school_decisions', 'handover_messages']

    for (const table of tables) {
      const result = await query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId])
      data[table] = result.rows
    }

    // 排除敏感字段
    const user = await query(
      'SELECT id, nickname, role, preferred_ui_mode, created_at FROM users WHERE id = $1',
      [userId]
    )
    data.user = user.rows[0] || null

    return ok(res, { exportedAt: new Date().toISOString(), data })
  } catch (err: any) {
    return fail(res, '导出失败', 'EXPORT_FAILED', 500)
  }
})

// DELETE /api/user/account — 注销账号
userRouter.delete('/account', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    // 先删数据
    const tables = [
      'records', 'growth_measurements', 'babies', 'sprout_entries',
      'contribution_entries', 'duty_tasks', 'school_decisions', 'handover_messages',
      'family_invites',
    ]
    for (const table of tables) {
      await query(`DELETE FROM ${table} WHERE user_id = $1 OR created_by = $1`, [userId])
    }
    // 删用户
    await query('DELETE FROM users WHERE id = $1', [userId])

    return ok(res, { message: '账号已注销，所有数据已永久删除' })
  } catch (err: any) {
    return fail(res, '注销失败', 'DELETE_FAILED', 500)
  }
})
