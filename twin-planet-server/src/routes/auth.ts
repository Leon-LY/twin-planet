/**
 * 认证路由 — POST /api/auth/wechat-login
 */
import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { config } from '../config'
import { code2Session } from '../utils/wechat'
import { signToken } from '../utils/jwt'
import { ok, fail } from '../utils/response'

export const authRoutes = Router()

authRoutes.post('/wechat-login', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return fail(res, 'MISSING_CODE', '缺少微信登录 code')

    // 开发环境跳过微信验证
    if (code === 'dev-mock-code' && !config.wechat.secret) {
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
