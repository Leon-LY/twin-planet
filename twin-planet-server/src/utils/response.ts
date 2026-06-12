/**
 * 统一 API 响应格式
 */
import type { Response } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  meta?: { total?: number; page?: number }
}

export function ok<T>(res: Response, data: T, meta?: ApiResponse['meta']) {
  const body: ApiResponse<T> = { success: true, data }
  if (meta) body.meta = meta
  return res.json(body)
}

export function fail(res: Response, code: string, message: string, status = 400) {
  const body: ApiResponse = { success: false, error: { code, message } }
  return res.status(status).json(body)
}
