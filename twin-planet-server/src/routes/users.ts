/**
 * 用户路由 — GET/PUT /api/users/me
 */
import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const userRoutes = Router()
userRoutes.use(requireAuth)

// 获取当前用户
userRoutes.get('/me', async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, req.user!.userId),
    })
    if (!user) return fail(res, 'NOT_FOUND', '用户不存在', 404)
    return ok(res, user)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 更新当前用户（昵称/角色/UI偏好）
userRoutes.put('/me', async (req, res) => {
  try {
    const { nickname, phone, role, preferredUiMode, uiConfig } = req.body
    const updateData: Record<string, any> = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role
    if (preferredUiMode !== undefined) updateData.preferredUiMode = preferredUiMode
    if (uiConfig !== undefined) updateData.uiConfig = uiConfig

    if (Object.keys(updateData).length === 0) {
      return fail(res, 'NO_DATA', '没有需要更新的字段')
    }

    const [updated] = await db.update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, req.user!.userId))
      .returning()

    return ok(res, updated)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})
