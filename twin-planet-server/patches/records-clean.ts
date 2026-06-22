import { Router } from 'express'
import { eq, desc, gte } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const recordRoutes = Router()
recordRoutes.use(requireAuth)

recordRoutes.get('/', async (req, res) => {
  try {
    const { babyId } = req.query
    const where = babyId ? eq(schema.records.babyId, babyId as string) : undefined
    const list = await db.query.records.findMany({ where, orderBy: [desc(schema.records.createdAt)], limit: 100 })
    return ok(res, list)
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

recordRoutes.post('/', async (req, res) => {
  try {
    const { babyId, type, startedAt, endedAt, durationMin, detail } = req.body
    if (!babyId || !type) return fail(res, 'MISSING_FIELDS', '缺少必填字段')
    const [record] = await db.insert(schema.records).values({
      babyId, type,
      startedAt: new Date(startedAt || Date.now()),
      endedAt: new Date(endedAt || Date.now()),
      durationMin: durationMin || 0,
      detail: detail || '',
    }).returning()
    return ok(res, record)
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

recordRoutes.get('/since', async (req, res) => {
  try {
    const ts = parseInt(req.query.timestamp as string) || 0
    const list = await db.query.records.findMany({
      where: gte(schema.records.createdAt, new Date(ts)),
      orderBy: [desc(schema.records.createdAt)], limit: 200,
    })
    return ok(res, list)
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

recordRoutes.post('/batch', async (req, res) => {
  try {
    const { logs } = req.body
    if (!Array.isArray(logs) || logs.length === 0) return fail(res, 'MISSING_FIELDS', '缺少记录数据')
    const batch = logs.slice(0, 200)
    const results = []
    for (const l of batch) {
      const [r] = await db.insert(schema.records).values({
        babyId: l.baby_id || l.babyId,
        type: l.type,
        startedAt: new Date(l.started_at || l.startedAt || Date.now()),
        endedAt: new Date(l.ended_at || l.startedAt || Date.now()),
        durationMin: l.duration_min || l.durationMin || 0,
        detail: l.detail || '',
      }).returning()
      results.push(r)
    }
    return ok(res, { count: results.length })
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})
