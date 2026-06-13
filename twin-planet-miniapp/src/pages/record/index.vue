<!-- 宇宙记录 v3 · 手势优先 -->
<template>
  <view class="record-page" :class="stateClass">
    <CosmicStarfield />

    <!-- === 空闲态：双星 + 操作网格 === -->
    <view class="idle-section" v-show="!recordsStore.isRunning">
      <view class="select-zone">
        <view class="select-card" v-for="(twin, i) in twins" :key="twin.id"
          :class="{ active: selectedBaby === twin.id }" @click="selectedBaby = twin.id">
          <PlanetOrb :size="90" :color="i === 0 ? '#FF6B35' : '#A855F7'"
            :initial-text="(twin.nickname || twin.name).charAt(0)"
            :glowing="selectedBaby === twin.id" :twin="i === 0 ? 'a' : 'b'" />
          <text class="select-name">{{ twin.nickname || twin.name }}</text>
        </view>
      </view>

      <view class="action-grid">
        <view v-for="act in actions" :key="act.type" class="action-card" @click="doAction(act.type)">
          <text class="act-emoji">{{ act.emoji }}</text>
          <text class="act-label">{{ act.label }}</text>
        </view>
      </view>

      <view class="retro-row">
        <text class="retro-label">刚才忘了？</text>
        <view class="retro-chips">
          <text v-for="m in [5,10,20,30]" :key="m" class="retro-chip" @click="retroRecord(m)">{{ m }}分钟前</text>
        </view>
      </view>
    </view>

    <!-- === 运行态：计时器（单/双统一） === -->
    <view class="running-section" v-show="recordsStore.isRunning">
      <!-- 单计时 -->
      <view class="timer-hero" v-if="recordsStore.runningTimers.length === 1">
        <view class="hero-planet"
          @touchstart="onPlanetTouchStart($event, recordsStore.runningTimer!.babyId)"
          @touchmove="onPlanetTouchMove"
          @touchend="onPlanetTouchEnd(recordsStore.runningTimer!.babyId)">
          <PlanetOrb :size="200"
            :color="runningColor"
            :initial-text="runningName.charAt(0)" :label="runningName"
            :running="true" :atmosphere="true"
            :atmosphere-type="runningType === 'feeding' ? 'green' : (runningTwin === 'a' ? 'a' : 'b')"
            :glowing="true" :twin="runningTwin"
            :orbit-ring="orbitProgress" />
        </view>
        <text class="timer-label-poetic">{{ poeticLabel }}</text>
        <text class="timer-elapsed-sub">{{ formatElapsed(runningElapsed) }}</text>
        <button class="stop-btn" @click="stopOne(recordsStore.runningTimer!.babyId)">✦ 停止</button>
      </view>

      <!-- 双计时 -->
      <view class="dual-zone" v-else>
        <view class="dual-card" v-for="t in recordsStore.runningTimers" :key="t.babyId">
          <PlanetOrb :size="140"
            :color="t.babyId === twins[0]?.id ? '#FF6B35' : '#A855F7'"
            :initial-text="getName(t.babyId).charAt(0)" :label="getName(t.babyId)"
            :running="true" :atmosphere="true"
            :atmosphere-type="t.type === 'feeding' ? 'green' : (t.babyId === twins[0]?.id ? 'a' : 'b')"
            :twin="t.babyId === twins[0]?.id ? 'a' : 'b'"
            :orbit-ring="getDualOrbitProgress(t)" />
          <text class="dual-elapsed">{{ formatElapsed(t.elapsed) }}</text>
          <button class="stop-sm" @click="stopOne(t.babyId)">停止</button>
        </view>
      </view>
      <button class="stop-all" v-if="recordsStore.runningTimers.length >= 2" @click="stopAll">✦ 全部停止</button>
    </view>

    <!-- === 完成粒子 === -->
    <StardustParticles :count="14" color="mixed" :trigger="stardustTrigger" />

    <!-- 今日轨迹 -->
    <view class="timeline" v-if="recentLogs.length && !recordsStore.isRunning">
      <view class="tl-item" v-for="log in recentLogs.slice(0, 8)" :key="log.id">
        <view class="tl-dot" :style="{ background: log.babyId === twins[0]?.id ? '#FF6B35' : '#A855F7' }" />
        <text class="tl-text">{{ log.detail }}</text>
        <text class="tl-time">{{ timeAgo(log.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore, type RecordType } from '@/stores/records'
import CosmicStarfield from '@/components/cosmic/CosmicStarfield.vue'
import PlanetOrb from '@/components/cosmic/PlanetOrb.vue'
import StardustParticles from '@/components/cosmic/StardustParticles.vue'

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const selectedBaby = ref<string>('')
const stardustTrigger = ref(0)

const twins = computed(() => [babiesStore.babyA, babiesStore.babyB].filter(Boolean))

const actions = [
  { type: 'feeding' as RecordType, emoji: '🍼', label: '喂奶' },
  { type: 'sleep' as RecordType, emoji: '😴', label: '睡觉' },
  { type: 'diaper' as RecordType, emoji: '🧷', label: '尿布' },
  { type: 'temperature' as RecordType, emoji: '🌡️', label: '体温' },
  { type: 'medicine' as RecordType, emoji: '💊', label: '用药' },
  { type: 'bath' as RecordType, emoji: '🛁', label: '洗澡' },
]

// ---- Timer tick ----
const timerTick = ref(0)
let tickHandle: ReturnType<typeof setInterval> | null = null
watch(() => recordsStore.isRunning, (r) => {
  if (r) tickHandle = setInterval(() => { timerTick.value++ }, 1000)
  else { if (tickHandle) { clearInterval(tickHandle); tickHandle = null } }
}, { immediate: true })
onUnmounted(() => { if (tickHandle) clearInterval(tickHandle) })

const runningElapsed = computed(() => { timerTick.value; return recordsStore.runningTimer?.elapsed ?? 0 })
const runningName = computed(() => { const t = recordsStore.runningTimer; return t ? getName(t.babyId) : '' })
const runningColor = computed(() => recordsStore.runningTimer?.babyId === twins.value[0]?.id ? '#FF6B35' : '#A855F7')
const runningTwin = computed(() => (recordsStore.runningTimer?.babyId === twins.value[0]?.id ? 'a' : 'b') as 'a' | 'b')
const runningType = computed(() => recordsStore.runningTimer?.type)

// ---- Poetic time ----
const FEEDING_PHASES = [
  { m: 2, l: '刚刚开始' },{ m: 5, l: '星光降临' },{ m: 10, l: '航行中' },
  { m: 15, l: '渐入佳境' },{ m: 20, l: '即将圆满' },{ m: 999, l: '星光已满' },
]
const SLEEP_PHASES = [
  { m: 2, l: '刚刚入眠' },{ m: 5, l: '星尘落下' },{ m: 10, l: '梦乡深处' },
  { m: 15, l: '星际漫游' },{ m: 20, l: '安心航行' },{ m: 30, l: '深空长夜' },
  { m: 45, l: '星河漫渡' },{ m: 999, l: '继续守护' },
]
const poeticLabel = computed(() => {
  const phases = runningType.value === 'sleep' ? SLEEP_PHASES : FEEDING_PHASES
  const min = runningElapsed.value / 60
  for (const p of phases) { if (min < p.m) return p.l }
  return phases[phases.length - 1].l
})
const orbitProgress = computed(() => {
  const target = runningType.value === 'sleep' ? 60 : 20
  return (runningElapsed.value / 60) % target / target
})
function getDualOrbitProgress(t: { elapsed: number; type: RecordType }) {
  const target = t.type === 'sleep' ? 60 : 20
  return (t.elapsed / 60) % target / target
}

// ---- State class ----
const stateClass = computed(() => {
  if (!recordsStore.isRunning) return 'state-idle'
  return recordsStore.runningTimers.length >= 2 ? 'state-dual' : 'state-single'
})

// ---- Long-press for stop (on running planet) ----
const pressTimer = ref(0)
const isPressing = ref(false)
function onPlanetTouchStart(_e: any, babyId: string) {
  isPressing.value = true
  pressTimer.value = Date.now()
}
function onPlanetTouchMove() { isPressing.value = false }
function onPlanetTouchEnd(babyId: string) {
  if (!isPressing.value) return
  const held = Date.now() - pressTimer.value
  isPressing.value = false
  if (held >= 500) {
    // Long press → supernova stop
    stardustTrigger.value++
    stopOne(babyId)
  }
  // Short tap is ignored on running planet (prevents accidental stop)
}

// ---- Actions ----
function getName(id: string) { return twins.value.find(b => b.id === id)?.nickname || twins.value.find(b => b.id === id)?.name || '' }

function doAction(type: RecordType) {
  const id = selectedBaby.value || twins.value[0]?.id; if (!id) return
  if (type === 'feeding' || type === 'sleep') {
    recordsStore.startTimer(id, type)
  } else {
    recordsStore.quickLog(id, type)
    stardustTrigger.value++
    uni.showToast({ title: '已记录', icon: 'success', duration: 1000 })
  }
}

function retroRecord(m: number) {
  const id = selectedBaby.value || twins.value[0]?.id; if (!id) return
  recordsStore.quickLog(id, 'feeding')
  uni.showToast({ title: `已补记 ${m} 分钟前`, icon: 'success', duration: 1000 })
}

function stopOne(id: string) {
  const log = recordsStore.stopTimer(id)
  if (log) {
    stardustTrigger.value++
    setTimeout(() => {
      uni.showToast({ title: `${log.babyName} · ${poeticLabel.value} · ${log.durationMin}分钟 ✦`, icon: 'none', duration: 2000 })
    }, 400)
  } else {
    uni.showToast({ title: '不足1分钟', icon: 'none', duration: 1000 })
  }
}
function stopAll() {
  let c = 0; for (const t of recordsStore.runningTimers) { if (recordsStore.stopTimer(t.babyId)) c++ }
  stardustTrigger.value++
  uni.showToast({ title: `双星同步 · ${c} 条已保存 ✦`, icon: 'none', duration: 2000 })
}

function formatElapsed(s: number) { const m = Math.floor(s/60); return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` }
function timeAgo(ts: number) { const d = Math.floor((Date.now()-ts)/60000); if (d<1) return '刚刚'; if (d<60) return `${d}分钟前`; return `${Math.floor(d/60)}小时前` }

const todayStart = new Date().setHours(0,0,0,0)
const recentLogs = computed(() => recordsStore.logs.filter(l => l.createdAt >= todayStart).sort((a,b) => b.createdAt - a.createdAt))

onMounted(() => {
  uni.setNavigationBarTitle({ title: '宇宙记录' })
  if (twins.value[0]) selectedBaby.value = twins.value[0].id
})
</script>

<style scoped>
.record-page { min-height: 100vh; background: var(--cosmic-void); padding: 40rpx 32rpx calc(80rpx + env(safe-area-inset-bottom)); position: relative; }

/* === 选择区 === */
.select-zone { display: flex; justify-content: center; gap: 56rpx; margin-bottom: 36rpx; position: relative; z-index: 1; }
.select-card { display: flex; flex-direction: column; align-items: center; gap: 10rpx; opacity: 0.45; transition: opacity 0.25s; }
.select-card.active { opacity: 1; }
.select-name { font-size: var(--font-body); font-weight: 600; color: var(--text-starlight); }

/* === 操作网格 === */
.action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18rpx; margin-bottom: 28rpx; position: relative; z-index: 1; }
.action-card { display: flex; flex-direction: column; align-items: center; gap: 6rpx; padding: 28rpx 10rpx; background: var(--surface-card); border: 1rpx solid var(--border-void); border-radius: var(--radius-xl); transition: transform 0.12s, border-color 0.2s; }
.action-card:active { transform: scale(0.95); border-color: var(--cosmic-cyan); }
.act-emoji { font-size: 34rpx; }
.act-label { font-size: var(--font-body); color: var(--text-starlight); font-weight: 500; }

/* === 回溯 === */
.retro-row { display: flex; align-items: center; justify-content: center; gap: 12rpx; position: relative; z-index: 1; flex-wrap: wrap; }
.retro-label { font-size: var(--font-caption); color: var(--text-whisper); }
.retro-chip { font-size: var(--font-caption); color: var(--text-dust); padding: 8rpx 20rpx; background: var(--surface-card); border: 1rpx solid var(--border-void); border-radius: var(--radius-full); }
.retro-chip:active { border-color: var(--cosmic-cyan); }

/* === 计时器 === */
.timer-hero { display: flex; flex-direction: column; align-items: center; padding: 32rpx 0; position: relative; z-index: 1; }
.hero-planet { transition: transform 0.2s; }
.hero-planet:active { transform: scale(0.96); }
.timer-label-poetic { font-size: var(--font-subtitle); color: var(--cosmic-cyan); margin-top: 24rpx; font-weight: 500; letter-spacing: 2rpx; }
.timer-elapsed-sub { font-size: var(--font-caption); color: var(--text-whisper); margin-top: 4rpx; }
.stop-btn { margin-top: 28rpx; padding: 20rpx 56rpx; background: transparent; border: 2rpx solid var(--cosmic-red); border-radius: var(--radius-full); color: var(--cosmic-red); font-size: var(--font-body); font-weight: 500; }
.stop-btn:active { background: rgba(255,77,106,0.08); }

/* === 双计时 === */
.dual-zone { display: flex; gap: 20rpx; margin-bottom: 16rpx; position: relative; z-index: 1; }
.dual-card { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 14rpx; padding: 24rpx 10rpx; background: var(--surface-card); border: 2rpx solid var(--border-void); border-radius: var(--radius-xl); }
.dual-elapsed { font-size: 40rpx; font-weight: 300; color: var(--text-starlight); letter-spacing: 2rpx; }
.stop-sm { padding: 10rpx 28rpx; background: transparent; border: 2rpx solid var(--cosmic-red); border-radius: var(--radius-full); font-size: var(--font-caption); color: var(--cosmic-red); }
.stop-sm:active { background: rgba(255,77,106,0.08); }
.stop-all { width: 100%; padding: 20rpx; margin-top: 12rpx; background: transparent; border: 2rpx solid var(--cosmic-red); border-radius: var(--radius-full); font-size: var(--font-body); color: var(--cosmic-red); position: relative; z-index: 1; }

/* === 时间线 === */
.timeline { padding-top: 24rpx; position: relative; z-index: 1; }
.tl-item { display: flex; align-items: center; gap: 14rpx; padding: 12rpx 0; }
.tl-dot { width: 8rpx; height: 8rpx; border-radius: 50%; flex-shrink: 0; }
.tl-text { flex: 1; font-size: var(--font-body); color: var(--text-starlight); }
.tl-time { font-size: var(--font-caption); color: var(--text-whisper); flex-shrink: 0; }
</style>
