import { Response } from 'express'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: { message: string; code?: string }
  meta?: { total?: number; page?: number; limit?: number }
}

export function ok<T>(res: Response, data: T, meta?: ApiResponse['meta']) {
  return res.json({ success: true, data, meta })
}

export function fail(res: Response, message: string, code?: string, status = 400) {
  return res.status(status).json({ success: false, error: { message, code } })
}
