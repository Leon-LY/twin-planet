/**
 * 统一 HTTP 客户端 — 并蒂星球后端 API
 * 双写策略：后端优先 + 本地兜底
 */
import type { ApiResponse } from './types'

// 后端地址（开发阶段直连 IP，生产环境切域名）
const BASE_URL = 'http://49.232.49.175:3003/api'

const TOKEN_KEY = 'tp_token'

/** 保存 JWT token 到本地 */
export function saveToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

/** 获取本地缓存的 JWT token */
export function getToken(): string | null {
  return uni.getStorageSync(TOKEN_KEY) || null
}

/** 清除本地 token（登出时） */
export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

/** 通用请求封装 */
export async function request<T = unknown>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: Record<string, any>
    auth?: boolean  // 是否携带 JWT，默认 true
  },
): Promise<ApiResponse<T>> {
  const { method = 'GET', data, auth = true } = options || {}
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
    })
    return res.data as ApiResponse<T>
  } catch (err: any) {
    // 网络错误时返回统一格式
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: err.errMsg || '网络连接失败，请检查网络后重试' },
    }
  }
}
