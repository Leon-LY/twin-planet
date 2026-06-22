  // GET /api/records/since?timestamp= — 增量拉取
  recordRoutes.get('/since', async (req, res) => {
    try {
      const ts = parseInt(req.query.timestamp as string) || 0
      const since = new Date(ts)
      const list = await db.query.records.findMany({
        where: gte(schema.records.createdAt, since),
        orderBy: [desc(schema.records.createdAt)],
        limit: 200,
      })
      return ok(res, list)
    } catch (err: any) {
      return fail(res, 'INTERNAL', err.message, 500)
    }
  })
