/** 后端 API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  meta?: { total?: number; page?: number }
}

/** 登录响应 */
export interface LoginResponse {
  token: string
  profile: {
    id: string
    openid: string
    nickname: string
    avatar: string | null
    phone: string | null
    role: 'mom' | 'dad' | 'grandma' | 'grandpa' | 'nanny' | 'other'
    preferredUiMode: 'normal' | 'large'
    uiConfig: {
      fontSize: number
      showTTS: boolean
      simplifiedHome: boolean
      autoNightMode: boolean
    }
    createdAt: string
  }
}
