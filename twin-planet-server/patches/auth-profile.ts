// 在 auth.ts 文件顶部附近添加 import:
//   import { requireAuth } from '../middleware/auth'
// 然后把下面这段加到 authRoutes 声明之后:

// PUT /api/auth/profile — 更新个人资料
authRoutes.put('/profile', requireAuth, async (req, res) => {
  try {
    const { nickname, role, preferredUiMode, uiConfig } = req.body
    const userId = req.user!.userId

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
      .where(eq(schema.users.id, userId))
      .returning()

    return ok(res, updated)
  } catch (err: any) {
    return fail(res, 'UPDATE_FAILED', err.message, 500)
  }
})
