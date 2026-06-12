/**
 * 互动路由 — POST/GET /api/interactions
 */
import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const interactionRoutes = Router()
interactionRoutes.use(requireAuth)

// 获取互动列表
interactionRoutes.get('/', async (req, res) => {
  try {
    const { twinGroupId } = req.query
    let where = twinGroupId
      ? eq(schema.siblingInteractions.twinGroupId, twinGroupId as string)
      : undefined

    const sprouts = await db.query.siblingInteractions.findMany({
      where,
      orderBy: [desc(schema.siblingInteractions.recordedAt)],
      limit: 50,
    })

    const contribs = await db.query.parentContributions.findMany({
      where: eq(schema.parentContributions.userId, req.user!.userId),
      orderBy: [desc(schema.parentContributions.recordedAt)],
      limit: 50,
    })

    return ok(res, { sprouts, contributions: contribs })
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 添加萌芽日记
interactionRoutes.post('/sprout', async (req, res) => {
  try {
    const { twinGroupId, babyIds, type, note } = req.body
    if (!twinGroupId || !babyIds || !type) {
      return fail(res, 'MISSING_FIELDS', '缺少必填字段：twinGroupId, babyIds, type')
    }

    const [entry] = await db.insert(schema.siblingInteractions).values({
      twinGroupId,
      babyIds,
      type,
      note: note || '',
    }).returning()

    return ok(res, entry)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 添加今日贡献
interactionRoutes.post('/contribution', async (req, res) => {
  try {
    const { category, note, userName } = req.body
    if (!category) return fail(res, 'MISSING_FIELDS', '缺少必填字段：category')

    const [entry] = await db.insert(schema.parentContributions).values({
      userId: req.user!.userId,
      userName: userName || '家人',
      category,
      note: note || '',
    }).returning()

    return ok(res, entry)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})
