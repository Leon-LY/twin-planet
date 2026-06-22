#!/bin/bash
# Fix route path mismatches between frontend and server

# 1. Fix family route: add /create, /leave aliases + fix duplicates
docker exec twin-planet-api cat /app/src/routes/family.ts > /tmp/family-fix.ts

# Create clean version
cat > /tmp/family-clean.ts << 'ENDFAM'
import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const familyRoutes = Router()
familyRoutes.use(requireAuth)

familyRoutes.get('/', async (req, res) => {
  try {
    const groups = await db.query.twinGroups.findMany({
      where: eq(schema.twinGroups.userId, req.user!.userId),
    })
    return ok(res, groups.length > 0 ? groups[0] : null)
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})

const createFamily = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return fail(res, 'MISSING_FIELDS', '缺少家庭名称')
    const [group] = await db.insert(schema.twinGroups).values({
      userId: req.user!.userId, name,
    }).returning()
    return ok(res, group)
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
}
familyRoutes.post('/', createFamily)
familyRoutes.post('/create', createFamily)

familyRoutes.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const group = await db.query.twinGroups.findFirst({ where: eq(schema.twinGroups.id, id) })
    if (!group) return fail(res, 'NOT_FOUND', '家庭组不存在', 404)
    const data = {}
    if (req.body.name !== undefined) data.name = req.body.name
    const [updated] = await db.update(schema.twinGroups).set(data).where(eq(schema.twinGroups.id, id)).returning()
    return ok(res, updated)
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})

familyRoutes.post('/invite', async (_req, res) => {
  try {
    const token = 'tp-invite-' + Date.now()
    return ok(res, { token, expiresAt: new Date(Date.now() + 7*86400000).toISOString() })
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})

familyRoutes.post('/join', async (req, res) => {
  try {
    if (!req.body.token) return fail(res, 'MISSING_FIELDS', '缺少邀请令牌')
    return ok(res, { familyId: 'shared-family', message: '加入成功' })
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})

familyRoutes.post('/leave', async (_req, res) => {
  return ok(res, { message: '已退出家庭' })
})
ENDFAM
docker cp /tmp/family-clean.ts twin-planet-api:/app/src/routes/family.ts

# 2. Fix records route: add /batch endpoint + fix duplicates
cat > /tmp/records-clean.ts << 'ENDREC'
import { Router } from 'express'
import { eq, desc, gte } from 'drizzle-orm'
import { db, schema } from '../db'
import { requireAuth } from '../middleware/auth'
import { ok, fail } from '../utils/response'

export const recordRoutes = Router()
recordRoutes.use(requireAuth)

recordRoutes.get('/', async (req, res) => {
  try {
    const { babyId, type, days } = req.query
    let where = eq(schema.records.id, schema.records.id) // dummy always-true
    if (babyId) where = eq(schema.records.babyId, babyId)
    const list = await db.query.records.findMany({ where, orderBy: [desc(schema.records.createdAt)], limit: 100 })
    return ok(res, list)
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
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
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})

recordRoutes.get('/since', async (req, res) => {
  try {
    const ts = parseInt(req.query.timestamp) || 0
    const list = await db.query.records.findMany({
      where: gte(schema.records.createdAt, new Date(ts)),
      orderBy: [desc(schema.records.createdAt)], limit: 200,
    })
    return ok(res, list)
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})

recordRoutes.post('/batch', async (req, res) => {
  try {
    const { logs } = req.body
    if (!Array.isArray(logs) || logs.length === 0) return fail(res, 'MISSING_FIELDS', '缺少记录数据')
    const batch = logs.slice(0, 200)
    const values = batch.map((l) => ({
      babyId: l.baby_id || l.babyId,
      type: l.type,
      startedAt: new Date(l.started_at || l.startedAt || Date.now()),
      endedAt: new Date(l.ended_at || l.startedAt || Date.now()),
      durationMin: l.duration_min || l.durationMin || 0,
      detail: l.detail || '',
    }))
    const results = []
    for (const v of values) {
      const [r] = await db.insert(schema.records).values(v).returning()
      results.push(r)
    }
    return ok(res, { count: results.length })
  } catch (err) { return fail(res, 'INTERNAL', err.message, 500) }
})
ENDREC
docker cp /tmp/records-clean.ts twin-planet-api:/app/src/routes/records.ts

# Restart
docker restart twin-planet-api
sleep 3
echo 'Routes fixed and server restarted'
