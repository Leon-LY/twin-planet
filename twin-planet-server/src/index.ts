import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { babiesRouter } from './routes/babies'
import { recordsRouter } from './routes/records'
import { growthRouter } from './routes/growth'
import { familyRouter } from './routes/family'
import { handoverRouter } from './routes/handover'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Security
app.use(helmet())

// 🔒 信任代理（nginx 反向代理后获取真实 IP）
app.set('trust proxy', 1)

// 🔒 CORS 限制到具体域名
const ALLOWED_ORIGINS = [
  'https://miniapp.twinplanet.cn',
  'https://twinplanet.cn',
  'http://localhost:3003',
]
app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（小程序请求、curl、Postman）
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

// Rate limiting — 全局
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: { message: '请求过于频繁，请稍后再试' } },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', globalLimiter)

// 🔒 登录接口严格限流（防暴力破解）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { message: '登录请求过于频繁，请稍后再试' } },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/auth', authLimiter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/babies', babiesRouter)
app.use('/api/records', recordsRouter)
app.use('/api/growth', growthRouter)
app.use('/api/family', familyRouter)
app.use('/api/handover', handoverRouter)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[双宝手帐] Server running on http://localhost:${PORT}`)
})

export default app
