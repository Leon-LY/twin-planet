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
  const _isOffline = ref(false)

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
      // 优先尝试真实微信登录，失败自动降级 mock
      let code = 'dev-mock-code'
      try {
        const wxLogin = await uni.login({ provider: 'weixin' })
        if (wxLogin.code) code = wxLogin.code
      } catch { /* 开发者工具可能无 wx.login，用 mock */ }

      // 调用后端 API 换取 token
      let res = await request<LoginResponse>('/auth/wechat-login', {
        method: 'POST',
        data: { code },
        auth: false,
      })

      // 真实 code 失败则用 dev-mock-code 重试
      if ((!res.success || !res.data) && code !== 'dev-mock-code') {
        res = await request<LoginResponse>('/auth/wechat-login', {
          method: 'POST',
          data: { code: 'dev-mock-code' },
          auth: false,
        })
      }

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || '登录失败')
      }

      saveToken(res.data.token)
      _isOffline.value = false
      profile.value = res.data.profile
      isLoggedIn.value = true
      isNewUser.value = false
      _save()
    } catch (err: any) {
      console.warn('[user] Server login failed, using local fallback:', err.message)
      _createLocalProfile()
    }
  }

  /** 离线模式 — 跳过服务器认证，创建本地用户 */
  function _createLocalProfile() {
    // 优先复用已有持久化角色，避免每次离线登录重置为 mom
    const existing = _p.load()
    profile.value = {
      id: 'local-user-' + Date.now(),
      openid: 'offline-' + Date.now(),
      nickname: existing?.nickname || '',
      avatar: existing?.avatar || '',
      phone: existing?.phone || '',
      role: existing?.role || 'mom',
      preferredUiMode: existing?.preferredUiMode || 'normal',
      uiConfig: existing?.uiConfig || { ...DEFAULT_UI_CONFIG },
      createdAt: existing?.createdAt || new Date().toISOString(),
    }
    isLoggedIn.value = true
    isNewUser.value = false
    _isOffline.value = true
    _save()
  }

  /** 外部调用：启用离线模式（生产环境登录失败后的降级方案） */
  function enableOfflineMode() {
    _createLocalProfile()
  }

  /** 同步 profile 到服务器（静默，失败不影响本地） */
  async function _syncProfileToServer() {
    if (_isOffline.value || !profile.value) return
    try {
      await request('/auth/profile', {
        method: 'PUT',
        data: {
          nickname: profile.value.nickname,
          role: profile.value.role,
          preferredUiMode: profile.value.preferredUiMode,
          uiConfig: profile.value.uiConfig,
        },
      })
    } catch { /* 静默失败，本地状态已保存 */ }
  }

  /** 设置角色（不可变更新） */
  function setRole(role: UserProfile['role']) {
    if (!profile.value) return
    profile.value = { ...profile.value, role }
    if (role === 'grandma' || role === 'grandpa') {
      toggleLargeMode(true)
      return
    }
    _save()
    _syncProfileToServer()
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
    _syncProfileToServer()
  }

  function setNickname(name: string) {
    if (profile.value) {
      profile.value = { ...profile.value, nickname: name }
      _save()
      _syncProfileToServer()
    }
  }

  function logout() {
    isLoggedIn.value = false
    profile.value = null
    _p.remove()
    clearToken()
  }

  const isOffline = computed(() => _isOffline.value)

  return {
    isLoggedIn, profile, isNewUser, isOffline,
    isGrandmaMode, isDad, isMom, roleConfig, roleLabel, roleEmoji, fontSize, shouldShowTTS,
    loginByWechat, enableOfflineMode, setRole, toggleLargeMode, setNickname, logout,
  }
})
