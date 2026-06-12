/**
 * 用户状态管理
 * 管理微信登录、用户资料、UI 偏好（含奶奶无障碍模式）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  fontSize: number          // 默认 14，大字模式 18
  showTTS: boolean           // 是否显示语音朗读按钮
  simplifiedHome: boolean    // 是否使用简化首页
  autoNightMode: boolean     // 自动夜间模式
}

const DEFAULT_UI_CONFIG: UserUIConfig = {
  fontSize: 14,
  showTTS: false,
  simplifiedHome: false,
  autoNightMode: true,
}

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const isLoggedIn = ref(false)
  const profile = ref<UserProfile | null>(null)
  const isNewUser = ref(true)  // 新用户标识，用于触发新手村

  // ---- getters ----
  const isGrandmaMode = computed(() => profile.value?.preferredUiMode === 'large')
  const isDad = computed(() => profile.value?.role === 'dad')
  const isMom = computed(() => profile.value?.role === 'mom')
  const roleLabel = computed(() => {
    const map: Record<string, string> = {
      mom: '妈妈', dad: '爸爸', grandma: '奶奶', grandpa: '爷爷',
      nanny: '阿姨', other: '家人',
    }
    return map[profile.value?.role ?? 'mom'] ?? '家人'
  })

  const fontSize = computed(() => profile.value?.uiConfig?.fontSize ?? 14)
  const shouldShowTTS = computed(() => profile.value?.uiConfig?.showTTS ?? false)

  // ---- actions ----
  /** 微信一键登录 */
  async function loginByWechat() {
    // #ifdef MP-WEIXIN
    try {
      const { code } = await uni.login({ provider: 'weixin' })
      // TODO: 调用后端云函数 code → openid → 查询或创建用户
      // 当前使用模拟数据
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
      console.log('[store/user] WeChat login success, code:', code)
    } catch (err) {
      console.error('[store/user] WeChat login failed:', err)
      throw err
    }
    // #endif
  }

  /** 更新角色 */
  function setRole(role: UserProfile['role']) {
    if (profile.value) profile.value.role = role
  }

  /** 切换大字模式 */
  function toggleLargeMode(enabled: boolean) {
    if (!profile.value) return
    profile.value.preferredUiMode = enabled ? 'large' : 'normal'
    profile.value.uiConfig.fontSize = enabled ? 18 : 14
    profile.value.uiConfig.showTTS = enabled
    profile.value.uiConfig.simplifiedHome = enabled
  }

  /** 更新昵称 */
  function setNickname(name: string) {
    if (profile.value) profile.value.nickname = name
  }

  /** 登出 */
  function logout() {
    isLoggedIn.value = false
    profile.value = null
  }

  return {
    isLoggedIn, profile, isNewUser,
    isGrandmaMode, isDad, isMom, roleLabel, fontSize, shouldShowTTS,
    loginByWechat, setRole, toggleLargeMode, setNickname, logout,
  }
})
