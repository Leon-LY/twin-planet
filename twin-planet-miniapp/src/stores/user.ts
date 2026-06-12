/**
 * 用户状态管理
 * 管理微信登录、用户资料、UI 偏好（含奶奶无障碍模式）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

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

  const roleLabel = computed(() => {
    const map: Record<string, string> = {
      mom: '妈妈', dad: '爸爸', grandma: '奶奶', grandpa: '爷爷',
      nanny: '育儿嫂', other: '家人',
    }
    return map[profile.value?.role ?? 'mom'] ?? '家人'
  })

  const fontSize = computed(() => profile.value?.uiConfig?.fontSize ?? 14)
  const shouldShowTTS = computed(() => profile.value?.uiConfig?.showTTS ?? false)

  function _save() {
    if (profile.value) _p.save(profile.value)
  }

  async function loginByWechat() {
    try {
      const { code } = await uni.login({ provider: 'weixin' })
      // TODO: 调用后端云函数 code → openid → 查询/创建用户
      profile.value = {
        id: 'mock-user-001',
        openid: 'mock-openid',
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
    } catch (err) {
      throw err
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
        fontSize: enabled ? 18 : 14,
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
  }

  return {
    isLoggedIn, profile, isNewUser,
    isGrandmaMode, isDad, isMom, roleLabel, fontSize, shouldShowTTS,
    loginByWechat, setRole, toggleLargeMode, setNickname, logout,
  }
})
