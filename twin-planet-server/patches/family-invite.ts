  // POST /api/family/invite — 生成邀请令牌
  familyRoutes.post('/invite', async (_req, res) => {
    try {
      const token = 'tp-invite-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      return ok(res, { token, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() })
    } catch (err: any) {
      return fail(res, 'INTERNAL', err.message, 500)
    }
  })

  // POST /api/family/join — 通过邀请令牌加入家庭
  familyRoutes.post('/join', async (req, res) => {
    try {
      const { token } = req.body
      if (!token) return fail(res, 'MISSING_FIELDS', '缺少邀请令牌')
      // MVP: 接受任何有效格式的令牌
      if (!token || token.length < 10) return fail(res, 'INVALID', '无效的邀请令牌', 400)
      return ok(res, { familyId: 'shared-family', message: '加入成功' })
    } catch (err: any) {
      return fail(res, 'INTERNAL', err.message, 500)
    }
  })
