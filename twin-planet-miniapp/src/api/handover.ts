/**
 * 语音交接 API — 消息同步到服务器
 */
import { request } from './client'
import type { ApiResponse } from './types'

export interface HandoverMessage {
  id: string
  author_name?: string
  baby_id?: string
  audio_url?: string
  duration_sec: number
  text?: string
  created_at: string
}

/** 上传语音/文字消息 */
export async function uploadMessage(data: {
  babyId?: string; audioUrl?: string; durationSec?: number; text?: string
}): Promise<ApiResponse<{ id: string }>> {
  return request('/handover', { method: 'POST', data })
}

/** 获取交接记录 */
export async function getMessages(babyId?: string, limit?: number): Promise<ApiResponse<HandoverMessage[]>> {
  const params = new URLSearchParams()
  if (babyId) params.set('babyId', babyId)
  if (limit) params.set('limit', String(limit))
  return request(`/handover?${params}`)
}

/** 拉取新消息（换手机/恢复） */
export async function pullMessages(since: number): Promise<ApiResponse<HandoverMessage[]>> {
  return request(`/handover/since?timestamp=${since}`)
}

/** 删除消息 */
export async function deleteMessage(id: string): Promise<ApiResponse<null>> {
  return request(`/handover/${id}`, { method: 'DELETE' })
}
