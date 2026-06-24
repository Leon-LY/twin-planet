<!-- 妈妈模式 — 完整手帳对开页 -->
<template>
  <view class="page-shell journal journal-paper page-enter">
    <view class="bg-spot spot-a" />
    <view class="bg-spot spot-b" />

    <view class="masthead reveal-1">
      <view class="masthead-left">
        <text class="date-line">{{ dateStr }}</text>
        <view class="role-note" @click="$emit('switchRole')">
          <text>{{ roleEmoji }} {{ roleLabel }}</text>
          <text v-if="alertCount" class="alert-badge">{{ alertCount }}</text>
        </view>
      </view>
      <view class="masthead-right">
        <view class="streak-stamp journal-stamp stamp-gold" v-if="streakDays > 0"><text>连续 {{ streakDays }} 天</text></view>
        <text class="streak-start" v-else>今天开始</text>
      </view>
    </view>

    <view class="today-card journal-card reveal-2">
      <view class="journal-tape tape-amber" />
      <text class="greet-line1">{{ greetFull }}</text>
      <text class="greet-sub">{{ insightText }}</text>
      <text class="seasonal-hint" v-if="seasonalHint">{{ seasonalHint }}</text>
      <view class="today-meta journal-margin" v-if="todaySummary || allGood || tomorrowForecast">
        <text class="today-summary" v-if="todaySummary">{{ todaySummary }}</text>
        <text class="today-allgood" v-if="allGood">🟢 两个小家伙今天都很好</text>
        <text class="today-forecast" v-if="tomorrowForecast && streakDays >= 3">🔮 {{ tomorrowForecast }}</text>
      </view>
    </view>

    <view class="welcome-guide reveal-2" v-if="showWelcome && userStore.roleConfig.homeLayout==='full'">
      <view class="welcome-card journal-card">
        <view class="journal-clip" />
        <view class="welcome-top">
          <text class="welcome-wave">👋</text>
          <view class="welcome-text">
            <text class="welcome-title">欢迎来到双宝手帐</text>
            <text class="welcome-desc">一本可以玩的成长记录本，从今天开始吧</text>
          </view>
          <view class="welcome-close" @click="$emit('dismissWelcome')"><text class="icon-close"></text></view>
        </view>
        <view class="welcome-steps">
          <view class="w-step"><text class="ws-num">1</text><text class="ws-text">点击下方大按钮<br><text class="ws-hl">记录喂奶/睡觉</text></text></view>
          <view class="ws-arrow">→</view>
          <view class="w-step"><text class="ws-num">2</text><text class="ws-text">每天记录<br><text class="ws-hl">收集贴纸</text></text></view>
          <view class="ws-arrow">→</view>
          <view class="w-step"><text class="ws-num">3</text><text class="ws-text">7天后生成<br><text class="ws-hl">第一张双宝卡</text></text></view>
        </view>
      </view>
    </view>

    <view class="twins reveal-3">
      <view class="twin-card card-a journal-holes" :class="{ 'has-timer': isRunningA }" @click="handleBabyTap(babyA)">
        <view class="card-surface">
          <view class="avatar-ring" :class="{ pulsing: isRunningA }">
            <image class="avatar-image" src="/static/avatars/baby-a-amber.png" mode="aspectFill" @error="handleImageError" />
            <text v-if="babyStatusIcon(babyA?.id, 0)" class="avatar-status iconfont" :class="babyStatusIcon(babyA?.id, 0)"></text>
          </view>
          <text class="twin-name">{{ babyA?.nickname || babyA?.name || '大宝' }}</text>
          <view class="twin-status-row">
            <text v-if="isRunningA" class="status-live">计时中</text>
            <text v-else-if="babyStatus(babyA)" :class="['status-recent', babyUrgency(babyA)==='urgent'?'status-urgent':babyUrgency(babyA)==='warn'?'status-warn':'']">{{ babyStatus(babyA) }}</text>
            <text v-else class="status-tap">轻触记录</text>
          </view>
        </view>
      </view>
      <view class="twin-card card-b journal-holes" :class="{ 'has-timer': isRunningB }" @click="handleBabyTap(babyB)">
        <view class="card-surface">
          <view class="avatar-ring" :class="{ pulsing: isRunningB }">
            <image class="avatar-image" src="/static/avatars/baby-b-terracotta.png" mode="aspectFill" @error="handleImageError" />
            <text v-if="babyStatusIcon(babyB?.id, 1)" class="avatar-status iconfont" :class="babyStatusIcon(babyB?.id, 1)"></text>
          </view>
          <text class="twin-name">{{ babyB?.nickname || babyB?.name || '小宝' }}</text>
          <view class="twin-status-row">
            <text v-if="isRunningB" class="status-live">计时中</text>
            <text v-else-if="babyStatus(babyB)" :class="['status-recent', babyUrgency(babyB)==='urgent'?'status-urgent':babyUrgency(babyB)==='warn'?'status-warn':'']">{{ babyStatus(babyB) }}</text>
            <text v-else class="status-tap">轻触记录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 双宝今日对比微卡片 -->
    <view class="twin-compare reveal-3" v-if="todayLogCount > 0">
      <view class="tc-row">
        <view class="tc-bar tc-bar-a" :style="{ width: compareBarA + '%' }"></view>
        <view class="tc-bar tc-bar-b" :style="{ width: compareBarB + '%' }"></view>
      </view>
      <view class="tc-labels">
        <text class="tc-label tc-label-a">{{ babyA?.nickname || '大宝' }} {{ todayCountA }}次</text>
        <text class="tc-sync" v-if="twinSyncRate > 0">同步率 {{ twinSyncRate }}%</text>
        <text class="tc-label tc-label-b">{{ babyB?.nickname || '小宝' }} {{ todayCountB }}次</text>
      </view>
    </view>

    <view class="action-center reveal-3">
      <!-- 无记录 → gap-nudge 替代按钮 -->
      <view v-if="showGapNudge" class="main-btn gap-btn" @click="openStampNote">
        <text class="gn-emoji">📝</text>
        <text class="btn-text">记一笔</text>
        <text class="gn-sub">今天还没有记录哦</text>
      </view>
      <!-- 有记录 → 正常大按钮 -->
      <button v-else class="main-btn" @click="openStampNote">
        <text class="iconfont icon-edit stamp-icon"></text>
        <text class="btn-text">记一笔</text>
      </button>
    </view>

    <view class="quick-bar reveal-3" v-if="babyA && babyB && userStore.roleConfig.homeLayout!=='compact'">
      <view class="q-chip q-primary" :class="{ 'chip-stamped': stampedType === 'feeding' }" @click="dualRecord('feeding')"><text class="iconfont icon-bottle icon-sm"></text> 都喂了</view>
      <view class="q-chip" :class="{ 'chip-stamped': stampedType === 'sleep' }" @click="dualRecord('sleep')"><text class="iconfont icon-sleep icon-sm"></text> 都睡了</view>
      <view class="q-chip" :class="{ 'chip-stamped': stampedType === 'diaper' }" @click="dualRecord('diaper')"><text class="iconfont icon-diaper"></text></view>
    </view>

    <!-- 快速参数选择 — 记录创建后出现，可选细化 -->
    <view class="detail-pills" v-if="detailPills">
      <view
        v-for="opt in PILL_OPTIONS[detailPills.type]"
        :key="opt.label"
        class="dp-chip"
        @click="refineRecord(opt.key, opt.value)"
      >
        <text v-if="opt.emoji" class="dp-emoji">{{ opt.emoji }}</text>
        <text class="dp-label">{{ opt.label }}</text>
      </view>
      <view class="dp-chip dp-dismiss" @click="dismissPills">
        <text class="dp-label">✕</text>
      </view>
    </view>

    <view class="sticker-zone reveal-4" v-if="userStore.roleConfig.homeLayout==='full'">
      <StickerStrip :stickers="stickersStore.todayStickers" :showMore="true" @viewAll="$emit('navigate','/pages/stickers/index')" />
    </view>

    <!-- 紧凑今日时间线 -->
    <view class="today-timeline reveal-4" v-if="todayLogCount > 0">
      <view class="tt-header" @click="showTimeline = !showTimeline">
        <text class="tt-title">📝 今日已记 {{ todayLogCount }} 条</text>
        <text class="tt-toggle">{{ showTimeline ? '收起 ▲' : '展开 ▼' }}</text>
      </view>
      <view class="tt-list" v-if="showTimeline">
        <view v-for="log in todayLogs.slice().reverse().slice(0, 10)" :key="log.id" class="tt-item"
          @longpress="undoRecord(log.id)">
          <text class="tti-emoji">{{ LOG_EMOJI[log.type] || '📝' }}</text>
          <text class="tti-baby" :style="{ color: log.babyColor || 'var(--ink)' }">{{ log.babyName }}</text>
          <text class="tti-type">{{ LOG_LABELS[log.type] || log.type }}</text>
          <text class="tti-time">{{ tlTime(log.createdAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 「该喂了」提醒 — 基于历史模式推算 -->
    <view class="feed-reminder reveal-4" v-for="r in feedingReminder" :key="r.babyId">
      <text class="fr-emoji">🍼</text>
      <text class="fr-text" :class="`fr-${r.color}`">{{ r.name }}</text>
      <text class="fr-text">距上次喂奶 {{ Math.floor(r.minutesAgo / 60) }}h{{ r.minutesAgo % 60 }}min · 通常间隔 {{ Math.floor(r.avgInterval / 60) }}h{{ r.avgInterval % 60 }}min</text>
    </view>

    <view class="quick-ref reveal-4" v-if="quickRef.lastFeeding!=='—' || quickRef.activeTimer">
      <view class="qr-item journal-sticky" v-if="quickRef.activeTimer"><text class="qr-emoji iconfont icon-clock"></text><text class="qr-text">{{ quickRef.activeTimer }}</text></view>
      <view class="qr-item journal-sticky" v-if="quickRef.lastFeeding!=='—'"><text class="qr-emoji iconfont icon-bottle"></text><text class="qr-text">上次喂奶 {{ quickRef.lastFeeding }}</text></view>
      <view class="qr-item journal-sticky" v-if="quickRef.lastSleep!=='—'"><text class="qr-emoji iconfont icon-sleep"></text><text class="qr-text">上次睡觉 {{ quickRef.lastSleep }}</text></view>
    </view>

    <!-- journal-nav: 手帳导航（生长/贴纸/发现） -->
    <view class="journal-nav reveal-5" v-if="userStore.roleConfig.homeLayout==='full'">
      <view class="jn-item" @click="$emit('navigate', '/pages/growth/index')">
        <text class="jn-emoji">📈</text>
        <text class="jn-label">生长</text>
      </view>
      <view class="jn-item" @click="$emit('navigate', '/pages/stickers/index')">
        <text class="jn-emoji">🏷️</text>
        <text class="jn-label">贴纸</text>
      </view>
      <view class="jn-item" @click="$emit('navigate', '/pages/discover/index')">
        <text class="jn-emoji">🌟</text>
        <text class="jn-label">发现</text>
      </view>
    </view>

    <view class="duty-card reveal-5" v-if="userStore.roleConfig.homeLayout==='compact' && babyA && babyB">
      <view v-for="(action, i) in compactQuickActions" :key="action.type"
        class="q-chip" :class="{ 'q-primary': i === 0, 'chip-stamped': stampedType === action.type }"
        @click="dualRecord(action.type)">
        <text :class="['iconfont', action.icon, 'icon-sm']"></text> {{ action.label }}
      </view>
    </view>

    <!-- compact 底部导航（育儿嫂等角色的功能入口） -->
    <view class="compact-footer reveal-5" v-if="userStore.roleConfig.homeLayout==='compact'">
      <text class="ft-link" @click="$emit('navigate','/pages/growth/index')"><text class="iconfont icon-chart icon-sm"></text> 生长曲线</text>
      <text class="ft-dot">·</text>
      <text class="ft-link" @click="$emit('navigate','/pages/snapshot/index')">📸 快照</text>
      <text class="ft-dot">·</text>
      <text class="ft-link" @click="$emit('navigate','/pages/handover/index')">🎤 交接班</text>
    </view>

    <view class="footer-tools reveal-6" v-if="userStore.roleConfig.homeLayout==='full'">
      <button class="ft-invite" open-type="share"><text>👨‍👩‍👧‍👦 邀请另一半一起记录</text></button>
      <view class="ft-row">
        <text class="ft-link" @click="$emit('navigate','/pages/snapshot/index')"><text class="iconfont icon-share icon-sm"></text> 导出备份</text>
        <text class="ft-dot">·</text>
        <text class="ft-link" @click="$emit('navigate','/pages/privacy/index')">隐私政策</text>
      </view>
    </view>

    <text class="disclaimer-note reveal-6" v-if="userStore.roleConfig.homeLayout==='full'">本应用不提供医疗建议，所有数据仅供参考</text>

    <view class="celebrate-overlay" v-if="showInvitePrompt" @click="$emit('dismissInvite')">
      <view class="celebrate-card" @click.stop>
        <text class="celebrate-emoji">👨‍👩‍👧‍👦</text>
        <text class="celebrate-title">有人邀请你一起记录！</text>
        <text class="celebrate-desc">加入家庭后，你们可以一起记录双宝的日常</text>
        <view class="invite-actions">
          <button class="invite-accept" @click="$emit('acceptInvite')">加入家庭</button>
          <button class="invite-decline" @click="$emit('dismissInvite')">以后再说</button>
        </view>
      </view>
    </view>

    <view class="celebrate-overlay" v-if="showCelebrate" @click="$emit('dismissCelebrate')">
      <view class="celebrate-card" @click.stop>
        <text class="celebrate-emoji">{{ celebrateEmoji }}</text>
        <text class="celebrate-title">{{ celebrateTitle }}</text>
        <text class="celebrate-desc">{{ celebrateDesc }}</text>
        <view class="celebrate-stars"><text class="cs iconfont icon-star"></text><text class="cs iconfont icon-star"></text><text class="cs iconfont icon-star"></text></view>
        <button v-if="milestoneAction" class="milestone-action-btn" @click="$emit('milestoneAction')">{{ milestoneAction }}</button>
      </view>
    </view>

    <text class="journal-footer-text" v-if="streakDays > 0">连续记录第 {{ streakDays }} 天 ✦</text>

    <!-- 便签式盖章卡片 -->
    <StampNote
      :visible="showStampNote"
      :babyA="babyA"
      :babyB="babyB"
      :defaultBabyId="stampDefaultBabyId"
      @close="showStampNote = false"
    />

    <!-- 角色抽屉 -->
    <view class="drawer-overlay" v-if="showRoleDrawer" @click="$emit('switchToRole', userStore.profile?.role || 'mom')">
      <view class="drawer-sheet" @click.stop>
        <view class="drawer-handle" />
        <text class="drawer-title">切换角色</text>
        <view class="drawer-roles">
          <view v-for="r in roleOptions" :key="r.key" class="drawer-role" @click="$emit('switchToRole', r.key)">
            <text class="dr-emoji">{{ r.emoji }}</text>
            <view class="dr-body"><text class="dr-label">{{ r.label }}</text><text class="dr-desc">{{ r.desc }}</text></view>
            <text class="dr-check" v-if="userStore.profile?.role===r.key">✓</text>
          </view>
        </view>
        <view class="drawer-divider" />
        <view class="drawer-role drawer-danger" @click="$emit('resetFamily')"><text class="dr-emoji">📝</text><text class="dr-label">重新创建家庭</text></view>
        <view class="drawer-role drawer-danger" @click="$emit('logout')"><text class="dr-emoji">🚪</text><text class="dr-label">退出登录</text></view>
        <view class="drawer-cancel" @click="$emit('switchToRole', userStore.profile?.role || 'mom')"><text>取消</text></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import { useAlertsStore } from '@/stores/alerts'
import { useStickersStore } from '@/stores/stickers'
import { useQuickRef } from '@/composables/useQuickRef'
import StickerStrip from '@/components/journal/StickerStrip.vue'
import StampNote from '@/components/journal/StampNote.vue'
import { getSeasonalHint } from '@/config/seasonal'
import { useBabyStatus } from '@/composables/useBabyStatus'
import { useFeedingReminder } from '@/composables/useFeedingReminder'
import { useHaptic } from '@/composables/useHaptic'

const emit = defineEmits<{
  navigate: [url: string]
  dismissWelcome: []
  acceptInvite: []
  dismissInvite: []
  milestoneAction: []
  dismissCelebrate: []
  switchRole: []
  switchToRole: [role: string]
  resetFamily: []
  logout: []
}>()

const props = defineProps<{
  showWelcome: boolean
  showCelebrate: boolean
  celebrateEmoji: string
  celebrateTitle: string
  celebrateDesc: string
  milestoneAction: string
  showInvitePrompt: boolean
  showRoleDrawer: boolean
  roleOptions: Array<{ key: string; emoji: string; label: string; desc: string }>
}>()

const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const alertsStore = useAlertsStore()
const stickersStore = useStickersStore()
const { quickRef } = useQuickRef()
const { reminders: feedingReminder } = useFeedingReminder()

const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)
const isRunningA = computed(() => babyA.value ? recordsStore.isBabyRunning(babyA.value.id) : false)
const isRunningB = computed(() => babyB.value ? recordsStore.isBabyRunning(babyB.value.id) : false)
const alertCount = computed(() => alertsStore.unreadCount)
const roleEmoji = computed(() => userStore.roleEmoji)
const roleLabel = computed(() => userStore.roleLabel)

const nowTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { tickTimer = setInterval(() => { nowTick.value = Date.now() }, 30000) })
onUnmounted(() => { if (tickTimer) clearInterval(tickTimer); if (_pillTimer) clearTimeout(_pillTimer) })

const dateStr = computed(() => {
  const d = new Date(); const days = ['日','一','二','三','四','五','六']
  return `${d.getMonth()+1}月${d.getDate()}日 星期${days[d.getDay()]}`
})

const greetFull = computed(() => {
  const h = new Date().getHours(); const r = userStore.profile?.role
  if (r === 'dad') {
    if (h>=22||h<6) return '夜深了 · 值班中，撑住 💪'
    if (h<9) return '早上好，今天你是超级奶爸'
    return '下午好 · 数据看板已就绪 📊'
  }
  if (h>=22||h<6) return '夜深了，辛苦啦 🌙'
  if (h<9) return '早上好，新的一天，两个小怪兽醒了没'
  if (h<14) return '上午好，奶茶续命时间 🧋'
  if (h<18) return '下午好，小怪兽们在干嘛呢'
  return '晚上好，小怪兽们在干嘛呢'
})

const twinSyncRate = computed(() => recordsStore.twinSyncRate)
const insightText = computed(() => {
  const s = twinSyncRate.value
  if (s>70) return '今天两个小家伙步调特别一致，果然是双胞胎~'
  if (s>30) return '两个小怪兽今天各有各的节奏，挺好的'
  if (s>0) return '各自精彩的一天~'
  return '今天两只小怪兽的故事又要开始啦'
})

// === 双宝今日对比 ===
const todayLogs = computed(() => recordsStore.logs.filter(l => l.createdAt >= new Date().setHours(0,0,0,0)))
const todayLogCount = computed(() => todayLogs.value.length)
const todayCountA = computed(() => babyA.value ? todayLogs.value.filter(l => l.babyId === babyA.value.id).length : 0)
const todayCountB = computed(() => babyB.value ? todayLogs.value.filter(l => l.babyId === babyB.value.id).length : 0)
const compareBarA = computed(() => {
  const total = todayCountA.value + todayCountB.value
  return total > 0 ? Math.round(todayCountA.value / total * 100) : 50
})
const compareBarB = computed(() => {
  const total = todayCountA.value + todayCountB.value
  return total > 0 ? Math.round(todayCountB.value / total * 100) : 50
})

const seasonalHint = computed(() => getSeasonalHint())

/** 记录空窗提醒：上午9点后若今日无任何记录则温和提醒 */
const showGapNudge = computed(() => {
  if (todayLogCount.value > 0) return false
  const h = new Date().getHours()
  return h >= 9
})

const todaySummary = computed(() => {
  const today = recordsStore.logs.filter(l => l.createdAt >= new Date().setHours(0,0,0,0))
  if (!today.length) return ''
  const feeds = today.filter(l => l.type === 'feeding').length
  const sleeps = today.filter(l => l.type === 'sleep').length
  const diapers = today.filter(l => l.type === 'diaper').length
  const parts: string[] = []
  if (feeds) parts.push(`${feeds}次喂奶`)
  if (sleeps) parts.push(`${sleeps}次睡眠`)
  if (diapers) parts.push(`${diapers}次换尿布`)
  return parts.length ? `今天 ${parts.join(' · ')}` : ''
})

const tomorrowForecast = computed(() => {
  const allLogs = recordsStore.logs.filter(l => l.type === 'feeding' || l.type === 'sleep')
  if (allLogs.length < 6) return ''
  const morningLogs = allLogs.filter(l => { const h = new Date(l.createdAt).getHours(); return h >= 5 && h < 9 })
  if (morningLogs.length < 2) return ''
  const avgMin = morningLogs.reduce((s, l) => s + new Date(l.createdAt).getHours() * 60 + new Date(l.createdAt).getMinutes(), 0) / morningLogs.length
  const h = Math.floor(avgMin / 60); const m = Math.floor(avgMin % 60)
  return `明早约 ${h}:${String(m).padStart(2, '0')} 第一次喂奶`
})

const allGood = computed(() => {
  const today = recordsStore.logs.filter(l => l.createdAt >= new Date().setHours(0,0,0,0))
  if (!today.length) return false
  const aId = babyA.value?.id; const bId = babyB.value?.id
  return today.some(l => l.babyId === aId) && today.some(l => l.babyId === bId)
})

function babyStatus(b: any): string {
  if (!b) return ''
  const logs = recordsStore.recentLogsByBaby[b.id]
  if (!logs?.length) return ''
  const last = logs[logs.length - 1]
  const m = Math.floor((nowTick.value - last.createdAt) / 60000)
  const a = last.type === 'feeding' ? '喂奶' : last.type === 'sleep' ? '睡觉' : '记录'
  if (m < 1) return `刚刚${a}`; if (m < 60) return `${m}分钟前${a}`
  const hr = Math.floor(m / 60); const min = m % 60
  return `距上次${a} ${hr}小时${min}分`
}

function babyUrgency(b: any): string {
  if (!b) return ''
  const logs = recordsStore.recentLogsByBaby[b.id]
  if (!logs?.length) return ''
  const last = logs[logs.length - 1]
  if (last.type !== 'feeding') return ''
  const h = (nowTick.value - last.createdAt) / 3600000
  if (h > 4) return 'urgent'; if (h > 3) return 'warn'; return ''
}

const { babyStatusIcon, handleImageError } = useBabyStatus()
const haptic = useHaptic()

// === 便签卡片 ===
const showStampNote = ref(false)
const stampDefaultBabyId = ref<string | null>(null)

function handleBabyTap(baby: any) {
  if (!baby) return
  if (recordsStore.isBabyRunning(baby.id)) {
    recordsStore.stopTimer(baby.id)
    haptic.thump()
    uni.showToast({ title: '⏹ 计时结束', icon: 'success', duration: 800 })
    return
  }
  stampDefaultBabyId.value = baby.id
  showStampNote.value = true
}

function openStampNote() {
  if (babyA.value && babyB.value) {
    const lastA = recordsStore.recentLogsByBaby[babyA.value.id]?.[0]?.createdAt ?? 0
    const lastB = recordsStore.recentLogsByBaby[babyB.value.id]?.[0]?.createdAt ?? 0
    stampDefaultBabyId.value = lastA <= lastB ? babyA.value.id : babyB.value.id
  } else {
    stampDefaultBabyId.value = babyA.value?.id ?? babyB.value?.id ?? null
  }
  showStampNote.value = true
}

// === 紧凑时间线 ===
const showTimeline = ref(false)
const LOG_EMOJI: Record<string, string> = { feeding: '🍼', sleep: '😴', diaper: '💧', temperature: '🌡️', medicine: '💊', bath: '🛁' }
const LOG_LABELS: Record<string, string> = { feeding: '喂奶', sleep: '哄睡', diaper: '尿布', temperature: '体温', medicine: '用药', bath: '洗澡' }
function tlTime(ts: number) { const d = new Date(ts); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
function undoRecord(id: string) {
  recordsStore.removeLog(id)
  uni.showToast({ title: '已撤销 ✓', icon: 'success', duration: 1500 })
}

const stampedType = ref('')
/** 快速参数选择：{ type, logIds } — 用户可选的细化参数 */
const detailPills = ref<{ type: string; logIds: string[] } | null>(null)
let _pillTimer: ReturnType<typeof setTimeout> | null = null

const PILL_OPTIONS: Record<string, { emoji: string; label: string; key: string; value: any }[]> = {
  feeding: [
    { emoji: '', label: '30ml', key: 'amountMl', value: 30 },
    { emoji: '', label: '60ml', key: 'amountMl', value: 60 },
    { emoji: '', label: '90ml', key: 'amountMl', value: 90 },
    { emoji: '', label: '120ml', key: 'amountMl', value: 120 },
  ],
  sleep: [
    { emoji: '', label: '30min', key: 'durationMin', value: 30 },
    { emoji: '', label: '1h', key: 'durationMin', value: 60 },
    { emoji: '', label: '2h', key: 'durationMin', value: 120 },
  ],
  diaper: [
    { emoji: '💧', label: '小便', key: 'diaperType', value: 'wet' },
    { emoji: '💩', label: '大便', key: 'diaperType', value: 'dirty' },
    { emoji: '💧💩', label: '都有', key: 'diaperType', value: 'both' },
  ],
}

/** compact 布局快捷操作 — 根据角色 quickActions 配置动态渲染 */
const QUICK_ACTION_CFG: Record<string, { label: string; icon: string }> = {
  feeding: { label: '都喂了', icon: 'icon-bottle' },
  sleep: { label: '都睡了', icon: 'icon-sleep' },
  diaper: { label: '都换了', icon: 'icon-diaper' },
}
const compactQuickActions = computed(() =>
  userStore.roleConfig.quickActions
    .filter(a => QUICK_ACTION_CFG[a])
    .map(a => ({ type: a as 'feeding' | 'sleep' | 'diaper', ...QUICK_ACTION_CFG[a] }))
)

function dualRecord(t: 'feeding' | 'sleep' | 'diaper') {
  const ids: string[] = []
  if (babyA.value) {
    const log = recordsStore.quickLog(babyA.value.id, t)
    if (log) ids.push(log.id)
  }
  if (babyB.value) {
    const log = recordsStore.quickLog(babyB.value.id, t)
    if (log) ids.push(log.id)
  }
  haptic.sparkle()
  stampedType.value = t
  setTimeout(() => { stampedType.value = '' }, 500)
  uni.showToast({ title: t === 'feeding' ? '都喂了' : t === 'sleep' ? '都睡了' : '都换了', icon: 'success', duration: 800 })
  // 显示快速参数选择（3 秒后自动消失）
  if (ids.length && PILL_OPTIONS[t]) {
    detailPills.value = { type: t, logIds: ids }
    if (_pillTimer) clearTimeout(_pillTimer)
    _pillTimer = setTimeout(() => { detailPills.value = null }, 3500)
  }
}

/** 细化记录参数 — 用户选择了金额/时长/类型后更新已创建记录 */
function refineRecord(key: string, value: any) {
  if (!detailPills.value) return
  for (const id of detailPills.value.logIds) {
    recordsStore.updateLog(id, { [key]: value } as any)
  }
  detailPills.value = null
  if (_pillTimer) { clearTimeout(_pillTimer); _pillTimer = null }
  haptic.tick()
}

function dismissPills() {
  detailPills.value = null
  if (_pillTimer) { clearTimeout(_pillTimer); _pillTimer = null }
}

</script>

<style scoped>
.journal{position:relative}
.bg-spot{position:absolute;pointer-events:none;z-index:0}
.spot-a{width:400rpx;height:360rpx;top:20rpx;left:-100rpx;background:radial-gradient(ellipse 60% 55% at 35% 40%,rgba(224,123,62,0.10) 0%,transparent 70%),radial-gradient(ellipse 40% 50% at 55% 35%,rgba(224,123,62,0.06) 0%,transparent 60%)}
.spot-b{width:300rpx;height:260rpx;bottom:320rpx;right:-60rpx;background:radial-gradient(ellipse 50% 60% at 40% 45%,rgba(79,174,110,0.08) 0%,transparent 70%),radial-gradient(ellipse 35% 45% at 55% 35%,rgba(79,174,110,0.05) 0%,transparent 60%)}

.masthead{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32rpx}
.masthead-left{display:flex;flex-direction:column;gap:8rpx}
.date-line{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md);letter-spacing:2rpx}
.role-note{font-size:20rpx;color:var(--ink-lt);display:inline-flex;align-items:center;gap:6rpx}
.role-note:active{color:var(--amber)}
.alert-badge{display:inline-flex;align-items:center;justify-content:center;min-width:28rpx;height:28rpx;border-radius:14rpx;background:var(--twin-danger);color:#FFF;font-size:16rpx;font-weight:700;padding:0 4rpx}
.masthead-right{display:flex;align-items:flex-end}
.streak-stamp{background:var(--gold-lt);padding:6rpx 14rpx;border-radius:4rpx 12rpx 4rpx 12rpx;font-family:var(--font-journal);font-size:20rpx;color:var(--gold);font-weight:700;transform:rotate(2deg);box-shadow:0 2rpx 6rpx rgba(200,153,62,0.1);animation:stampDown .5s var(--ease-stamp) both}
.streak-start{font-size:20rpx;color:var(--ink-lt);font-family:var(--font-journal);background:var(--cream);padding:6rpx 14rpx;border-radius:12rpx;border:1.5px dashed var(--dot)}

.today-card{position:relative;z-index:1;margin-bottom:32rpx;padding:24rpx;background:linear-gradient(135deg,var(--cream),var(--paper));border-radius:var(--radius-md);border:1.5px solid var(--dot)}
.greet-line1{display:block;font-family:var(--font-journal);font-size:var(--font-title);font-weight:400;color:var(--ink);letter-spacing:-1rpx;line-height:1.3}
.greet-sub{display:block;font-size:26rpx;color:var(--ink-lt);margin-top:12rpx;line-height:1.5;max-width:480rpx}
.seasonal-hint{display:block;font-size:22rpx;color:var(--ink-md);margin-top:12rpx;line-height:1.5;font-family:var(--font-journal)}
.today-meta{display:flex;flex-direction:column;gap:8rpx;margin-top:16rpx;padding-top:14rpx;border-top:1px dashed var(--dot)}
.today-summary{font-family:var(--font-journal);font-size:24rpx;color:var(--ink)}
.today-allgood{font-family:var(--font-journal);font-size:24rpx;color:var(--mint);font-weight:600}
.today-forecast{font-size:22rpx;color:var(--ink-lt);font-style:italic}

.welcome-guide{position:relative;z-index:1;margin-bottom:32rpx}
.welcome-card{background:linear-gradient(135deg,var(--amber-lt),var(--cream) 50%,var(--rose-lt));border-radius:var(--radius-md);border:2rpx solid var(--dot);padding:24rpx;animation:cardFloatIn .6s var(--ease-page) both}
.welcome-top{display:flex;align-items:flex-start;gap:12rpx;margin-bottom:24rpx}
.welcome-wave{font-size:48rpx;flex-shrink:0}
.welcome-text{flex:1}
.welcome-title{display:block;font-family:var(--font-journal);font-size:32rpx;font-weight:700;color:var(--ink)}
.welcome-desc{display:block;font-size:24rpx;color:var(--ink-md);margin-top:4rpx}
.welcome-close{width:48rpx;height:48rpx;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:22rpx;color:var(--ink-md);background:linear-gradient(180deg,rgba(255,255,255,0.6) 0%,transparent 50%,rgba(0,0,0,0.03) 100%),var(--cream);border:1.5rpx solid var(--dot);box-shadow:0 1.5rpx 0 rgba(0,0,0,0.04),0 2rpx 4rpx rgba(0,0,0,0.03);transition:all .15s var(--ease-stamp)}
.welcome-close::after{content:'';position:absolute;top:26%;left:25%;right:25%;height:28%;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.5) 0%,transparent 100%);border-radius:50%;pointer-events:none}
.welcome-close:active{transform:scale(.88);box-shadow:inset 0 1rpx 4rpx rgba(0,0,0,0.08);background:rgba(0,0,0,0.04)}
.welcome-steps{display:flex;align-items:center;gap:12rpx;justify-content:center}
.w-step{display:flex;align-items:center;gap:8rpx}
.ws-num{width:44rpx;height:44rpx;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 50%,rgba(0,0,0,0.06) 100%),var(--amber);color:#FFF;font-size:24rpx;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2rpx 0 rgba(192,104,52,0.5),0 2rpx 6rpx rgba(224,123,62,0.15)}
.ws-text{font-size:22rpx;color:var(--ink-md);line-height:1.4}
.ws-hl{color:var(--amber);font-weight:600}
.ws-arrow{font-size:24rpx;color:var(--ink-lt)}

.twins{position:relative;z-index:1;display:flex;align-items:flex-start;margin-bottom:20rpx}
.twin-card{position:relative}
.twin-card:active{transform:scale(.96);transition:transform .2s var(--ease-bounce)}
.twin-card.card-a{flex:52;z-index:2;padding-right:0}
.twin-card.card-b{flex:48;z-index:1;margin-left:-24rpx;margin-top:8rpx}
.card-surface{padding:28rpx 20rpx 22rpx;border-radius:8rpx 24rpx 8rpx 24rpx;position:relative;box-shadow:0 2rpx 12rpx rgba(45,35,24,0.04),0 1rpx 0 rgba(45,35,24,0.02)}
.card-a .card-surface{background:linear-gradient(175deg,var(--amber-lt) 0%,rgba(224,123,62,0.03) 100%);border:1.5px solid rgba(224,123,62,0.1);transform:rotate(-1.2deg)}
.card-b .card-surface{background:linear-gradient(185deg,var(--rose-lt) 0%,rgba(192,133,82,0.03) 100%);border:1.5px solid rgba(192,133,82,0.1);transform:rotate(1.5deg)}
.avatar-ring{width:88rpx;height:88rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12rpx;transition:transform .3s var(--ease-bounce);position:relative;overflow:hidden}
.twin-card:active .avatar-ring{transform:scale(1.08)}
.card-a .avatar-ring{background:var(--amber-md)}
.card-b .avatar-ring{background:var(--rose-md)}
.avatar-ring.pulsing::before{content:'';position:absolute;top:-6rpx;right:-6rpx;bottom:-6rpx;left:-6rpx;border-radius:50%;border:2rpx solid var(--mint);opacity:.45;animation:ringPulse 2.5s ease-in-out infinite}
.avatar-image{width:84rpx;height:84rpx;border-radius:50%;object-fit:cover}
.avatar-status{position:absolute;bottom:2rpx;right:2rpx;width:32rpx;height:32rpx;border-radius:50%;background:var(--paper);border:2rpx solid var(--cream);font-size:20rpx;display:flex;align-items:center;justify-content:center;z-index:2;box-shadow:0 1rpx 4rpx rgba(0,0,0,0.1)}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.1);opacity:.8}}
.avatar-emoji{font-size:44rpx}

.twin-name{font-family:var(--font-journal);font-size:30rpx;font-weight:700;color:var(--ink);text-align:center;display:block;margin-bottom:4rpx}
.twin-status-row{text-align:center}
.status-live{font-size:22rpx;color:var(--mint);font-weight:600}
.status-recent{font-size:22rpx;color:var(--ink-md)}
.status-warn{color:var(--gold)!important;font-weight:600}
.status-urgent{color:var(--twin-danger)!important;font-weight:700}
.status-tap{font-size:22rpx;color:var(--ink-lt)}
.sticker-zone{position:relative;z-index:1;margin-bottom:20rpx}

/* === 双宝今日对比微卡片 === */
.twin-compare{margin:8rpx 0 20rpx;padding:16rpx 24rpx;background:var(--cream);border-radius:12rpx 4rpx 12rpx 4rpx;border:1.5px solid var(--dot);position:relative;z-index:1}
.twin-compare::before{content:'';position:absolute;top:-6rpx;left:24rpx;width:40rpx;height:12rpx;background:rgba(224,123,62,0.15);border-radius:0 0 4rpx 4rpx}
.tc-row{display:flex;height:12rpx;border-radius:6rpx;overflow:hidden;margin-bottom:10rpx;background:var(--dot)}
.tc-bar{height:100%;transition:width .5s var(--ease-soft)}
.tc-bar-a{background:linear-gradient(90deg,var(--amber),var(--amber-lt))}
.tc-bar-b{background:linear-gradient(90deg,var(--terracotta-lt,rgba(192,133,82,0.3)),var(--terracotta))}
.tc-labels{display:flex;justify-content:space-between;align-items:center}
.tc-label{font-size:20rpx;font-family:var(--font-journal);font-weight:600}
.tc-label-a{color:var(--amber)}
.tc-label-b{color:var(--terracotta)}
.tc-sync{font-size:18rpx;color:var(--gold);font-family:var(--font-journal);padding:2rpx 10rpx;background:rgba(200,153,62,0.1);border-radius:8rpx}

/* 记录空窗提醒 — 温和手帐便签 */
.gap-nudge{display:flex;align-items:center;gap:12rpx;padding:16rpx 20rpx;margin-bottom:16rpx;background:linear-gradient(135deg,rgba(79,174,110,0.08),rgba(79,174,110,0.02));border-radius:12rpx;border:1.5rpx dashed rgba(79,174,110,0.25);position:relative;z-index:1;animation:cardFloatIn .5s var(--ease-page) both}
.gap-nudge:active{transform:scale(.97);background:rgba(79,174,110,0.12)}
.gn-emoji{font-size:36rpx;flex-shrink:0}
.gn-body{flex:1;display:flex;flex-direction:column;gap:4rpx}
.gn-title{font-family:var(--font-journal);font-size:26rpx;font-weight:600;color:var(--ink)}
.gn-desc{font-size:22rpx;color:var(--ink-md)}
.gn-arrow{font-size:28rpx;color:var(--mint);font-weight:700}

/* 「该喂了」提醒 */
.feed-reminder{display:flex;align-items:center;gap:8rpx;padding:12rpx 18rpx;margin-bottom:12rpx;background:linear-gradient(135deg,rgba(224,123,62,0.08),rgba(224,123,62,0.03));border-radius:12rpx;border:1.5rpx solid rgba(224,123,62,0.15);position:relative;z-index:1}
.fr-emoji{font-size:28rpx;flex-shrink:0}
.fr-text{font-size:22rpx;color:var(--ink-md);font-family:var(--font-journal)}
.fr-amber{color:var(--amber);font-weight:700}
.fr-terracotta{color:var(--terracotta);font-weight:700}

/* === 紧凑今日时间线 === */
.today-timeline{margin-bottom:16rpx;position:relative;z-index:1}
.tt-header{display:flex;justify-content:space-between;align-items:center;padding:12rpx 18rpx;background:var(--cream);border-radius:12rpx;border:1.5px solid var(--dot);box-shadow:0 1rpx 4rpx rgba(0,0,0,0.03);transition:all .15s var(--ease-stamp)}
.tt-header:active{transform:scale(.98);background:var(--amber-lt);border-color:var(--amber)}
.tt-title{font-family:var(--font-journal);font-size:24rpx;color:var(--ink);font-weight:600}
.tt-toggle{font-size:20rpx;color:var(--ink-md)}
.tt-list{margin-top:8rpx;display:flex;flex-direction:column;gap:4rpx}
.tt-item{display:flex;align-items:center;gap:8rpx;padding:10rpx 14rpx;background:rgba(254,249,240,0.7);border-radius:8rpx;border:1px solid var(--dot)}
.tt-item:active{background:rgba(212,112,107,0.08)}
.tti-emoji{font-size:24rpx;flex-shrink:0}
.tti-baby{font-size:22rpx;font-weight:600;flex-shrink:0;min-width:56rpx}
.tti-type{font-size:22rpx;color:var(--ink-md);flex:1}
.tti-time{font-size:20rpx;color:var(--ink-lt);flex-shrink:0}
.quick-ref{display:flex;gap:16rpx;flex-wrap:wrap;justify-content:center;margin-bottom:20rpx;position:relative;z-index:1}
.qr-item{display:flex;align-items:center;gap:8rpx;padding:10rpx 18rpx;background:linear-gradient(180deg,rgba(255,255,255,0.5) 0%,transparent 40%,rgba(0,0,0,0.02) 100%),var(--cream);border-radius:var(--radius-sm);border:2rpx solid var(--dot);box-shadow:0 1rpx 0 rgba(0,0,0,0.03),0 2rpx 4rpx rgba(0,0,0,0.02);transform:rotate(-0.3deg)}
.qr-item:nth-child(2n){transform:rotate(0.4deg)}
.qr-emoji{font-size:26rpx}
.qr-text{font-size:24rpx;color:var(--ink-md);font-weight:500}

.action-center{display:flex;align-items:center;justify-content:center;position:relative;z-index:1;margin-bottom:28rpx}
.main-btn{width:300rpx;height:300rpx;border-radius:48% 52% 46% 54% / 52% 48% 54% 46%;position:relative;z-index:2;background:var(--amber);border:none;color:#FFF;font-family:var(--font-journal);box-shadow:0 20rpx 56rpx rgba(224,123,62,0.2),0 6rpx 12rpx rgba(224,123,62,0.1),inset 0 3rpx 0 rgba(255,255,255,.2),inset 0 -6rpx 12rpx rgba(0,0,0,.06);transform:rotate(-2deg);transition:transform .18s var(--ease-bounce),box-shadow .18s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10rpx;}
.main-btn::after{content:'';position:absolute;top:14rpx;left:22%;right:22%;height:32%;background:radial-gradient(ellipse at center,rgba(255,255,255,.25) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.main-btn:active{transform:rotate(-2deg)scale(.86);box-shadow:0 6rpx 20rpx rgba(224,123,62,.16),0 2rpx 4rpx rgba(224,123,62,.08)}

/* gap-nudge 替代按钮：绿色提醒版 */
.gap-btn{background:linear-gradient(135deg,rgba(79,174,110,0.85),var(--mint))!important;box-shadow:0 20rpx 56rpx rgba(79,174,110,0.2),0 6rpx 12rpx rgba(79,174,110,0.1),inset 0 3rpx 0 rgba(255,255,255,.2),inset 0 -6rpx 12rpx rgba(0,0,0,.06)!important;flex-direction:column!important;gap:2rpx!important;border:none!important}
.gap-btn::after{content:'';position:absolute;top:14rpx;left:22%;right:22%;height:32%;background:radial-gradient(ellipse at center,rgba(255,255,255,.25) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.gap-btn:active{transform:rotate(-2deg)scale(.86);box-shadow:0 6rpx 20rpx rgba(79,174,110,.16),0 2rpx 4rpx rgba(79,174,110,.08)}
.gn-sub{font-size:22rpx;font-weight:400;opacity:.85;position:relative;z-index:1}

.pen-image{width:56rpx;height:56rpx;z-index:1}

.btn-text{font-size:32rpx;font-weight:700;letter-spacing:2rpx;position:relative;z-index:1}

.quick-bar{display:flex;gap:12rpx;justify-content:center;position:relative;z-index:1;margin-bottom:20rpx;align-items:center}
.q-chip{padding:16rpx 24rpx;border-radius:var(--radius-md);font-size:24rpx;font-weight:600;background:linear-gradient(180deg,rgba(255,255,255,0.5) 0%,transparent 40%,rgba(0,0,0,0.02) 100%),var(--cream);border:1.5px solid var(--dot);color:var(--ink-md);box-shadow:0 1.5rpx 0 rgba(0,0,0,0.03),0 2rpx 4rpx rgba(0,0,0,0.02);transition:all .15s var(--ease-stamp)}
.q-chip:active{transform:scale(.9);background:var(--amber-lt);border-color:var(--amber);color:var(--amber);box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.05)}
.q-chip.q-primary{padding:18rpx 32rpx;font-size:26rpx;background:linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 55%,rgba(0,0,0,0.03) 100%),var(--amber-lt);border-color:var(--amber);color:var(--amber);box-shadow:0 2rpx 0 rgba(224,123,62,0.2),0 3rpx 6rpx rgba(224,123,62,0.1)}
.q-chip.q-primary:active{box-shadow:inset 0 1rpx 3rpx rgba(224,123,62,0.1)}
/* 盖章反馈 — dualRecord 触发时播放 stampDown 动画 */
.chip-stamped{animation:stampDown .5s var(--ease-stamp) both}
.duty-card{display:flex;gap:8rpx;justify-content:center;position:relative;z-index:1;margin-bottom:20rpx;flex-wrap:wrap}

/* 快速参数选择 — 记录创建后出现的细化药丸 */
.detail-pills {
  display: flex;
  gap: 10rpx;
  justify-content: center;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
  animation: cardFloatIn .35s var(--ease-page) both;
}
.dp-chip {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 18rpx;
  border-radius: 24rpx;
  background: var(--paper);
  border: 1.5px solid var(--dot);
  font-size: 22rpx;
  color: var(--ink-md);
  transition: all .15s var(--ease-stamp);
}
.dp-chip:active {
  transform: scale(.92);
  border-color: var(--amber);
  color: var(--amber);
  background: var(--amber-lt);
}
.dp-emoji { font-size: 24rpx; }
.dp-label { font-family: var(--font-journal); font-weight: 600; }
.dp-dismiss {
  border-color: transparent;
  background: transparent;
  opacity: 0.5;
  padding: 10rpx 14rpx;
}

/* compact 底部导航（育儿嫂等） */
.compact-footer{display:flex;justify-content:center;gap:16rpx;margin-top:20rpx;margin-bottom:12rpx;position:relative;z-index:1}

/* journal-nav — 手帳导航横条 */
.journal-nav{display:flex;justify-content:space-around;padding:16rpx 32rpx;margin-bottom:16rpx;position:relative;z-index:1}
.jn-item{display:flex;flex-direction:column;align-items:center;gap:4rpx;padding:8rpx 16rpx;transition:transform .15s var(--ease-stamp)}
.jn-item:active{transform:scale(.92)}
.jn-emoji{font-size:36rpx}
.jn-label{font-size:22rpx;color:var(--ink-md);font-family:var(--font-journal)}

.footer-tools{display:flex;flex-direction:column;align-items:center;gap:12rpx;margin-bottom:12rpx;position:relative;z-index:1}
.ft-invite{width:100%;max-width:560rpx;padding:16rpx 0;background:linear-gradient(135deg,var(--amber-lt),var(--rose-lt));border:2rpx solid var(--dot);border-radius:20rpx;font-size:24rpx;font-weight:600;color:var(--ink);line-height:1.4;box-shadow:0 2rpx 0 rgba(0,0,0,0.03),0 3rpx 8rpx rgba(0,0,0,0.03);transition:all .15s var(--ease-stamp)}
.ft-invite::after{border:none}
.ft-invite:active{opacity:.7;transform:scale(.97);box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.04)}
.ft-row{display:flex;gap:12rpx}
.ft-link{font-size:20rpx;color:var(--ink-lt)}.ft-link:active{color:var(--amber)}.ft-dot{font-size:20rpx;color:var(--ink-lt)}
.disclaimer-note{display:block;text-align:center;font-size:18rpx;color:var(--ink-lt);margin-bottom:16rpx;opacity:.5;position:relative;z-index:1}

.celebrate-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(45,35,24,.45);display:flex;align-items:center;justify-content:center;z-index:999;animation:fadeIn .3s var(--ease-soft)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.celebrate-card{background:var(--paper);border-radius:var(--radius-lg);padding:64rpx 48rpx 48rpx;text-align:center;margin:0 48rpx;box-shadow:0 16rpx 48rpx rgba(45,35,24,.15);animation:cornerFold .55s var(--ease-page) both}
.celebrate-emoji{font-size:120rpx;display:block;margin-bottom:16rpx}
.celebrate-title{display:block;font-family:var(--font-journal);font-size:44rpx;color:var(--ink);font-weight:700}
.celebrate-desc{display:block;font-size:28rpx;color:var(--ink-md);margin-top:12rpx;line-height:1.5}
.celebrate-stars{margin-top:24rpx;display:flex;gap:16rpx;justify-content:center}
.cs{font-size:48rpx;animation:starSpin 1s ease-in-out infinite}
.cs:nth-child(2){animation-delay:.2s;font-size:56rpx}
.cs:nth-child(3){animation-delay:.4s}
@keyframes starSpin{0%,100%{transform:rotate(0)scale(1)}50%{transform:rotate(15deg)scale(1.2)}}
.milestone-action-btn{margin-top:28rpx;width:100%;padding:22rpx 0;background:linear-gradient(180deg,rgba(255,255,255,0.16) 0%,transparent 55%,rgba(0,0,0,0.05) 100%),var(--amber);color:#FFF;border:none;border-radius:var(--radius-full);font-size:30rpx;font-weight:700;box-shadow:0 3rpx 0 rgba(192,104,52,0.5),0 4rpx 8rpx rgba(0,0,0,0.06),0 8rpx 20rpx rgba(224,123,62,0.2);transition:all .15s var(--ease-stamp)}
.milestone-action-btn::after{border:none}
.milestone-action-btn:active{transform:scale(.94);box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.1),0 1rpx 0 rgba(192,104,52,0.4)}
.invite-actions{margin-top:32rpx;display:flex;flex-direction:column;gap:16rpx}
.invite-accept{width:100%;padding:24rpx 0;background:linear-gradient(180deg,rgba(255,255,255,0.16) 0%,transparent 55%,rgba(0,0,0,0.05) 100%),var(--amber);color:#FFF;border:none;border-radius:var(--radius-full);font-size:30rpx;font-weight:700;box-shadow:0 3rpx 0 rgba(192,104,52,0.5),0 4rpx 8rpx rgba(0,0,0,0.06),0 8rpx 20rpx rgba(224,123,62,0.2);transition:all .15s var(--ease-stamp)}
.invite-accept::after{border:none}
.invite-accept:active{transform:scale(.94);box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.1)}
.invite-decline{width:100%;padding:16rpx 0;background:transparent;color:var(--ink-md);border:none;font-size:24rpx;transition:all .15s var(--ease-soft)}
.invite-decline::after{border:none}
.invite-decline:active{color:var(--ink);background:rgba(0,0,0,0.03);border-radius:var(--radius-sm)}

.journal-footer-text{display:block;text-align:right;font-size:18rpx;color:var(--ink-lt);margin-bottom:20rpx;padding-right:8rpx;position:relative;z-index:1}

/* 角色抽屉 */
.drawer-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(45,35,24,.4);z-index:1000}
.drawer-sheet{position:absolute;bottom:0;left:0;right:0;background:var(--paper);border-radius:28rpx 28rpx 0 0;padding:0 28rpx calc(40rpx + env(safe-area-inset-bottom));max-height:70vh;overflow-y:auto}
.drawer-handle{width:64rpx;height:6rpx;background:var(--dot);border-radius:3rpx;margin:16rpx auto 24rpx}
.drawer-title{display:block;font-family:var(--font-journal);font-size:36rpx;color:var(--ink);text-align:center;margin-bottom:24rpx;font-weight:700}
.drawer-roles{display:flex;flex-direction:column;gap:4rpx}
.drawer-role{display:flex;align-items:center;gap:16rpx;padding:24rpx 16rpx;border-radius:var(--radius-md)}
.drawer-role:active{background:var(--cream)}
.drawer-role.drawer-danger .dr-label{color:var(--twin-danger)}
.dr-emoji{font-size:44rpx;flex-shrink:0}
.dr-body{flex:1;display:flex;flex-direction:column;gap:4rpx}
.dr-label{font-size:30rpx;font-weight:600;color:var(--ink)}
.dr-desc{font-size:22rpx;color:var(--ink-md)}
.dr-check{font-size:28rpx;color:var(--mint);font-weight:700}
.drawer-divider{height:2rpx;background:var(--dot);margin:16rpx 0}
.drawer-cancel{text-align:center;padding:24rpx 0 8rpx;font-size:28rpx;color:var(--ink-md)}
</style>
