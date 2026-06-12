<template>
  <view class="snap-page">
    <view class="greeting">
      <text class="greeting-text">{{ greetingText }}</text>
      <text class="greeting-sub">一眼看完两个娃</text>
    </view>

    <!-- 三明治卡片 -->
    <view class="sandwich-cards">
      <!-- 大宝 -->
      <view class="sandwich-card" style="border-color: #4299E1">
        <view class="card-top">
          <view class="baby-avatar" style="background: #EBF8FF"><text>👦</text></view>
          <view class="baby-info">
            <text class="baby-name">{{ twinA?.nickname || '大宝' }}</text>
            <text class="baby-status">{{ getBabyStatus(twinA) }}</text>
          </view>
        </view>
        <view class="card-metrics">
          <view class="metric">
            <text class="metric-label">上次喂养</text>
            <text class="metric-value">{{ getLastFeeding(twinA) }}</text>
          </view>
          <view class="metric-divider" />
          <view class="metric">
            <text class="metric-label">上次睡眠</text>
            <text class="metric-value">{{ getLastSleep(twinA) }}</text>
          </view>
        </view>
      </view>

      <!-- 中间夹层 -->
      <view class="sandwich-middle">
        <view class="middle-row">
          <view class="middle-item">
            <text class="middle-num">{{ todayContribs }}</text>
            <text class="middle-label">今天做了</text>
          </view>
          <view class="middle-item">
            <text class="middle-num">{{ todayRecords }}</text>
            <text class="middle-label">次记录</text>
          </view>
          <view class="middle-item">
            <text class="middle-num">{{ handoverCount }}</text>
            <text class="middle-label">条留言</text>
          </view>
        </view>
      </view>

      <!-- 二宝 -->
      <view class="sandwich-card" style="border-color: #F56565">
        <view class="card-top">
          <view class="baby-avatar" style="background: #FFF5F5"><text>👧</text></view>
          <view class="baby-info">
            <text class="baby-name">{{ twinB?.nickname || '二宝' }}</text>
            <text class="baby-status">{{ getBabyStatus(twinB) }}</text>
          </view>
        </view>
        <view class="card-metrics">
          <view class="metric">
            <text class="metric-label">上次喂养</text>
            <text class="metric-value">{{ getLastFeeding(twinB) }}</text>
          </view>
          <view class="metric-divider" />
          <view class="metric">
            <text class="metric-label">上次睡眠</text>
            <text class="metric-value">{{ getLastSleep(twinB) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快速操作 -->
    <view class="quick-actions">
      <text class="section-label">快速操作</text>
      <view class="action-row">
        <view class="quick-btn" @click="goRecord"><text class="quick-emoji">🍼</text><text class="quick-label">记录</text></view>
        <view class="quick-btn" @click="goHandover"><text class="quick-emoji">🎙️</text><text class="quick-label">交接班</text></view>
        <view class="quick-btn" @click="goContribution"><text class="quick-emoji">💪</text><text class="quick-label">我做了</text></view>
        <view class="quick-btn" @click="goSprout"><text class="quick-emoji">🌱</text><text class="quick-label">萌芽</text></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBabiesStore, type Baby } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import { useInteractionsStore } from '@/stores/interactions'

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const interactionsStore = useInteractionsStore()

const twinA = computed(() => babiesStore.babyA)
const twinB = computed(() => babiesStore.babyB)
const handoverCount = ref(0)

const greetingText = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好，辛苦了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了'
})

const todayRecords = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return recordsStore.logs.filter(l => new Date(l.createdAt).toISOString().slice(0, 10) === today).length
})
const todayContribs = computed(() => interactionsStore.todayContributions.length)

function getBabyStatus(baby: Baby | null): string {
  if (!baby) return '—'
  if (recordsStore.isBabyRunning(baby.id)) {
    return recordsStore.runningTimer?.type === 'feeding' ? '🍼 喂奶中' : '😴 睡觉中'
  }
  return '😊 清醒中'
}
function getLastFeeding(baby: Baby | null): string {
  if (!baby) return '—'
  return recordsStore.recentLogsByBaby[baby.id]?.find(l => l.type === 'feeding')?.detail || '暂无'
}
function getLastSleep(baby: Baby | null): string {
  if (!baby) return '—'
  const last = recordsStore.recentLogsByBaby[baby.id]?.find(l => l.type === 'sleep')
  return last ? `${last.durationMin}分钟` : '暂无'
}

const goRecord = () => uni.navigateTo({ url: '/pages/record/index' })
const goHandover = () => uni.navigateTo({ url: '/pages/handover/index' })
const goContribution = () => uni.navigateTo({ url: '/pages/contribution/index' })
const goSprout = () => uni.navigateTo({ url: '/pages/sprout/index' })

onMounted(() => { uni.setNavigationBarTitle({ title: '爸爸的快照' }) })
</script>

<style scoped>
.snap-page { min-height: 100vh; background: #FFFBF5; padding: 32rpx 32rpx 80rpx; }
.greeting { margin-bottom: 28rpx; }
.greeting-text { font-size: 44rpx; font-weight: 700; color: #2D3748; }
.greeting-sub { display: block; font-size: 26rpx; color: #A0AEC0; margin-top: 8rpx; }

/* 三明治卡片 */
.sandwich-cards { margin-bottom: 32rpx; }
.sandwich-card {
  background: #FFFFFF; border-radius: 20rpx; padding: 24rpx;
  border-left: 8rpx solid; margin-bottom: 0;
}
.card-top { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.baby-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.baby-name { font-size: 30rpx; font-weight: 600; color: #2D3748; }
.baby-status { font-size: 24rpx; color: #718096; display: block; margin-top: 4rpx; }
.card-metrics { display: flex; align-items: center; gap: 16rpx; }
.metric { flex: 1; }
.metric-label { font-size: 22rpx; color: #A0AEC0; }
.metric-value { display: block; font-size: 26rpx; color: #2D3748; font-weight: 500; margin-top: 4rpx; }
.metric-divider { width: 2rpx; height: 48rpx; background: #E2E8F0; }

/* 中间夹层 */
.sandwich-middle { background: #FFFFFF; border-radius: 0; padding: 20rpx 24rpx; border-left: 8rpx solid #48BB78; margin: -2rpx 0; }
.middle-row { display: flex; justify-content: space-around; }
.middle-item { text-align: center; }
.middle-num { font-size: 40rpx; font-weight: 700; color: #48BB78; }
.middle-label { display: block; font-size: 22rpx; color: #A0AEC0; margin-top: 4rpx; }

/* 快速操作 */
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: #2D3748; margin-bottom: 16rpx; }
.action-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12rpx; }
.quick-btn { text-align: center; padding: 24rpx 8rpx; background: #FFFFFF; border-radius: 16rpx; }
.quick-emoji { font-size: 36rpx; display: block; }
.quick-label { font-size: 22rpx; color: #4A5568; margin-top: 8rpx; display: block; }
</style>
