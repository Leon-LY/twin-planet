<!-- 双宝广场 — 发现页 v2：周报+功能入口+成就动态 -->
<template>
  <view class="discover-page journal-paper page-enter">
    <view class="page-header">
      <text class="page-icon">🧭</text>
      <text class="page-title">双宝广场</text>
      <text class="page-subtitle">双宝手帳的更多玩法</text>
    </view>

    <!-- 水平周条 -->
    <scroll-view scroll-x class="week-strip reveal-1">
      <view class="ws-inner">
        <view class="ws-day" :class="{ active: selectedDay === 'week' }" @click="selectedDay = 'week'">
          <text class="ws-dow">本周</text>
          <text class="ws-date">📊</text>
        </view>
        <view v-for="day in weekDays" :key="day.key"
          class="ws-day"
          :class="{ today: day.isToday, active: selectedDay === day.key }"
          @click="selectedDay = day.key">
          <text class="ws-dow">{{ day.dow }}</text>
          <text class="ws-date">{{ day.date }}</text>
          <view class="ws-dot" v-if="day.hasRecords" />
        </view>
      </view>
    </scroll-view>

    <!-- 周报模式 -->
    <template v-if="selectedDay === 'week'">

    <!-- 本周双宝周报卡片 -->
    <view class="weekly-card journal-card reveal-1">
      <view class="weekly-tape journal-tape tape-amber"></view>
      <view class="weekly-title-row">
        <text class="weekly-title">本周双宝</text>
        <text class="weekly-streak" v-if="streakDays > 0">连续 {{ streakDays }} 天</text>
      </view>
      <view class="weekly-stats">
        <view class="ws-item">
          <text class="ws-num">{{ weekStats.totalLogs }}</text>
          <text class="ws-label">总记录</text>
        </view>
        <view class="ws-divider"></view>
        <view class="ws-item">
          <text class="ws-num">{{ weekStats.stickers }}</text>
          <text class="ws-label">新贴纸</text>
        </view>
        <view class="ws-divider"></view>
        <view class="ws-item">
          <text class="ws-num">{{ weekStats.syncRate }}%</text>
          <text class="ws-label">同步率</text>
        </view>
      </view>
    </view>

    <!-- 本周大事记 — 基于记录数据自动生成 -->
    <view class="highlights-card journal-card reveal-2" v-if="weekHighlights.length">
      <view class="weekly-tape journal-tape tape-gold"></view>
      <text class="section-label">本周大事记</text>
      <view class="hl-list">
        <view class="hl-item" v-for="(h, i) in weekHighlights" :key="i" :style="{ animationDelay: (0.08 * i).toFixed(2) + 's' }">
          <text class="hl-emoji">{{ h.emoji }}</text>
          <text class="hl-text">{{ h.text }}</text>
        </view>
      </view>
    </view>

    <!-- 功能入口（手帐贴纸风格） -->
    <view class="section-label reveal-2">功能入口</view>
    <view class="feature-grid">
      <view
        v-for="(f, i) in features"
        :key="f.key"
        class="feature-card feature-enter"
        :class="`fc-rotate-${i % 3}`"
        :style="{ animationDelay: (0.06 * i).toFixed(2) + 's' }"
        @click="goPage(f.path)"
      >
        <view class="fc-tape" :class="`tape-${i % 3 === 0 ? 'amber' : i % 3 === 1 ? 'gold' : 'mint'}`"></view>
        <text class="feature-emoji">{{ f.emoji }}</text>
        <text class="feature-label">{{ f.label }}</text>
        <text class="feature-desc">{{ f.desc }}</text>
      </view>
    </view>

    <!-- 本周成就 -->
    <view class="section-label reveal-3">本周成就</view>
    <view class="achievement-strip">
      <view class="ach-item" v-for="ach in weekAchievements" :key="ach.label">
        <text class="ach-icon">{{ ach.icon }}</text>
        <text class="ach-text">{{ ach.label }}</text>
      </view>
      <view class="ach-empty" v-if="weekAchievements.length === 0">
        <text class="ach-empty-text">这周还没有成就，去记录吧~</text>
      </view>
    </view>

    </template>

    <!-- 单日模式 -->
    <template v-else>
      <view class="day-timeline reveal-2">
        <text class="dt-date-head">{{ formatFullDate(selectedDay) }}</text>
        <view class="dt-stats" v-if="dayStats.count > 0">
          <text class="dts-item">📝 {{ dayStats.count }} 条</text>
          <text class="dts-item" v-if="dayStats.ababy > 0">{{ babyA?.nickname || '大宝' }} {{ dayStats.ababy }} 条</text>
          <text class="dts-item" v-if="dayStats.bbaby > 0">{{ babyB?.nickname || '小宝' }} {{ dayStats.bbaby }} 条</text>
        </view>
        <view class="dt-list">
          <view v-for="log in dayLogs" :key="log.id" class="dt-item">
            <text class="dti-emoji">{{ LOG_EMOJI[log.type] || '📝' }}</text>
            <view class="dti-body">
              <text class="dti-line1">{{ log.babyName }} · {{ LOG_LABELS[log.type] || log.type }}</text>
              <text class="dti-line2">{{ formatTime(log.createdAt) }}</text>
            </view>
          </view>
          <view class="dt-empty" v-if="dayStats.count === 0">
            <text>这天没有记录 📭</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 底部工具 -->
    <view class="discover-tools">
      <view class="tool-card" @click="goPage('/pages/stickers/index')">
        <text class="tool-emoji iconfont icon-share"></text>
        <text class="tool-label">贴纸收集册</text>
        <text class="tool-arrow">→</text>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useRecordsStore } from '@/stores/records'
import { useStickersStore } from '@/stores/stickers'
import { useBabiesStore } from '@/stores/babies'
import { getDiscoverFeatures } from '@/config/roles'
import { trackPageView } from '@/utils/analytics'

const userStore = useUserStore()
const recordsStore = useRecordsStore()
const stickersStore = useStickersStore()
const babiesStore = useBabiesStore()
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)

interface FeatureItem {
  key: string
  label: string
  path: string
  emoji: string
  desc: string
}

const featureMeta: Record<string, { emoji: string; desc: string }> = {
  sprout: { emoji: '🌱', desc: '记录双宝的第一次互动' },
  contribution: { emoji: '💝', desc: '看见每一位家人的付出' },
  duty: { emoji: '📋', desc: '爸爸独自带娃的SOP清单' },
  guardian: { emoji: '🛡️', desc: '照顾者的精力与状态管理' },
  handover: { emoji: '🎙️', desc: '语音便签无缝交接' },
  stickers: { emoji: '⭐', desc: '收集成长路上的可爱贴纸' },
  tasks: { emoji: '✨', desc: '双宝家庭专属亲子任务' },
}

const features = computed<FeatureItem[]>(() => {
  const raw = getDiscoverFeatures(userStore.profile?.role)
  return raw.map(f => ({
    ...f,
    emoji: featureMeta[f.key]?.emoji || '📌',
    desc: featureMeta[f.key]?.desc || '',
  }))
})

// === 本周统计 ===
const streakDays = computed(() => recordsStore.streakDays)

// === 周条导航 + 单日历史 ===
const selectedDay = ref<string>('week')
const LOG_EMOJI: Record<string, string> = { feeding: '🍼', sleep: '😴', diaper: '💧', temperature: '🌡️', medicine: '💊', bath: '🛁' }
const LOG_LABELS: Record<string, string> = { feeding: '喂奶', sleep: '哄睡', diaper: '尿布', temperature: '体温', medicine: '用药', bath: '洗澡' }

const weekDays = computed(() => {
  const days: Array<{ key: string; dow: string; date: string; isToday: boolean; hasRecords: boolean }> = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const dowLabel = ['日','一','二','三','四','五','六'][d.getDay()]
    const t0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const t1 = t0 + 86400000
    days.push({
      key,
      dow: dowLabel,
      date: String(d.getDate()),
      isToday: i === 0,
      hasRecords: recordsStore.logs.some(l => l.createdAt >= t0 && l.createdAt < t1),
    })
  }
  return days
})

const dayLogs = computed(() => {
  if (selectedDay.value === 'week') return []
  const [y, m, d] = selectedDay.value.split('-').map(Number)
  const t0 = new Date(y, m-1, d).getTime()
  const t1 = t0 + 86400000
  return recordsStore.logs.filter(l => l.createdAt >= t0 && l.createdAt < t1).sort((a, b) => b.createdAt - a.createdAt)
})

const dayStats = computed(() => {
  const logs = dayLogs.value
  const aId = babyA.value?.id; const bId = babyB.value?.id
  return {
    count: logs.length,
    ababy: logs.filter(l => l.babyId === aId).length,
    bbaby: logs.filter(l => l.babyId === bId).length,
  }
})

function formatFullDate(key: string) {
  if (key === 'week') return ''
  const [y, m, d] = key.split('-').map(Number)
  const dow = ['日','一','二','三','四','五','六'][new Date(y, m-1, d).getDay()]
  return `${m}月${d}日 星期${dow}`
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
const weekStats = computed(() => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const weekLogs = recordsStore.logs.filter(l => l.createdAt >= weekAgo)
  const weekStickers = stickersStore.stickers.filter(s => s.earnedAt >= weekAgo)
  return {
    totalLogs: weekLogs.length,
    stickers: weekStickers.length,
    // 计算本周 7 天内双宝同日有记录的天数比例
    syncRate: _weekSyncRate(weekLogs),
  }
})

/** 计算最近 7 天的双宝同步率：7 天内双宝同日都有记录的天数 / 7 */
function _weekSyncRate(weekLogs: Array<{ babyId: string; createdAt: number }>): number {
  const aId = babiesStore.babyA?.id
  const bId = babiesStore.babyB?.id
  if (!aId || !bId) return 0
  let syncDays = 0
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    dayStart.setDate(dayStart.getDate() - i)
    const dayEnd = dayStart.getTime() + 86400000
    const dayLogs = weekLogs.filter(l => l.createdAt >= dayStart.getTime() && l.createdAt < dayEnd)
    const hasA = dayLogs.some(l => l.babyId === aId)
    const hasB = dayLogs.some(l => l.babyId === bId)
    if (hasA && hasB) syncDays++
  }
  return Math.round(syncDays / 7 * 100)
}

// === 本周成就 ===
const weekAchievements = computed(() => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const achievements: { icon: string; label: string }[] = []
  if (streakDays.value >= 7) achievements.push({ icon: '🔥', label: '连续7天记录' })
  if (stickersStore.stickers.filter(s => s.earnedAt >= weekAgo).length >= 5) {
    achievements.push({ icon: '⭐', label: '本周5张贴纸' })
  }
  if (weekStats.value.totalLogs >= 30) {
    achievements.push({ icon: '📝', label: '本周30条记录' })
  }
  if (weekStats.value.syncRate >= 70) {
    achievements.push({ icon: '🤝', label: '双宝同步率70%' })
  }
  return achievements
})

/** 本周大事记 — 基于记录数据自动生成叙事摘要（学自亲宝宝时间线） */
const weekHighlights = computed(() => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const weekLogs = recordsStore.logs.filter(l => l.createdAt >= weekAgo)
  const aId = babiesStore.babyA?.id
  const bId = babiesStore.babyB?.id
  if (!weekLogs.length) return [] as { emoji: string; text: string }[]

  const aName = babiesStore.babyA?.nickname || babiesStore.babyA?.name || '大宝'
  const bName = babiesStore.babyB?.nickname || babiesStore.babyB?.name || '小宝'
  const highlights: { emoji: string; text: string }[] = []

  // ① 连续记录
  if (streakDays.value >= 7) {
    highlights.push({ emoji: '🔥', text: `连续记录 ${streakDays.value} 天，太强了` })
  } else if (streakDays.value >= 3) {
    highlights.push({ emoji: '📝', text: `连续记录 ${streakDays.value} 天，保持哦` })
  }

  // ② 新贴纸
  const newStickers = stickersStore.stickers.filter(s => s.earnedAt >= weekAgo).length
  if (newStickers >= 3) {
    highlights.push({ emoji: '⭐', text: `本周解锁 ${newStickers} 张新贴纸` })
  }

  // ③ 双宝同步天数
  if (aId && bId) {
    let syncDays = 0
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = dayStart.getTime() + 86400000
      const dayLogs = weekLogs.filter(l => l.createdAt >= dayStart.getTime() && l.createdAt < dayEnd)
      if (dayLogs.some(l => l.babyId === aId) && dayLogs.some(l => l.babyId === bId)) syncDays++
    }
    if (syncDays >= 5) {
      highlights.push({ emoji: '🦊', text: `双宝同步 ${syncDays} 天，默契十足` })
    }
  }

  // ④ 喂养统计
  const totalFeeding = weekLogs.filter(l => l.type === 'feeding').length
  if (totalFeeding >= 20) {
    highlights.push({ emoji: '🍼', text: `共喂奶 ${totalFeeding} 次，辛苦啦` })
  }

  // ⑤ 睡眠差异洞察
  if (aId && bId) {
    const aSleep = weekLogs.filter(l => l.babyId === aId && l.type === 'sleep').length
    const bSleep = weekLogs.filter(l => l.babyId === bId && l.type === 'sleep').length
    if (aSleep > 0 && bSleep > 0) {
      const diff = Math.abs(aSleep - bSleep)
      if (diff >= 3) {
        const more = aSleep > bSleep ? aName : bName
        const less = aSleep > bSleep ? bName : aName
        highlights.push({ emoji: '😴', text: `${more}比${less}多睡了 ${diff} 觉` })
      }
    }
  }

  // ⑥ 记录总量
  if (weekLogs.length >= 40) {
    highlights.push({ emoji: '📊', text: `本周记录 ${weekLogs.length} 次，了不起` })
  }

  // 限 4 条，优先保留有洞察价值的
  return highlights.slice(0, 4)
})

const TAB_PAGES = ['/pages/index/index', '/pages/stickers/index', '/pages/discover/index']

function goPage(path: string) {
  if (TAB_PAGES.includes(path)) {
    uni.switchTab({ url: path })
  } else {
    uni.navigateTo({ url: path })
  }
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '双宝广场' })
  trackPageView('discover')
})

onShow(() => {
  try {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    if ((page as any)?.getTabBar) {
      (page as any).getTabBar().setData({ selected: 3 })
    }
  } catch (_) {}
})



onShareAppMessage(() => ({
  title: '🦊 双宝记 · 双宝广场',
  path: '/pages/index/index',
  imageUrl: '/static/share-brand.png',
}))
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  padding: 32rpx 32rpx calc(100rpx + env(safe-area-inset-bottom));
  position: relative;
  background: var(--paper);
  /* 水彩光斑 — 用渐变背景直接画在页面上 */
  background-image:
    radial-gradient(circle 200rpx at 85% 12%, rgba(224,123,62,0.10) 0%, transparent 70%),
    radial-gradient(circle 160rpx at 15% 70%, rgba(192,133,82,0.08) 0%, transparent 70%);
}
/* === 水平周条 === */
.week-strip{width:100%;margin-bottom:20rpx;flex-shrink:0}
.ws-inner{display:flex;gap:12rpx;padding:12rpx 4rpx}
.ws-day{display:flex;flex-direction:column;align-items:center;gap:2rpx;padding:10rpx 16rpx;border-radius:14rpx;background:var(--cream);border:1.5px solid var(--dot);min-width:80rpx;transition:all .15s var(--ease-stamp);position:relative}
.ws-day.today{border-color:var(--amber);background:var(--amber-lt)}
.ws-day.active{border-color:var(--amber);background:var(--amber);box-shadow:0 2rpx 12rpx rgba(224,123,62,0.2)}
.ws-day.active .ws-dow{color:var(--cream)}
.ws-day.active .ws-date{color:var(--cream)}
.ws-dow{font-size:18rpx;color:var(--ink-md)}
.ws-date{font-size:28rpx;font-weight:700;color:var(--ink);font-family:var(--font-journal)}
.ws-dot{width:8rpx;height:8rpx;border-radius:50%;background:var(--mint);margin-top:2rpx}

/* === 单日时间线 === */
.day-timeline{margin-bottom:28rpx}
.dt-date-head{display:block;font-family:var(--font-journal);font-size:var(--font-card);font-weight:700;color:var(--ink);margin-bottom:12rpx}
.dt-stats{display:flex;gap:16rpx;margin-bottom:16rpx}
.dts-item{font-size:22rpx;color:var(--ink-md);background:var(--cream);padding:6rpx 14rpx;border-radius:10rpx;font-family:var(--font-journal)}
.dt-list{display:flex;flex-direction:column;gap:8rpx}
.dt-item{display:flex;align-items:flex-start;gap:12rpx;padding:14rpx 16rpx;background:var(--cream);border-radius:12rpx;border:1px solid var(--dot);border-left:4rpx solid var(--amber)}
.dti-emoji{font-size:28rpx;flex-shrink:0}
.dti-body{flex:1;display:flex;flex-direction:column;gap:2rpx}
.dti-line1{font-size:24rpx;color:var(--ink);font-weight:600}
.dti-line2{font-size:20rpx;color:var(--ink-md)}
.dt-empty{text-align:center;padding:40rpx;color:var(--ink-md);font-size:24rpx}

/* 功能卡片交错入场 — 引用全局 cardFloatIn keyframe */
.feature-enter {
  animation: cardFloatIn 0.45s var(--ease-page) both;
}
/* 第一张卡片无延迟（已通过内联 style 控制） */


/* === 周报卡片 === */
.weekly-card {
  position: relative;
  background: var(--cream);
  border-radius: var(--radius-md);
  padding: 32rpx 28rpx 24rpx;
  margin-bottom: 32rpx;
  border: 1.5rpx solid var(--dot);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.weekly-tape {
  position: absolute;
  top: -8rpx;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 80rpx;
  height: 24rpx;
}
.weekly-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.weekly-title {
  font-family: var(--font-journal);
  font-size: var(--font-card);
  font-weight: 700;
  color: var(--ink);
}
.weekly-streak {
  font-size: 22rpx;
  color: var(--gold);
  font-family: var(--font-journal);
  padding: 4rpx 12rpx;
  background: rgba(200,153,62,0.12);
  border-radius: 8rpx;
}
.weekly-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.ws-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  flex: 1;
}
.ws-num {
  font-family: var(--font-journal);
  font-size: 44rpx;
  font-weight: 700;
  color: var(--amber);
}
.ws-label {
  font-size: 20rpx;
  color: var(--ink-md);
}
.ws-divider {
  width: 1rpx;
  height: 48rpx;
  background: var(--dot);
}

/* === 本周大事记卡片 === */
.highlights-card {
  position: relative;
  background: var(--cream);
  border-radius: var(--radius-md);
  padding: 28rpx 28rpx 20rpx;
  margin-bottom: 28rpx;
  border: 1.5rpx solid var(--dot);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.hl-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 8rpx;
}
.hl-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 14rpx;
  background: linear-gradient(135deg, rgba(255,255,255,0.6), var(--paper));
  border-radius: 10rpx;
  border: 1rpx solid var(--dot);
  animation: cardFloatIn .5s var(--ease-page) both;
}
.hl-emoji {
  font-size: 32rpx;
  flex-shrink: 0;
}
.hl-text {
  font-size: 24rpx;
  color: var(--ink);
  font-family: var(--font-journal);
  line-height: 1.5;
}

/* === 区段标签 === */
.section-label {
  font-family: var(--font-journal);
  font-size: var(--font-body);
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

/* === 功能入口网格 === */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 36rpx;
}
.feature-card {
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, var(--cream) 100%);
  border-radius: var(--radius-md);
  padding: 32rpx 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  border: 2rpx solid var(--dot);
  box-shadow: 0 1rpx 0 rgba(0,0,0,.03), 0 2rpx 8rpx rgba(0,0,0,.04);
  transition: all .15s var(--ease-stamp);
  overflow: hidden;
}
.feature-card:active {
  transform: scale(.97);
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,.04), 0 1rpx 0 rgba(0,0,0,.02);
}
.fc-rotate-0 { transform: rotate(-0.5deg); }
.fc-rotate-1 { transform: rotate(0.8deg); }
.fc-rotate-2 { transform: rotate(-0.3deg); }
.fc-tape {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 16rpx;
}
.fc-tape.tape-amber { background: rgba(224,123,62,0.3); }
.fc-tape.tape-gold { background: rgba(200,153,62,0.3); }
.fc-tape.tape-mint { background: rgba(79,174,110,0.3); }

.feature-emoji { width: 64rpx; height: 64rpx; margin-top: 8rpx; }
.feature-label {
  font-family: var(--font-journal);
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
}
.feature-desc {
  font-size: 22rpx;
  color: var(--ink-md);
  text-align: center;
  line-height: 1.4;
}

/* === 成就条 === */
.achievement-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 36rpx;
}
.ach-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: rgba(200,153,62,0.1);
  border: 1.5rpx solid rgba(200,153,62,0.3);
  border-radius: 20rpx;
}
.ach-icon { font-size: 24rpx; }
.ach-text {
  font-size: 22rpx;
  color: var(--gold);
  font-family: var(--font-journal);
  font-weight: 600;
}
.ach-empty {
  width: 100%;
  text-align: center;
  padding: 24rpx;
}
.ach-empty-text {
  font-size: 24rpx;
  color: var(--ink-lt);
}

/* === 底部工具 === */
.discover-tools { margin-top: 8rpx; }
.tool-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, var(--cream) 100%);
  border-radius: var(--radius-md);
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 1.5px dashed var(--dot);
  box-shadow: 0 1rpx 0 rgba(0,0,0,.03);
}
.tool-card:active { background: var(--amber-lt); border-color: var(--amber); }
.tool-emoji { font-size: 36rpx; }
.tool-label { font-size: 26rpx; font-weight: 600; color: var(--ink); flex: 1; }
.tool-arrow { font-size: 28rpx; color: var(--ink-md); }
</style>
