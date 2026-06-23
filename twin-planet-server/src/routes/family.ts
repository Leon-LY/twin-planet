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
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

const createFamily = async (req: any, res: any) => {
  try {
    const { name } = req.body
    if (!name) return fail(res, 'MISSING_FIELDS', '缺少家庭名称')
    const [group] = await db.insert(schema.twinGroups).values({
      userId: req.user!.userId, name,
    }).returning()
    return ok(res, group)
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
}
familyRoutes.post('/', createFamily)
familyRoutes.post('/create', createFamily)

familyRoutes.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const group = await db.query.twinGroups.findFirst({ where: eq(schema.twinGroups.id, id) })
    if (!group) return fail(res, 'NOT_FOUND', '家庭组不存在', 404)
    const data: Record<string, any> = {}
    if (req.body.name !== undefined) data.name = req.body.name
    const [updated] = await db.update(schema.twinGroups).set(data).where(eq(schema.twinGroups.id, id)).returning()
    return ok(res, updated)
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

familyRoutes.post('/invite', async (_req, res) => {
  try {
    const token = 'tp-invite-' + Date.now()
    return ok(res, { token, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() })
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

familyRoutes.post('/join', async (req, res) => {
  try {
    if (!req.body.token) return fail(res, 'MISSING_FIELDS', '缺少邀请令牌')
    return ok(res, { familyId: 'shared-family', message: '加入成功' })
  } catch (err: any) { return fail(res, 'INTERNAL', err.message, 500) }
})

familyRoutes.post('/leave', async (_req, res) => {
  return ok(res, { message: '已退出家庭' })
})
