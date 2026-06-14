/**
 * 用户状态管理
 * 管理微信登录、用户资料、UI 偏好（含奶奶无障碍模式）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { request, saveToken, clearToken } from '@/api/client'
import type { LoginResponse } from '@/api/types'
import { getRoleConfig, type RoleConfig } from '@/config/roles'

export interface UserProfile {
  id: string
  openid: string
  nickname: string
  avatar: string
  phone: string
  role: 'mom' | 'dad' | 'grandma' | 'grandpa' | 'nanny' | 'other'
  preferredUiMode: 'normal' | 'large'
  uiConfig: UserUIConfig
  createdAt: string
}

export interface UserUIConfig {
  fontSize: number
  showTTS: boolean
  simplifiedHome: boolean
  autoNightMode: boolean
}

const DEFAULT_UI_CONFIG: UserUIConfig = {
  fontSize: 14,
  showTTS: false,
  simplifiedHome: false,
  autoNightMode: true,
}

export const useUserStore = defineStore('user', () => {
  const _p = createPersistence<UserProfile>(PERSIST_KEYS.user)

  const isLoggedIn = ref(false)
  const profile = ref<UserProfile | null>(_p.load())
  const isNewUser = ref(!profile.value)

  // 如果从存储恢复了 profile，自动登录
  if (profile.value) {
    isLoggedIn.value = true
  }

  const isGrandmaMode = computed(() => profile.value?.preferredUiMode === 'large')
  const isDad = computed(() => profile.value?.role === 'dad')
  const isMom = computed(() => profile.value?.role === 'mom')

  /** 当前角色完整配置 */
  const roleConfig = computed<RoleConfig>(() => getRoleConfig(profile.value?.role))

  const roleLabel = computed(() => roleConfig.value.label)
  const roleEmoji = computed(() => roleConfig.value.emoji)

  const fontSize = computed(() => profile.value?.uiConfig?.fontSize ?? 14)
  const shouldShowTTS = computed(() => profile.value?.uiConfig?.showTTS ?? false)

  function _save() {
    if (profile.value) _p.save(profile.value)
  }

  async function loginByWechat() {
    try {
      const { code } = await uni.login({ provider: 'weixin' })

      // 调用后端 API 换取 token 和用户资料
      const res = await request<LoginResponse>('/auth/wechat-login', {
        method: 'POST',
        data: { code },
        auth: false,
      })

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || '登录失败')
      }

      // 保存 JWT token
      saveToken(res.data.token)

      // 更新本地 profile
      profile.value = res.data.profile
      isLoggedIn.value = true
      isNewUser.value = false
      _save()
    } catch (err: any) {
      // 仅开发环境允许 mock 登录
      if (process.env.NODE_ENV !== 'development') {
        throw err
      }
      console.warn('[user] Backend login failed, using local fallback:', err.message)
      profile.value = {
        id: 'local-user-001',
        openid: 'local-mock-openid',
        nickname: 'Leon',
        avatar: '',
        phone: '',
        role: 'dad',
        preferredUiMode: 'normal',
        uiConfig: { ...DEFAULT_UI_CONFIG },
        createdAt: new Date().toISOString(),
      }
      isLoggedIn.value = true
      isNewUser.value = false
      _save()
    }
  }

  /** 设置角色（不可变更新） */
  function setRole(role: UserProfile['role']) {
    if (!profile.value) return
    profile.value = { ...profile.value, role }
    // 奶奶/外婆自动启用大字模式
    if (role === 'grandma' || role === 'grandpa') {
      toggleLargeMode(true)
      return // toggleLargeMode 内部会 _save()
    }
    _save()
  }

  /** 切换大字模式（不可变更新） */
  function toggleLargeMode(enabled: boolean) {
    if (!profile.value) return
    profile.value = {
      ...profile.value,
      preferredUiMode: enabled ? 'large' : 'normal',
      uiConfig: {
        ...profile.value.uiConfig,
        fontSize: enabled ? 24 : 14,
        showTTS: enabled,
        simplifiedHome: enabled,
      },
    }
    _save()
  }

  function setNickname(name: string) {
    if (profile.value) {
      profile.value = { ...profile.value, nickname: name }
      _save()
    }
  }

  function logout() {
    isLoggedIn.value = false
    profile.value = null
    _p.remove()
    clearToken()
  }

  return {
    isLoggedIn, profile, isNewUser,
    isGrandmaMode, isDad, isMom, roleConfig, roleLabel, roleEmoji, fontSize, shouldShowTTS,
    loginByWechat, setRole, toggleLargeMode, setNickname, logout,
  }
})
