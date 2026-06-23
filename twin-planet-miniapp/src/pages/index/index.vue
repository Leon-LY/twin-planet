<!-- 双宝记 v5 · 首页（薄外壳，三角色组件分发） -->
<template>
  <canvas v-if="babyA && babyB" canvas-id="index-share-canvas" style="position:fixed;left:-9999px;top:-9999px;width:345px;height:480px"></canvas>
  <view :class="[themeClass, { 'font-large': isGrandma }]">
    <template v-if="loading">
      <view class="page-shell"><TwinSkeleton type="brand" /><TwinSkeleton type="twins" /></view>
    </template>

    <IndexGranny v-else-if="isGrandma" :goRecord="goRecord" :goGrowth="goGrowth" :goHelp="goHelp" />

    <IndexDad v-else-if="isDad && !loading" @navigate="navigate" />

    <IndexMom v-else-if="!loading"
      :showWelcome="showWelcome"
      :showCelebrate="showCelebrate"
      :celebrateEmoji="celebrateEmoji"
      :celebrateTitle="celebrateTitle"
      :celebrateDesc="celebrateDesc"
      :milestoneAction="milestoneAction"
      :showInvitePrompt="showInvitePrompt"
      :showRoleDrawer="showRoleDrawer"
      :roleOptions="roleOptions"
      @navigate="navigate"
      @switchRole="showRoleDrawer = true"
      @dismissWelcome="dismissWelcome"
      @acceptInvite="acceptInvite"
      @dismissInvite="() => showInvitePrompt = false"
      @dismissCelebrate="() => showCelebrate = false"
      @milestoneAction="doMilestoneAction"
      @switchToRole="switchToRole"
      @resetFamily="resetFamily"
      @logout="logoutApp"
    />

  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import { useStickersStore } from '@/stores/stickers'
import { useStickerSync } from '@/composables/useStickerSync'
import { saveExportData, syncRecords, pullRecords } from '@/utils/syncService'
import { drawShareCard } from '@/utils/shareCard'
import { createInvite, joinFamily } from '@/api/family'
import { trackSessionStart, trackCelebration, trackPageView } from '@/utils/analytics'
import TwinSkeleton from '@/components/twin-skeleton/twin-skeleton.vue'
import IndexGranny from './components/IndexGranny.vue'
import IndexDad from './components/IndexDad.vue'
import IndexMom from './components/IndexMom.vue'

// ---- 核心状态 ----
const loading = ref(true)
const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const stickersStore = useStickersStore()
const { syncStickers } = useStickerSync()

const isGrandma = computed(() => userStore.isGrandmaMode)
const isDad = computed(() => userStore.isDad && !userStore.isGrandmaMode)
const themeClass = computed(() => {
  const c = ['page-root']
  const h = new Date().getHours()
  if (h >= 22 || h < 6) c.push('theme-dark')
  if (userStore.isGrandmaMode) c.push('font-large', 'role-granny')
  else if (userStore.isDad) c.push('role-dad')
  return c.join(' ')
})
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)

// ---- 新手引导 ----
const WELCOME_KEY = 'tp_welcome_dismissed'
const showWelcome = ref(false)
try {
  const raw = uni.getStorageSync(WELCOME_KEY)
  const dismissedAt = raw ? parseInt(raw) : 0
  const hasRecords = recordsStore.logs.length > 0
  const daysSinceDismiss = dismissedAt ? (Date.now() - dismissedAt) / 86400000 : 999
  showWelcome.value = !hasRecords && (!dismissedAt || daysSinceDismiss > 3)
} catch { showWelcome.value = true }
function dismissWelcome() { showWelcome.value = false; try { uni.setStorageSync(WELCOME_KEY, String(Date.now())) } catch {} }

// ---- 里程碑庆祝 ----
const CELEBRATE_KEY = 'tp_celebrated'
const showCelebrate = ref(false)
const celebrateEmoji = ref('🎉'); const celebrateTitle = ref(''); const celebrateDesc = ref('')
const milestoneAction = ref('')
const MILESTONES: Record<number, { emoji: string; title: string; desc: string; action?: string }> = {
  7: { emoji: '🌟', title: '一周全勤！', desc: '连续7天记录，你已经是个了不起的守护者了', action: '生成双宝周报 📊' },
  30: { emoji: '🏆', title: '月度之星！', desc: '连续30天记录，这份坚持太厉害了' },
  100: { emoji: '👑', title: '百天守护！', desc: '100天的陪伴，两个小怪兽有你真幸福' },
}
function checkCelebrate() {
  const days = streakDays.value
  if (!MILESTONES[days]) return
  try {
    const celebrated: number[] = JSON.parse(uni.getStorageSync(CELEBRATE_KEY) || '[]')
    if (celebrated.includes(days)) return
    const m = MILESTONES[days]
    celebrateEmoji.value = m.emoji; celebrateTitle.value = m.title; celebrateDesc.value = m.desc
    milestoneAction.value = m.action || ''
    showCelebrate.value = true
    trackCelebration(days)
    celebrated.push(days); uni.setStorageSync(CELEBRATE_KEY, JSON.stringify(celebrated))
  } catch {}
}
function doMilestoneAction() { showCelebrate.value = false; uni.navigateTo({ url: '/pages/snapshot/index' }) }

// ---- 邀请 ----
const inviteToken = ref('')
const showInvitePrompt = ref(false)
async function checkInviteAndAccept() {
  try {
    const app = getApp(); const token = app?.globalData?.__inviteToken
    if (token && userStore.isLoggedIn) { showInvitePrompt.value = true; inviteToken.value = token; app.globalData.__inviteToken = null }
  } catch {}
}
async function acceptInvite() {
  try {
    const res = await joinFamily(inviteToken.value)
    if (res.success) { uni.showToast({ title: '成功加入家庭！', icon: 'success' }); showInvitePrompt.value = false }
    else uni.showToast({ title: res.error?.message || '加入失败', icon: 'none' })
  } catch { uni.showToast({ title: '网络问题，稍后再试吧', icon: 'none' }) }
}
async function ensureInviteToken() {
  if (inviteToken.value) return inviteToken.value
  try { const res = await createInvite(); if (res.success && res.data) inviteToken.value = res.data.token; return res.data?.token } catch { return '' }
}

// ---- 分享卡片 ----
const shareCardPath = ref('')
async function genShareCard() {
  if (!babyA.value || !babyB.value) return
  try {
    const today = new Date().setHours(0,0,0,0)
    const todayLogs = recordsStore.logs.filter(l => l.createdAt >= today)
    const stats = {
      babyAName: babyA.value.nickname || babyA.value.name,
      babyBName: babyB.value.nickname || babyB.value.name,
      babyAFeedings: todayLogs.filter(l => l.babyId===babyA.value!.id && l.type==='feeding').length,
      babyBFeedings: todayLogs.filter(l => l.babyId===babyB.value!.id && l.type==='feeding').length,
      babyASleepMin: todayLogs.filter(l => l.babyId===babyA.value!.id && l.type==='sleep').reduce((s,l)=>s+l.durationMin,0),
      babyBSleepMin: todayLogs.filter(l => l.babyId===babyB.value!.id && l.type==='sleep').reduce((s,l)=>s+l.durationMin,0),
      babyADiapers: todayLogs.filter(l => l.babyId===babyA.value!.id && l.type==='diaper').length,
      babyBDiapers: todayLogs.filter(l => l.babyId===babyB.value!.id && l.type==='diaper').length,
      daysGrowing: Math.floor((Date.now() - new Date(babyA.value.birthDate).getTime()) / 86400000),
      syncRate: recordsStore.twinSyncRate, newStickers: stickersStore.todayCount,
    }
    shareCardPath.value = await drawShareCard('index-share-canvas', stats)
  } catch { shareCardPath.value = '' }
}

onShareAppMessage(() => {
  const aName = babyA.value?.nickname || '大宝'; const bName = babyB.value?.nickname || '小宝'
  const parts = [`${aName}和${bName}的成长手帳`]
  if (streakDays.value > 0) parts.push(`连续${streakDays.value}天`)
  if (stickersStore.todayCount > 0) parts.push(`🌟×${stickersStore.todayCount}`)
  const title = parts.join(' · ') + ' · 一起来记录吧 🪐'
  let path = inviteToken.value ? `/pages/index/index?invite=${inviteToken.value}` : '/pages/index/index'
  path += `${path.includes('?')?'&':'?'}from=share`
  return { title, path, imageUrl: shareCardPath.value || '/static/share-brand.png' }
})

// ---- 导航 ----
const TAB_PAGES = ['/pages/index/index', '/pages/record/index', '/pages/stickers/index', '/pages/discover/index']
const navigate = (url: string) => {
  if (TAB_PAGES.includes(url)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}
const goRecord = () => navigate('/pages/record/granny')
const goGrowth = () => navigate('/pages/growth/index')
const goSnapshot = () => navigate('/pages/snapshot/index')
const goHelp = () => navigate('/pages/index/components/HelpGranny')

// ---- 角色切换 ----
const showRoleDrawer = ref(false)
const roleOptions = [
  { key: 'mom', emoji: '👩', label: '妈妈', desc: '完整手帳 · 全部功能' },
  { key: 'dad', emoji: '👨', label: '爸爸', desc: '战术面板 · 精简高效' },
  { key: 'grandma', emoji: '👵', label: '奶奶', desc: '大字模式 · 3 个大按钮' },
  { key: 'grandpa', emoji: '👴', label: '爷爷', desc: '大字模式 · 3 个大按钮' },
  { key: 'nanny', emoji: '👩‍🍼', label: '育儿嫂', desc: '高效记录 · 交接同步' },
]
function switchToRole(r: string) {
  const currentRole = userStore.profile?.role
  userStore.setRole(r as any); showRoleDrawer.value = false
  if (currentRole !== r) {
    const label = roleOptions.find(o => o.key === r)?.label || r
    uni.showToast({ title: '已切换为' + label + '模式', icon: 'success', duration: 1500 })
  }
}
function resetFamily() { showRoleDrawer.value = false; uni.reLaunch({ url: '/pages/onboarding/family' }) }
function logoutApp() { showRoleDrawer.value = false; userStore.logout(); uni.reLaunch({ url: '/pages/login/index' }) }

// ---- 数据同步 ----
async function initSync() {
  if (userStore.isOffline) return
  try {
    const server = await pullRecords()
    if (server.length) recordsStore.mergeServerLogs(server)
    syncRecords(recordsStore.logs.slice(-20))
  } catch { /* 静默 */ }
}

// ---- 生命周期 ----
onMounted(() => {
  const tick = setInterval(() => { /* keep alive */ }, 30000)
  setTimeout(() => {
    loading.value = false
    trackSessionStart(); trackPageView('index')
    syncStickers()
    // 仅在有服务器 token 时同步和请求，避免 401 刷屏
    if (!userStore.isOffline) {
      initSync().catch(() => {})
      if (userStore.isLoggedIn) ensureInviteToken().catch(() => {})
    }
    checkCelebrate(); checkInviteAndAccept()
    genShareCard().catch(() => {})
  }, 400)
})

/** 每次页面显示时同步 tab 高亮 */
onShow(() => {
  try {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    if ((page as any)?.getTabBar) {
      (page as any).getTabBar().setData({ selected: 0 })
    }
  } catch (_) {}
})

</script>

<style scoped>
.page-root { min-height: 100vh; padding-bottom: calc(100rpx + env(safe-area-inset-bottom)); }
</style>
