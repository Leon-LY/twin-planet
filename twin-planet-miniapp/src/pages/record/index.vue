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
          <text class="timer-value">{{ formatElapsed(recordsStore.runningTimer!.elapsed) }}</text>
          <view class="timer-dot running" />
        </view>
      </view>
    </view>

    <!-- 计时器区（当有计时器在跑时显示） -->
    <view class="timer-section" v-if="recordsStore.isRunning">
      <view class="timer-hero">
        <text class="timer-label">
          {{ recordsStore.runningTimer?.type === 'feeding' ? '🍼 喂奶中' : '😴 睡觉中' }}
        </text>
        <text class="timer-big">{{ formatElapsed(recordsStore.runningTimer!.elapsed) }}</text>
        <text class="timer-baby-name">
          {{ runningBaby?.nickname || runningBaby?.name }}
        </text>
      </view>
      <button class="btn-stop" @click="recordsStore.stopTimer()">
        停止记录
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
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-section" v-if="recentLogs.length">
      <text class="section-label">最近记录</text>
      <view class="log-list">
        <view
          v-for="log in recentLogs.slice(0, 6)"
          :key="log.id"
          class="log-item"
          :style="{ borderLeftColor: log.babyColor }"
        >
          <text class="log-emoji">{{ log.type === 'feeding' ? '🍼' : '😴' }}</text>
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
import { computed } from 'vue'
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

function startRecord(babyId: string | undefined, type: RecordType) {
  if (!babyId) return
  recordsStore.startTimer(babyId, type)
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
  background: #FFFBF5;
  padding: 24rpx 32rpx 80rpx;
}

/* 双宝状态栏 */
.twins-header { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.baby-status-card {
  flex: 1; display: flex; justify-content: space-between; align-items: center;
  padding: 20rpx 24rpx; background: #FFFFFF; border-radius: 20rpx;
  border-left: 8rpx solid #E2E8F0;
}
.baby-status-card.active { background: #F0FFF4; border-left-color: #48BB78; }
.baby-info { display: flex; align-items: center; gap: 12rpx; }
.baby-emoji { font-size: 32rpx; }
.baby-text { display: flex; flex-direction: column; }
.baby-name { font-size: 28rpx; font-weight: 600; color: #2D3748; }
.baby-last { font-size: 20rpx; color: #718096; margin-top: 4rpx; }
.baby-last.muted { color: #CBD5E0; }

.baby-timer { display: flex; align-items: center; gap: 8rpx; }
.timer-value { font-size: 28rpx; font-weight: 700; color: #48BB78; font-variant-numeric: tabular-nums; }
.timer-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: #48BB78; }
.timer-dot.running { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 计时器区 */
.timer-section { text-align: center; margin-bottom: 40rpx; }
.timer-hero {
  background: #FFFFFF; border-radius: 28rpx; padding: 48rpx 32rpx 32rpx;
  margin-bottom: 24rpx; border: 4rpx solid #48BB78;
}
.timer-label { font-size: 28rpx; color: #718096; }
.timer-big { display: block; font-size: 96rpx; font-weight: 700; color: #2D3748; margin: 16rpx 0; font-variant-numeric: tabular-nums; letter-spacing: 4px; }
.timer-baby-name { display: block; font-size: 28rpx; color: #A0AEC0; }
.btn-stop {
  width: 100%; padding: 28rpx 0; background: #F56565; color: #FFFFFF;
  border: none; border-radius: 24rpx; font-size: 36rpx; font-weight: 600;
}

/* 操作按钮区 */
.action-section { margin-bottom: 40rpx; }
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: #2D3748; margin-bottom: 20rpx; }
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.action-card {
  text-align: center; padding: 40rpx 16rpx; background: #FFFFFF;
  border-radius: 24rpx; border: 4rpx solid #E2E8F0;
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
}
.action-card.feeding { border-top: 8rpx solid #4299E1; }
.action-card.sleeping { border-top: 8rpx solid #F6AD55; }
.action-card:active { background: #F7FAFC; transform: scale(0.97); }
.action-card.disabled { opacity: 0.4; }
.action-emoji { font-size: 44rpx; }
.action-baby { font-size: 26rpx; font-weight: 600; color: #2D3748; }
.action-type { font-size: 22rpx; color: #A0AEC0; }

/* 最近记录 */
.recent-section { margin-bottom: 40rpx; }
.log-list { display: flex; flex-direction: column; gap: 12rpx; }
.log-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx; background: #FFFFFF; border-radius: 16rpx;
  border-left: 6rpx solid #E2E8F0;
}
.log-emoji { font-size: 28rpx; flex-shrink: 0; }
.log-body { flex: 1; }
.log-detail { display: block; font-size: 26rpx; color: #2D3748; }
.log-time { display: block; font-size: 20rpx; color: #A0AEC0; margin-top: 4rpx; }

/* 空状态 */
.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48px; }
.empty-title { display: block; font-size: 32rpx; font-weight: 600; color: #2D3748; margin: 16rpx 0 8rpx; }
.empty-desc { font-size: 26rpx; color: #A0AEC0; }
</style>
