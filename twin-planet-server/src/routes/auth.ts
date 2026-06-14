import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { query } from '../config/database'
import { config } from '../config'
import { ok, fail } from '../utils/response'
import { authRequired } from '../middleware/auth'

export const authRouter = Router()

// POST /api/auth/wechat-login
authRouter.post('/wechat-login', async (req: Request, res: Response) => {
  try {
    const { code } = req.body
    if (!code) return fail(res, '缺少登录凭证', 'MISSING_CODE')

    // TODO: 生产环境调用 wx.code2Session 换取 openid
    // const wxRes = await fetch(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`)
    // const wxData = await wxRes.json()

    // 开发阶段：使用 mock openid
    const openid = code === 'dev' ? 'dev-openid-' + Date.now() : 'wx-' + code

    // 查找或创建用户
    let result = await query('SELECT * FROM users WHERE openid = $1', [openid])

    let user
    if (result.rows.length === 0) {
      // 新用户
      const id = 'u-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
      result = await query(
        `INSERT INTO users (id, openid, role, preferred_ui_mode) 
         VALUES ($1, $2, 'mom', 'normal') RETURNING *`,
        [id, openid]
      )
      user = result.rows[0]
    } else {
      user = result.rows[0]
    }

    // 生成 JWT — 使用 config 统一管理的密钥，无硬编码 fallback
    const secret = config.jwtSecret || process.env.JWT_SECRET
    if (!secret) {
      console.error('[Auth] JWT_SECRET not configured!')
      return fail(res, '服务器配置错误', 'CONFIG_ERROR', 500)
    }
    const token = jwt.sign(
      { userId: user.id, openid: user.openid, role: user.role },
      secret,
      { expiresIn: "30d" }
    )

    const profile = {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      phone: user.phone || '',
      role: user.role,
      preferredUiMode: user.preferred_ui_mode,
      uiConfig: user.ui_config || { fontSize: 14, showTTS: false, simplifiedHome: false, autoNightMode: true },
      createdAt: user.created_at,
    }

    return ok(res, { token, profile })
  } catch (err: any) {
    console.error('[Auth] Login error:', err.message)
    return fail(res, '登录失败，请重试', 'LOGIN_FAILED', 500)
  }
})

// PUT /api/auth/profile
authRouter.put('/profile', authRequired, async (req: Request, res: Response) => {
  try {
    const { nickname, role, preferredUiMode, uiConfig } = req.body
    const userId = req.user!.userId

    const updates: string[] = []
    const values: any[] = []
    let idx = 1

    if (nickname !== undefined) { updates.push(`nickname = $${idx++}`); values.push(nickname) }
    if (role !== undefined) { updates.push(`role = $${idx++}`); values.push(role) }
    if (preferredUiMode !== undefined) { updates.push(`preferred_ui_mode = $${idx++}`); values.push(preferredUiMode) }
    if (uiConfig !== undefined) { updates.push(`ui_config = $${idx++}`); values.push(JSON.stringify(uiConfig)) }

    if (updates.length === 0) return fail(res, '没有要更新的字段')

    updates.push(`updated_at = NOW()`)
    values.push(userId)

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    return ok(res, result.rows[0])
  } catch (err: any) {
    return fail(res, '更新失败', 'UPDATE_FAILED', 500)
  }
})
