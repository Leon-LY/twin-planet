/**
 * 认证路由 — POST /api/auth/wechat-login
 */
import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { config } from '../config'
import { requireAuth } from '../middleware/auth'
import { code2Session } from '../utils/wechat'
import { signToken } from '../utils/jwt'
import { ok, fail } from '../utils/response'

export const authRoutes = Router()

authRoutes.post('/wechat-login', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return fail(res, 'MISSING_CODE', '缺少微信登录 code')

    // 开发环境跳过微信验证（无真实 secret 或使用 mock code）
    const isMockSecret = !config.wechat.secret || config.wechat.secret.startsWith('your-');
    if (code === 'dev-mock-code' && isMockSecret) {
      const profile = await db.query.users.findFirst({
        where: eq(schema.users.openid, 'dev-mock-openid'),
      })
      if (profile) {
        const token = signToken({ userId: profile.id, openid: profile.openid })
        return ok(res, { token, profile })
      }
      // 创建开发用户
      const [user] = await db.insert(schema.users).values({
        openid: 'dev-mock-openid',
        nickname: 'Leon',
        role: 'dad',
      }).returning()
      const token = signToken({ userId: user.id, openid: user.openid })
      return ok(res, { token, profile: user })
    }

    // 正式流程：code → openid
    const { openid } = await code2Session(code)

    // 查找或创建用户
    let user = await db.query.users.findFirst({
      where: eq(schema.users.openid, openid),
    })

    if (!user) {
      const [newUser] = await db.insert(schema.users).values({
        openid,
        nickname: '新用户',
        role: 'mom',
      }).returning()
      user = newUser
    }

    const token = signToken({ userId: user.id, openid: user.openid })
    return ok(res, { token, profile: user })
  } catch (err: any) {
    console.error('[auth] wechat-login error:', err.message)
    return fail(res, 'LOGIN_FAILED', err.message || '登录失败，请重试', 500)
  }
})

// PUT /api/auth/profile — 更新个人资料
authRoutes.put('/profile', requireAuth, async (req, res) => {
  try {
    const { nickname, role, preferredUiMode, uiConfig } = req.body
    const updateData: Record<string, any> = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (role !== undefined) updateData.role = role
    if (preferredUiMode !== undefined) updateData.preferredUiMode = preferredUiMode
    if (uiConfig !== undefined) updateData.uiConfig = uiConfig
    if (Object.keys(updateData).length === 0) {
      return fail(res, 'NO_FIELDS', '没有要更新的字段')
    }
    const [updated] = await db.update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, req.user!.userId))
      .returning()
    return ok(res, updated)
  } catch (err: any) {
    return fail(res, 'UPDATE_FAILED', err.message, 500)
  }
})
