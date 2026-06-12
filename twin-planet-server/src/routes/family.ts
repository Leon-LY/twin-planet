/**
 * 家庭路由 — POST/GET/PUT /api/family
 */
import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const familyRoutes = Router()
familyRoutes.use(requireAuth)

// 获取当前用户的家庭组
familyRoutes.get('/', async (req, res) => {
  try {
    const groups = await db.query.twinGroups.findMany({
      where: eq(schema.twinGroups.userId, req.user!.userId),
    })
    return ok(res, groups.length > 0 ? groups[0] : null)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 创建家庭组
familyRoutes.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return fail(res, 'MISSING_FIELDS', '缺少家庭名称')

    const [group] = await db.insert(schema.twinGroups).values({
      userId: req.user!.userId,
      name,
    }).returning()

    return ok(res, group)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 更新家庭组（名称/关联宝宝）
familyRoutes.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const group = await db.query.twinGroups.findFirst({
      where: eq(schema.twinGroups.id, id),
    })
    if (!group) return fail(res, 'NOT_FOUND', '家庭组不存在', 404)

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name

    const [updated] = await db.update(schema.twinGroups)
      .set(updateData)
      .where(eq(schema.twinGroups.id, id))
      .returning()

    return ok(res, updated)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})
