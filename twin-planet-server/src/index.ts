/**
 * 并蒂星球 · API 入口
 */
import express from 'express'
import cors from 'cors'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { babyRoutes } from './routes/babies'
import { familyRoutes } from './routes/family'
import { recordRoutes } from './routes/records'
import { interactionRoutes } from './routes/interactions'
import { guardianRoutes } from './routes/guardian'

const app = express()

// 基础中间件
app.use(cors())
app.use(express.json())

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/babies', babyRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/interactions', interactionRoutes)
app.use('/api/guardian', guardianRoutes)

// 全局错误处理
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[twin-planet] API server running on port ${config.port}`)
  console.log(`[twin-planet] Health check: http://localhost:${config.port}/api/health`)
})

export default app
