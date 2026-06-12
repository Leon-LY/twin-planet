/**
 * 记录路由 — POST/GET /api/records
 */
import { Router } from 'express'
import { eq, and, desc, gte } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const recordRoutes = Router()
recordRoutes.use(requireAuth)

// 获取记录列表（支持筛选）
recordRoutes.get('/', async (req, res) => {
  try {
    const { babyId, type, days } = req.query

    let where = and()
    if (babyId) {
      where = and(where, eq(schema.records.babyId, babyId as string))
    }
    if (type) {
      where = and(where, eq(schema.records.type, type as string))
    }
    if (days) {
      const since = new Date(Date.now() - parseInt(days as string) * 86400000)
      where = and(where, gte(schema.records.createdAt, since))
    }

    const list = await db.query.records.findMany({
      where,
      orderBy: [desc(schema.records.createdAt)],
      limit: 100,
    })
    return ok(res, list)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})

// 创建记录
recordRoutes.post('/', async (req, res) => {
  try {
    const {
      babyId, type, startedAt, endedAt, durationMin, detail,
      feedingSide, amountMl, sleepQuality, diaperType,
    } = req.body

    if (!babyId || !type) {
      return fail(res, 'MISSING_FIELDS', '缺少必填字段：babyId, type')
    }

    const [record] = await db.insert(schema.records).values({
      babyId,
      type,
      startedAt: new Date(startedAt || Date.now()),
      endedAt: new Date(endedAt || Date.now()),
      durationMin: durationMin || 0,
      detail: detail || '',
      feedingSide: feedingSide || null,
      amountMl: amountMl || null,
      sleepQuality: sleepQuality || null,
      diaperType: diaperType || null,
    }).returning()

    return ok(res, record)
  } catch (err: any) {
    return fail(res, 'INTERNAL', err.message, 500)
  }
})
