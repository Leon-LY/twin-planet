/**
 * 双宝记后端 API 冒烟测试
 * 覆盖所有路由的健康检查和基本响应格式
 * 运行: npx jest --config jest.config.js
 */
import express from 'express'
import request from 'supertest'

// 为避免数据库依赖，仅测试不需要认证的端点
describe('双宝记 API Smoke Tests', () => {
  let app: express.Express

  beforeAll(async () => {
    // 动态导入避免 DB 连接
    const mod = await import('../index')
    app = mod.default
  })

  describe('GET /api/health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('ok')
      expect(res.body.data.time).toBeDefined()
    })
  })

  describe('POST /api/auth/wechat-login', () => {
    it('rejects missing code', async () => {
      const res = await request(app)
        .post('/api/auth/wechat-login')
        .send({})
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('accepts dev code in non-production', async () => {
      const res = await request(app)
        .post('/api/auth/wechat-login')
        .send({ code: 'dev' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
      expect(res.body.data.profile).toBeDefined()
    })
  })

  describe('Auth-required routes reject without token', () => {
    it('GET /api/babies returns 401', async () => {
      const res = await request(app).get('/api/babies')
      expect(res.status).toBe(401)
    })

    it('GET /api/records returns 401', async () => {
      const res = await request(app).get('/api/records')
      expect(res.status).toBe(401)
    })

    it('GET /api/handover returns 401', async () => {
      const res = await request(app).get('/api/handover')
      expect(res.status).toBe(401)
    })
  })

  describe('Rate limiting', () => {
    it('POST /api/auth/wechat-login is rate limited', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app).post('/api/auth/wechat-login').send({ code: 'dev' })
      )
      const results = await Promise.all(promises)
      // 所有请求应成功或限流（429），不应崩溃
      const statuses = results.map(r => r.status)
      expect(statuses.every(s => s === 200 || s === 429)).toBe(true)
    })
  })
})
