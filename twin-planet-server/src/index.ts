import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { babiesRouter } from './routes/babies'
import { recordsRouter } from './routes/records'
import { growthRouter } from './routes/growth'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Security
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { message: '请求过于频繁，请稍后再试' } }
})
app.use('/api', limiter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/babies', babiesRouter)
app.use('/api/records', recordsRouter)
app.use('/api/growth', growthRouter)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[双宝手帐] Server running on http://localhost:${PORT}`)
})

export default app
