<template>
  <view class="record-page">
    <!-- 双宝状态栏 -->
    <view class="twins-header">
      <view
        v-for="baby in twins"
        :key="baby.id"
        class="baby-status-card"
        :style="{ borderLeftColor: baby.color }"
        :class="{ active: recordsStore.isBabyRunning(baby.id) }"
      >
        <view class="baby-info">
          <text class="baby-emoji">{{ baby.gender === 'male' ? '👦' : '👧' }}</text>
          <view class="baby-text">
            <text class="baby-name">{{ baby.nickname || baby.name }}</text>
            <text class="baby-last" v-if="getLastLog(baby.id)">
              {{ getLastLog(baby.id)!.detail }} · {{ timeAgo(getLastLog(baby.id)!.createdAt) }}
            </text>
            <text class="baby-last muted" v-else>暂无记录</text>
          </view>
        </view>
        <view class="baby-timer" v-if="recordsStore.isBabyRunning(baby.id)">
          <text class="timer-value">{{ formatElapsed(recordsStore.getTimer(baby.id)!.elapsed) }}</text>
          <view class="timer-dot running" />
        </view>
      </view>
    </view>

    <!-- 计时器区（双计时器支持） -->
    <view class="timer-section" v-if="recordsStore.isRunning">
      <!-- 单个计时器：大屏显示 -->
      <view class="timer-hero" v-if="recordsStore.runningTimers.length === 1">
        <text class="timer-label">
          {{ runningBaby ? runningBaby.nickname || runningBaby.name : '' }}
          {{ typeLabel(recordsStore.runningTimer!.type) }}
        </text>
        <text class="timer-big">{{ formatElapsed(recordsStore.runningTimer!.elapsed) }}</text>
        <button class="btn-stop" @click="handleStop(recordsStore.runningTimer!.babyId)">
          停止记录
        </button>
      </view>

      <!-- 两个计时器：并排卡片 -->
      <view class="dual-timers" v-else-if="recordsStore.runningTimers.length >= 2">
        <view
          v-for="timer in recordsStore.runningTimers"
          :key="timer.babyId"
          class="dual-timer-card"
          :style="{ borderColor: getTimerBaby(timer.babyId)?.color || 'var(--twin-border)' }"
        >
          <text class="dual-timer-baby">{{ getTimerBaby(timer.babyId)?.nickname || '宝宝' }}</text>
          <text class="dual-timer-label">{{ typeEmoji(timer.type) }} {{ typeLabel(timer.type) }}</text>
          <text class="dual-timer-value">{{ formatElapsed(timer.elapsed) }}</text>
          <button
            class="btn-stop-small"
            :style="{ background: getTimerBaby(timer.babyId)?.color || 'var(--twin-baby-b)' }"
            @click="handleStop(timer.babyId)"
          >
            停止
          </button>
        </view>
      </view>

      <!-- 两个计时器时：全部停止按钮 -->
      <button
        v-if="recordsStore.runningTimers.length >= 2"
        class="btn-stop-all"
        @click="handleStopAll"
      >
        全部停止
      </button>
    </view>

    <!-- 操作按钮（无计时器时显示） -->
    <view class="action-section" v-else>
      <text class="section-label">这次谁做了什么？</text>

      <view class="action-grid">
        <!-- 喂养·安宁 -->
        <view
          class="action-card feeding"
          :class="{ disabled: twins.length < 1 }"
          @click="startRecord(twins[0]?.id, 'feeding')"
        >
          <text class="action-emoji">🍼</text>
          <text class="action-baby">{{ twins[0]?.nickname || '大宝' }}</text>
          <text class="action-type">喂奶</text>
        </view>
        <!-- 喂养·安然 -->
        <view
          class="action-card feeding"
          :class="{ disabled: twins.length < 2 }"
          @click="startRecord(twins[1]?.id, 'feeding')"
        >
          <text class="action-emoji">🍼</text>
          <text class="action-baby">{{ twins[1]?.nickname || '二宝' }}</text>
          <text class="action-type">喂奶</text>
        </view>
        <!-- 睡眠·安宁 -->
        <view
          class="action-card sleeping"
          :class="{ disabled: twins.length < 1 }"
          @click="startRecord(twins[0]?.id, 'sleep')"
        >
          <text class="action-emoji">😴</text>
          <text class="action-baby">{{ twins[0]?.nickname || '大宝' }}</text>
          <text class="action-type">睡觉</text>
        </view>
        <!-- 睡眠·安然 -->
        <view
          class="action-card sleeping"
          :class="{ disabled: twins.length < 2 }"
          @click="startRecord(twins[1]?.id, 'sleep')"
        >
          <text class="action-emoji">😴</text>
          <text class="action-baby">{{ twins[1]?.nickname || '二宝' }}</text>
          <text class="action-type">睡觉</text>
        </view>
        <!-- 换尿布·安宁 -->
        <view
          class="action-card diaper"
          :class="{ disabled: twins.length < 1 }"
          @click="startRecord(twins[0]?.id, 'diaper')"
        >
          <text class="action-emoji">🧷</text>
          <text class="action-baby">{{ twins[0]?.nickname || '大宝' }}</text>
          <text class="action-type">换尿布</text>
        </view>
        <!-- 换尿布·安然 -->
        <view
          class="action-card diaper"
          :class="{ disabled: twins.length < 2 }"
          @click="startRecord(twins[1]?.id, 'diaper')"
        >
          <text class="action-emoji">🧷</text>
          <text class="action-baby">{{ twins[1]?.nickname || '二宝' }}</text>
          <text class="action-type">换尿布</text>
        </view>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-section" v-if="recentLogs.length">
      <text class="section-label">最近记录</text>
      <view class="log-list">
        <view
          v-for="log in recentLogs.slice(0, 8)"
          :key="log.id"
          class="log-item"
          :style="{ borderLeftColor: log.babyColor }"
        >
          <text class="log-emoji">{{ typeEmoji(log.type) }}</text>
          <view class="log-body">
            <text class="log-detail">{{ log.babyName }} · {{ log.detail }}</text>
            <text class="log-time">{{ timeAgo(log.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!recordsStore.isRunning && !recentLogs.length">
      <text class="empty-emoji">📝</text>
      <text class="empty-title">还没有记录</text>
      <text class="empty-desc">点击上方按钮开始第一次记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import type { RecordType } from '@/stores/records'

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const twins = computed(() => [babiesStore.babyA, babiesStore.babyB].filter(Boolean))

const runningBaby = computed(() => {
  if (!recordsStore.runningTimer) return null
  return babiesStore.getBaby(recordsStore.runningTimer.babyId) ?? null
})

const recentLogs = computed(() => {
  return recordsStore.logs.slice().reverse()
})

function getLastLog(babyId: string) {
  const list = recordsStore.recentLogsByBaby[babyId]
  return list?.length ? list[list.length - 1] : null
}

function getTimerBaby(babyId: string) {
  return babiesStore.getBaby(babyId) ?? null
}

function startRecord(babyId: string | undefined, type: RecordType) {
  if (!babyId) return
  recordsStore.startTimer(babyId, type)
}

function handleStop(babyId: string) {
  const log = recordsStore.stopTimer(babyId)
  if (log) {
    uni.showToast({ title: `${log.babyName} ${typeEmoji(log.type)} 已记录`, icon: 'success', duration: 1200 })
  } else {
    uni.showToast({ title: '不足1分钟，未保存', icon: 'none', duration: 1200 })
  }
}

function handleStopAll() {
  const ids = recordsStore.runningTimers.map(t => t.babyId)
  let count = 0
  for (const id of ids) {
    const log = recordsStore.stopTimer(id)
    if (log) count++
  }
  if (count > 0) {
    uni.showToast({ title: `${count} 条记录已保存`, icon: 'success', duration: 1200 })
  }
}

onUnmounted(() => {
  // 页面退出时若有运行中的计时器，自动停止保存（≥60秒）
  for (const timer of recordsStore.runningTimers) {
    if (timer.elapsed >= 60) {
      recordsStore.stopTimer(timer.babyId)
    }
  }
})

function typeEmoji(type: RecordType): string {
  if (type === 'feeding') return '🍼'
  if (type === 'sleep') return '😴'
  return '🧷'
}

function typeLabel(type: RecordType): string {
  if (type === 'feeding') return '喂奶中'
  if (type === 'sleep') return '睡觉中'
  return '换尿布'
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000)
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}小时前`
  return `${Math.floor(h / 24)}天前`
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '双轨记录' })
})
</script>

<style scoped>
.record-page {
  min-height: 100vh;
  background: var(--twin-bg);
  padding: 24rpx 32rpx 80rpx;
}

/* 双宝状态栏 */
.twins-header { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.baby-status-card {
  flex: 1; display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 24rpx; background: var(--twin-card-bg); border-radius: 20rpx;
  border-left: 8rpx solid var(--twin-border);
}
.baby-status-card.active { background: var(--twin-accent-light); border-left-color: var(--twin-accent); }
.baby-info { display: flex; align-items: center; gap: 12rpx; }
.baby-emoji { font-size: 32rpx; }
.baby-text { display: flex; flex-direction: column; }
.baby-name { font-size: 28rpx; font-weight: 600; color: var(--twin-text); }
.baby-last { font-size: 20rpx; color: var(--twin-text-tertiary); margin-top: 4rpx; }
.baby-last.muted { color: var(--twin-text-muted); }

.baby-timer { display: flex; align-items: center; gap: 8rpx; }
.timer-value { font-size: 28rpx; font-weight: 700; color: var(--twin-accent); font-variant-numeric: tabular-nums; }
.timer-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: var(--twin-accent); }
.timer-dot.running { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 计时器区 — 单个 */
.timer-section { margin-bottom: 40rpx; }
.timer-hero {
  text-align: center; background: var(--twin-card-bg); border-radius: 28rpx;
  padding: 48rpx 32rpx 32rpx; margin-bottom: 24rpx; border: 4rpx solid var(--twin-accent);
}
.timer-label { font-size: 28rpx; color: var(--twin-text-tertiary); }
.timer-big { display: block; font-size: 96rpx; font-weight: 700; color: var(--twin-text); margin: 16rpx 0; font-variant-numeric: tabular-nums; letter-spacing: 4px; }
.btn-stop {
  width: 100%; padding: 28rpx 0; background: var(--twin-baby-b); color: var(--twin-card-bg);
  border: none; border-radius: 24rpx; font-size: 36rpx; font-weight: 600;
}

/* 计时器区 — 双计时器并排 */
.dual-timers { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.dual-timer-card {
  flex: 1; text-align: center; background: var(--twin-card-bg); border-radius: 24rpx;
  padding: 32rpx 20rpx 24rpx; border: 4rpx solid var(--twin-border);
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
}
.dual-timer-baby { font-size: 26rpx; font-weight: 600; color: var(--twin-text); }
.dual-timer-label { font-size: 22rpx; color: var(--twin-text-tertiary); }
.dual-timer-value { font-size: 56rpx; font-weight: 700; color: var(--twin-text); font-variant-numeric: tabular-nums; }
.btn-stop-small {
  width: 100%; padding: 16rpx 0; color: var(--twin-card-bg); border: none;
  border-radius: 16rpx; font-size: 28rpx; font-weight: 600;
}
.btn-stop-all {
  width: 100%; padding: 24rpx 0; background: var(--twin-warning); color: var(--twin-card-bg);
  border: none; border-radius: 24rpx; font-size: 32rpx; font-weight: 600;
}

/* 操作按钮区 */
.action-section { margin-bottom: 40rpx; }
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 20rpx; }
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.action-card {
  text-align: center; padding: 36rpx 12rpx; background: var(--twin-card-bg);
  border-radius: 24rpx; border: 4rpx solid var(--twin-border);
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
}
.action-card.feeding { border-top: 8rpx solid var(--twin-baby-a); }
.action-card.sleeping { border-top: 8rpx solid #F6AD55; }
.action-card.diaper { border-top: 8rpx solid var(--twin-accent); }
.action-card:active { background: var(--twin-hover); transform: scale(0.97); }
.action-card.disabled { opacity: 0.4; }
.action-emoji { font-size: 44rpx; }
.action-baby { font-size: 26rpx; font-weight: 600; color: var(--twin-text); }
.action-type { font-size: 22rpx; color: var(--twin-text-secondary); }

/* 最近记录 */
.recent-section { margin-bottom: 40rpx; }
.log-list { display: flex; flex-direction: column; gap: 12rpx; }
.log-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx; background: var(--twin-card-bg); border-radius: 16rpx;
  border-left: 6rpx solid var(--twin-border);
}
.log-emoji { font-size: 28rpx; flex-shrink: 0; }
.log-body { flex: 1; }
.log-detail { display: block; font-size: 26rpx; color: var(--twin-text); }
.log-time { display: block; font-size: 20rpx; color: var(--twin-text-secondary); margin-top: 4rpx; }

/* 空状态 */
.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48px; }
.empty-title { display: block; font-size: 32rpx; font-weight: 600; color: var(--twin-text); margin: 16rpx 0 8rpx; }
.empty-desc { font-size: 26rpx; color: var(--twin-text-secondary); }
</style>
