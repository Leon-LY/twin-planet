/**
 * 统一 HTTP 客户端 — 双宝星球后端 API
 * 双写策略：后端优先 + 本地兜底
 */
import type { ApiResponse } from './types'
import { PERSIST_KEYS } from '@/utils/persist'

// 🔒 后端地址：生产用 HTTPS 域名，开发用 localhost
const BASE_URL = (typeof process !== 'undefined' && process.env?.API_BASE_URL)
  || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3003/api'
    : 'https://twinplanet.cn/api')

const TOKEN_KEY = 'tp_' + PERSIST_KEYS.token

/** 保存 JWT token 到本地 */
export function saveToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

/** 获取本地缓存的 JWT token */
export function getToken(): string | null {
  try {
    return uni.getStorageSync(TOKEN_KEY) || null
  } catch {
    return null
  }
}

/** 清除本地 token（登出时） */
export function clearToken() {
  try {
    uni.removeStorageSync(TOKEN_KEY)
  } catch { /* ignore */ }
}

/** 通用请求封装 */
export async function request<T = unknown>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: Record<string, any>
    auth?: boolean  // 是否携带 JWT，默认 true
    timeout?: number
  },
): Promise<ApiResponse<T>> {
  const { method = 'GET', data, auth = true, timeout = 15000 } = options || {}
  const token = getToken()

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (auth && token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await uni.request({
      url: BASE_URL + path,
      method,
      header,
      data,
      timeout,
    })
    const body = res.data as any
    // 验证响应格式
    if (body && typeof body.success === 'boolean') {
      return body as ApiResponse<T>
    }
    return {
      success: false,
      error: { code: 'BAD_RESPONSE', message: '服务器返回了意外的数据格式' },
    }
  } catch (err: any) {
    // 网络错误时返回统一格式
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: err.errMsg || '网络连接失败，请检查网络后重试' },
    }
  }
}
