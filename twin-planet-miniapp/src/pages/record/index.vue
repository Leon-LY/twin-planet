<!-- 宇宙记录 · Cosmic Record -->
<template>
  <view class="record-page">
    <CosmicStarfield />

    <!-- ============================================================
         空闲态：双星选择 + 操作网格
         ============================================================ -->
    <template v-if="!recordsStore.isRunning">
      <!-- 双星选择 -->
      <view class="planet-select">
        <view class="planet-slot" v-for="(twin, i) in twins" :key="twin.id" @click="selectBaby = twin.id">
          <PlanetOrb
            :size="selectedBaby === twin.id ? 130 : 100"
            :color="i === 0 ? '#FF6B35' : '#A855F7'"
            :initial-text="(twin.nickname || twin.name).charAt(0)"
            :label="twin.nickname || twin.name"
            :glowing="selectedBaby === twin.id"
            :twin="i === 0 ? 'a' : 'b'"
          />
          <text class="slot-status" v-if="getLastLog(twin.id)">{{ getLastLog(twin.id)!.detail }}</text>
          <text class="slot-status muted" v-else>轻触记录</text>
        </view>
      </view>

      <!-- 操作网格 2×3 -->
      <view class="action-grid">
        <view v-for="act in actions" :key="act.type" class="action-card" :class="'act-' + act.type" @click="doAction(act.type)">
          <text class="act-emoji">{{ act.emoji }}</text>
          <text class="act-label">{{ act.label }}</text>
          <text class="act-hint">{{ act.hint }}</text>
        </view>
      </view>

      <!-- 双星同步 -->
      <view class="dual-bar" v-if="twins.length >= 2">
        <view class="dual-chip" @click="dualRecord('feeding')"><text>🍼 两个都喂了</text></view>
        <view class="dual-chip" @click="dualRecord('sleep')"><text>😴 都睡了</text></view>
        <view class="dual-chip" @click="dualRecord('diaper')"><text>🧷 都换了</text></view>
      </view>

      <!-- 时空修正 -->
      <view class="retro-bar">
        <text class="caption" style="margin-bottom:8rpx;text-align:center;display:block">⏰ 刚才忘了？</text>
        <view class="retro-chips">
          <view v-for="m in [5, 10, 20, 30]" :key="m" class="retro-chip" @click="retroRecord(m)">{{ m }}分钟前</view>
        </view>
      </view>
    </template>

    <!-- ============================================================
         单计时态
         ============================================================ -->
    <template v-if="recordsStore.runningTimers.length === 1">
      <view class="timer-hero">
        <PlanetOrb
          :size="220"
          :color="runningPlanetColor"
          :initial-text="runningBabyName.charAt(0)"
          :label="runningBabyName"
          :running="true"
          :atmosphere="true"
          :atmosphere-type="runningTimerType === 'feeding' ? 'green' : (runningTwin === 'a' ? 'a' : 'b')"
          :glowing="true"
          :twin="runningTwin"
        />
        <text class="timer-elapsed">{{ formatElapsed(runningElapsed) }}</text>
        <text class="timer-action-label">{{ runningActionLabel }}</text>
        <button class="stop-btn" @click="handleStop(recordsStore.runningTimer!.babyId)">✦ 停止记录</button>
      </view>

      <view class="other-baby" v-if="otherBaby" @click="selectBaby = otherBaby.id">
        <text class="caption">{{ otherBaby.nickname || otherBaby.name }} · 轻触切换</text>
      </view>
    </template>

    <!-- ============================================================
         双计时态
         ============================================================ -->
    <template v-if="recordsStore.runningTimers.length >= 2">
      <view class="dual-timers">
        <view class="dual-card" v-for="t in recordsStore.runningTimers" :key="t.babyId">
          <PlanetOrb
            :size="150"
            :color="t.babyId === twins[0]?.id ? '#FF6B35' : '#A855F7'"
            :initial-text="getBabyName(t.babyId).charAt(0)"
            :label="getBabyName(t.babyId)"
            :running="true"
            :atmosphere="true"
            :atmosphere-type="t.type === 'feeding' ? 'green' : (t.babyId === twins[0]?.id ? 'a' : 'b')"
            :twin="t.babyId === twins[0]?.id ? 'a' : 'b'"
          />
          <text class="dual-elapsed">{{ formatElapsed(t.elapsed) }}</text>
          <text class="dual-type">{{ actionLabel(t.type) }}</text>
          <button class="stop-btn-sm" @click="handleStop(t.babyId)">停止</button>
        </view>
      </view>
      <button class="stop-all-btn" @click="handleStopAll">✦ 全部停止</button>
    </template>

    <!-- 今日轨迹 -->
    <view class="timeline" v-if="recentLogs.length && !recordsStore.isRunning">
      <text class="caption" style="margin-bottom:16rpx;color:var(--text-whisper)">✦ 今日星际轨迹</text>
      <view class="tl-item" v-for="log in recentLogs.slice(0, 10)" :key="log.id">
        <view class="tl-dot" :style="{ background: log.babyId === twins[0]?.id ? '#FF6B35' : '#A855F7' }" />
        <text class="tl-text">{{ log.detail }}</text>
        <text class="tl-time caption">{{ timeAgo(log.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore, type RecordType } from '@/stores/records'
import CosmicStarfield from '@/components/cosmic/CosmicStarfield.vue'
import PlanetOrb from '@/components/cosmic/PlanetOrb.vue'

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const selectedBaby = ref<string>('')

const twins = computed(() => [babiesStore.babyA, babiesStore.babyB].filter(Boolean))

const actions = [
  { type: 'feeding' as RecordType, emoji: '🍼', label: '喂奶', hint: '开始计时' },
  { type: 'sleep' as RecordType, emoji: '😴', label: '睡觉', hint: '开始计时' },
  { type: 'diaper' as RecordType, emoji: '🧷', label: '尿布', hint: '即时记录' },
  { type: 'temperature' as RecordType, emoji: '🌡️', label: '体温', hint: '即时记录' },
  { type: 'medicine' as RecordType, emoji: '💊', label: '用药', hint: '即时记录' },
  { type: 'bath' as RecordType, emoji: '🛁', label: '洗澡', hint: '即时记录' },
]

// Timer tick
const timerTick = ref(0)
let tickHandle: ReturnType<typeof setInterval> | null = null
const runningElapsed = computed(() => { timerTick.value; return recordsStore.runningTimer?.elapsed ?? 0 })
const runningBabyName = computed(() => {
  const t = recordsStore.runningTimer; return t ? getBabyName(t.babyId) : ''
})
const runningPlanetColor = computed(() => {
  const t = recordsStore.runningTimer
  return t?.babyId === twins.value[0]?.id ? '#FF6B35' : '#A855F7'
})
const runningTwin = computed(() => recordsStore.runningTimer?.babyId === twins.value[0]?.id ? 'a' : 'b')
const runningTimerType = computed(() => recordsStore.runningTimer?.type)
const runningActionLabel = computed(() => recordsStore.runningTimer ? actionLabel(recordsStore.runningTimer.type) : '')
const otherBaby = computed(() => {
  if (!recordsStore.runningTimer) return null
  return twins.value.find(b => b.id !== recordsStore.runningTimer!.babyId) ?? null
})

// Watch running state
import { watch } from 'vue'
watch(() => recordsStore.isRunning, (running) => {
  if (running) {
    tickHandle = setInterval(() => { timerTick.value++ }, 1000)
  } else {
    if (tickHandle) { clearInterval(tickHandle); tickHandle = null }
  }
}, { immediate: true })
onUnmounted(() => { if (tickHandle) clearInterval(tickHandle) })

function getBabyName(id: string) { return twins.value.find(b => b.id === id)?.nickname || twins.value.find(b => b.id === id)?.name || '' }
function actionLabel(t: RecordType) {
  const m: Record<string, string> = { feeding: '星光降临', sleep: '休眠', diaper: '净化', temperature: '测温', medicine: '护盾', bath: '洗礼' }
  return m[t] || t
}

function doAction(type: RecordType) {
  const babyId = selectedBaby.value || twins.value[0]?.id
  if (!babyId) return
  if (type === 'feeding' || type === 'sleep') {
    recordsStore.startTimer(babyId, type)
    uni.showToast({ title: '计时开始 ✦', icon: 'success' })
  } else {
    recordsStore.quickLog(babyId, type)
    uni.showToast({ title: '已记录 ✦', icon: 'success' })
  }
}

function dualRecord(type: RecordType) {
  const a = twins.value[0]; const b = twins.value[1]
  if (a) recordsStore.quickLog(a.id, type)
  if (b) recordsStore.quickLog(b.id, type)
  uni.showToast({ title: type === 'feeding' ? '两个都喂了 ✦' : type === 'sleep' ? '两个都睡了 ✦' : '两个都换了 ✦', icon: 'success' })
}

function retroRecord(minutesAgo: number) {
  const babyId = selectedBaby.value || twins.value[0]?.id
  if (!babyId) return
  const now = Date.now()
  const log = recordsStore.quickLog(babyId, 'feeding')
  uni.showToast({ title: '时空修正完成 ✦', icon: 'success' })
}

function getLastLog(babyId: string) {
  const list = recordsStore.recentLogsByBaby[babyId]
  return list?.length ? list[list.length - 1] : null
}

function handleStop(babyId: string) {
  const log = recordsStore.stopTimer(babyId)
  if (log) {
    uni.showToast({ title: `${log.babyName} 已记录 ✦`, icon: 'success' })
  } else {
    uni.showToast({ title: '不足1分钟，未保存', icon: 'none' })
  }
}

function handleStopAll() {
  const ids = recordsStore.runningTimers.map(t => t.babyId)
  let count = 0
  for (const id of ids) { if (recordsStore.stopTimer(id)) count++ }
  if (count > 0) uni.showToast({ title: `${count} 条记录已保存 ✦`, icon: 'success' })
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 60000)
  if (diff < 1) return '刚刚'; if (diff < 60) return `${diff}分钟前`
  return `${Math.floor(diff / 60)}小时前`
}

const todayStart = new Date().setHours(0, 0, 0, 0)
const recentLogs = computed(() =>
  recordsStore.logs.filter(l => l.createdAt >= todayStart).sort((a, b) => b.createdAt - a.createdAt)
)

onMounted(() => {
  uni.setNavigationBarTitle({ title: '宇宙记录' })
  if (twins.value[0]) selectedBaby.value = twins.value[0].id
})
</script>

<style scoped>
.record-page { min-height: 100vh; background: var(--cosmic-void); padding: 32rpx 32rpx calc(80rpx + env(safe-area-inset-bottom)); position: relative; }

/* 双星选择 */
.planet-select { display: flex; justify-content: center; gap: 56rpx; margin-bottom: 40rpx; position: relative; z-index: 1; }
.planet-slot { display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.slot-status { font-size: var(--font-caption); color: var(--text-dust); max-width: 160rpx; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.slot-status.muted { color: var(--text-whisper); }

/* 操作网格 */
.action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16rpx; margin-bottom: 28rpx; position: relative; z-index: 1; }
.action-card {
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  padding: 28rpx 12rpx; background: var(--surface-card); border: 1rpx solid var(--border-void);
  border-radius: var(--radius-lg); transition: transform 0.1s, border-color 0.2s;
}
.action-card:active { transform: scale(0.95); border-color: var(--cosmic-cyan); }
.act-emoji { font-size: 40rpx; }
.act-label { font-size: var(--font-body); font-weight: 600; color: var(--text-starlight); }
.act-hint { font-size: var(--font-caption); color: var(--text-whisper); }

/* 双星同步 */
.dual-bar { display: flex; gap: var(--space-sm); margin-bottom: 24rpx; position: relative; z-index: 1; }
.dual-chip { flex: 1; text-align: center; padding: 20rpx 8rpx; background: var(--surface-card); border: 1rpx solid var(--cosmic-gold); border-radius: var(--radius-full); font-size: var(--font-caption); color: var(--cosmic-gold); }
.dual-chip:active { transform: scale(0.95); }

/* 时空修正 */
.retro-bar { margin-bottom: 32rpx; position: relative; z-index: 1; }
.retro-chips { display: flex; justify-content: center; gap: 12rpx; }
.retro-chip { padding: 12rpx 24rpx; background: var(--surface-card); border: 1rpx solid var(--border-void); border-radius: var(--radius-full); font-size: var(--font-caption); color: var(--text-dust); }
.retro-chip:active { border-color: var(--cosmic-cyan); }

/* 计时器 Hero */
.timer-hero { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; position: relative; z-index: 1; }
.timer-elapsed { font-size: 72rpx; font-weight: 800; color: var(--text-starlight); margin-top: 24rpx; line-height: 1; letter-spacing: 4rpx; }
.timer-action-label { font-size: var(--font-subtitle); color: var(--cosmic-cyan); margin-top: 8rpx; font-weight: 600; }
.stop-btn { margin-top: 36rpx; padding: 24rpx 64rpx; background: transparent; border: 2rpx solid var(--cosmic-red); border-radius: var(--radius-full); color: var(--cosmic-red); font-size: var(--font-body); font-weight: 600; }
.stop-btn:active { background: rgba(255,77,106,0.1); }

.other-baby { text-align: center; padding: 24rpx 0; position: relative; z-index: 1; }

/* 双计时 */
.dual-timers { display: flex; gap: var(--space-md); margin-bottom: 20rpx; position: relative; z-index: 1; }
.dual-card { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 16rpx; padding: 28rpx 12rpx; background: var(--surface-card); border: 2rpx solid var(--border-void); border-radius: var(--radius-xl); }
.dual-elapsed { font-size: 48rpx; font-weight: 700; color: var(--text-starlight); }
.dual-type { font-size: var(--font-caption); color: var(--text-dust); }
.stop-btn-sm { padding: 12rpx 32rpx; background: transparent; border: 2rpx solid var(--cosmic-red); border-radius: var(--radius-full); font-size: var(--font-caption); color: var(--cosmic-red); }
.stop-btn-sm:active { background: rgba(255,77,106,0.1); }
.stop-all-btn { width: 100%; padding: 24rpx; background: transparent; border: 2rpx solid var(--cosmic-red); border-radius: var(--radius-full); font-size: var(--font-body); font-weight: 600; color: var(--cosmic-red); margin-top: 12rpx; position: relative; z-index: 1; }

/* 时间线 */
.timeline { padding-top: 24rpx; position: relative; z-index: 1; }
.tl-item { display: flex; align-items: center; gap: 16rpx; padding: 14rpx 0; }
.tl-dot { width: 10rpx; height: 10rpx; border-radius: 50%; flex-shrink: 0; }
.tl-text { flex: 1; font-size: var(--font-body); color: var(--text-starlight); }
.tl-time { flex-shrink: 0; }
</style>
