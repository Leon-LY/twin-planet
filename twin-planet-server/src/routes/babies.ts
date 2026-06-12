/**
 * 宝宝路由 — POST/GET/PUT /api/babies
 */
import { Router } from 'express'
import { eq, and, asc } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const babyRoutes = Router()
babyRoutes.use(requireAuth)

// 获取当前用户的所有宝宝
babyRoutes.get('/', async (req, res) => {
  try {
    const list = await db.query.babies.findMany({
      where: eq(schema.babies.userId, req.user!.userId),
      orderBy: [asc(schema.babies.birthOrder)],
    })
    return ok(res, list)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 添加宝宝
babyRoutes.post('/', async (req, res) => {
  try {
    const userId = req.user!.userId
    const { name, nickname, gender, birthDate, birthOrder, color, avatar, birthWeight, birthHeight, twinGroupId } = req.body

    if (!name || !gender || !birthDate || !birthOrder) {
      return fail(res, 'MISSING_FIELDS', '缺少必填字段：name, gender, birthDate, birthOrder')
    }

    // 同一用户最多 2 个宝宝
    const existing = await db.query.babies.findMany({
      where: eq(schema.babies.userId, userId),
    })
    if (existing.length >= 2) {
      return fail(res, 'LIMIT_EXCEEDED', '每个家庭最多添加 2 个宝宝')
    }

    const [baby] = await db.insert(schema.babies).values({
      userId,
      twinGroupId: twinGroupId || null,
      name,
      nickname: nickname || name,
      gender,
      birthDate,
      birthOrder: birthOrder || 1,
      color: color || (birthOrder === 1 ? '#4299E1' : '#F56565'),
      avatar: avatar || '',
      birthWeight: birthWeight || null,
      birthHeight: birthHeight || null,
      isActive: true,
    }).returning()

    return ok(res, baby, undefined)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 更新宝宝
babyRoutes.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, nickname, gender, birthDate, birthOrder, color, avatar, birthWeight, birthHeight, isActive } = req.body

    const baby = await db.query.babies.findFirst({
      where: and(eq(schema.babies.id, id), eq(schema.babies.userId, req.user!.userId)),
    })
    if (!baby) return fail(res, 'NOT_FOUND', '宝宝不存在', 404)

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (nickname !== undefined) updateData.nickname = nickname
    if (gender !== undefined) updateData.gender = gender
    if (birthDate !== undefined) updateData.birthDate = birthDate
    if (birthOrder !== undefined) updateData.birthOrder = birthOrder
    if (color !== undefined) updateData.color = color
    if (avatar !== undefined) updateData.avatar = avatar
    if (birthWeight !== undefined) updateData.birthWeight = birthWeight
    if (birthHeight !== undefined) updateData.birthHeight = birthHeight
    if (isActive !== undefined) updateData.isActive = isActive

    const [updated] = await db.update(schema.babies)
      .set(updateData)
      .where(eq(schema.babies.id, id))
      .returning()

    return ok(res, updated)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})
