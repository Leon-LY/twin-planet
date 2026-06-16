<template>
  <view class="snap-page page-enter">
    <canvas canvas-id="shareCanvas" style="position:fixed;left:-9999px;top:-9999px;width:345px;height:480px"></canvas>
    <view class="page-header">
      <text class="page-title">{{ greetingText }}</text>
      <text class="page-subtitle">一眼看完两个娃</text>
    </view>

    <!-- 三明治卡片 -->
    <view class="sandwich-cards">
      <!-- 大宝 -->
      <view class="sandwich-card journal-card" style="border-color: var(--twin-baby-a)">
        <view class="card-top">
          <view class="baby-avatar" style="background: var(--twin-baby-a-light)"><text>{{ twinA?.gender==='male'?'👦':'👧' }}</text></view>
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
        </view>
        <text class="middle-recorder" v-if="recorderBreakdown">{{ recorderBreakdown }}</text>
      </view>

      <!-- 二宝 -->
      <view class="sandwich-card journal-card" style="border-color: var(--twin-baby-b)">
        <view class="card-top">
          <view class="baby-avatar" style="background: var(--twin-baby-b-light)"><text>{{ twinB?.gender==='male'?'👦':'👧' }}</text></view>
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
        <view class="quick-btn" @click="goRecord"><text class="quick-emoji iconfont icon-bottle"></text><text class="quick-label">记录</text></view>
        <view class="quick-btn" @click="goDuty"><text class="quick-emoji iconfont icon-hero"></text><text class="quick-label">值班</text></view>
        <view class="quick-btn" @click="goHandover"><text class="quick-emoji iconfont icon-microphone"></text><text class="quick-label">交接</text></view>
        <view class="quick-btn" @click="goSprout"><text class="quick-emoji iconfont icon-sprout"></text><text class="quick-label">萌芽</text></view>
      </view>
      <view class="share-row" @click="goShare">
        <text><text class="iconfont icon-share"></text> 生成今日双宝卡，分享给家人</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBabiesStore, type Baby } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import { useInteractionsStore } from '@/stores/interactions'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { drawShareCard, saveToAlbum, type WeekStats } from '@/utils/shareCard'
import { timeAgo } from '@/utils/format'

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const interactionsStore = useInteractionsStore()

const twinA = computed(() => babiesStore.babyA)
const twinB = computed(() => babiesStore.babyB)

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

// 今日记录者分布（谁记了多少条）
const recorderBreakdown = computed(() => {
  const t0 = new Date().setHours(0, 0, 0, 0)
  const todayLogs = recordsStore.logs.filter(l => l.createdAt >= t0)
  const map: Record<string, number> = {}
  for (const l of todayLogs) {
    const role = l.recordedBy || 'unknown'
    map[role] = (map[role] || 0) + 1
  }
  const labels: Record<string, string> = { mom: '👩妈妈', dad: '👨爸爸', grandma: '👵奶奶', grandpa: '👴爷爷', nanny: '👩‍🍼育儿嫂' }
  return Object.entries(map).map(([k, v]) => `${labels[k] || '👤家人'} ${v}条`).join(' · ')
})

function getBabyStatus(baby: Baby | null): string {
  if (!baby) return '—'
  if (recordsStore.isBabyRunning(baby.id)) {
    return recordsStore.runningTimer?.type === 'feeding' ? '🍼 喂奶中' : '😴 睡觉中'
  }
  return '😊 清醒中'
}
function getLastFeeding(baby: Baby | null): string {
  if (!baby) return '—'
  const last = recordsStore.recentLogsByBaby[baby.id]?.find(l => l.type === 'feeding')
  if (!last) return '—'
  return `${timeAgo(last.createdAt)} · ${last.detail}`
}
function getLastSleep(baby: Baby | null): string {
  if (!baby) return '—'
  const last = recordsStore.recentLogsByBaby[baby.id]?.find(l => l.type === 'sleep')
  if (!last) return '暂无'
  const relative = timeAgo(last.createdAt)
  const durStr = last.durationMin ? `${last.durationMin}分钟` : ''
  return `${relative} · ${durStr || '睡眠'}`
}

const goRecord = () => uni.navigateTo({ url: '/pages/record/index' })
const goDuty = () => uni.navigateTo({ url: '/pages/duty/index' })
const goHandover = () => uni.navigateTo({ url: '/pages/handover/index' })
const goSprout = () => uni.navigateTo({ url: '/pages/sprout/index' })
const goShare = async () => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const weekLogs = recordsStore.logs.filter(l => l.createdAt >= weekAgo)
  const aId = twinA.value?.id; const bId = twinB.value?.id
  const stats: WeekStats = {
    babyAName: twinA.value?.nickname || twinA.value?.name || '大宝',
    babyBName: twinB.value?.nickname || twinB.value?.name || '二宝',
    babyAFeedings: weekLogs.filter(l => l.babyId === aId && l.type === 'feeding').length,
    babyBFeedings: weekLogs.filter(l => l.babyId === bId && l.type === 'feeding').length,
    babyASleepMin: weekLogs.filter(l => l.babyId === aId && l.type === 'sleep').reduce((s,l) => s + (l.durationMin || 0), 0),
    babyBSleepMin: weekLogs.filter(l => l.babyId === bId && l.type === 'sleep').reduce((s,l) => s + (l.durationMin || 0), 0),
    babyADiapers: weekLogs.filter(l => l.babyId === aId && l.type === 'diaper').length,
    babyBDiapers: weekLogs.filter(l => l.babyId === bId && l.type === 'diaper').length,
    daysGrowing: Math.floor((now - new Date(twinA.value?.birthDate || '').getTime()) / 86400000),
  }
  try {
    const path = await drawShareCard('shareCanvas', stats)
    await saveToAlbum(path)
    uni.showToast({ title: '已保存到相册，去分享吧', icon: 'success' })
  } catch {
    uni.showToast({ title: '卡片生成遇到问题，稍后再试吧', icon: 'none' })
  }
}

onMounted(() => { uni.setNavigationBarTitle({ title: '双宝快照' }) })
onShareAppMessage(()=>({title:'双宝快照 · 一眼看完两个娃',path:'/pages/snapshot/index',imageUrl:'/static/share-brand.png'}))
</script>

<style scoped>
.snap-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 80rpx; }
/* 使用全局 .page-header 页头模式 */

/* 三明治卡片 */
.sandwich-cards { margin-bottom: 32rpx; }
.sandwich-card {
  background: var(--twin-card-bg); border-radius: 20rpx; padding: 24rpx;
  border-left: 8rpx solid; margin-bottom: 0;
}
.card-top { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.baby-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.baby-name { font-size: 30rpx; font-weight: 600; color: var(--twin-text); }
.baby-status { font-size: 24rpx; color: var(--twin-text-tertiary); display: block; margin-top: 4rpx; }
.card-metrics { display: flex; align-items: center; gap: 16rpx; }
.metric { flex: 1; }
.metric-label { font-size: 22rpx; color: var(--twin-text-secondary); }
.metric-value { display: block; font-size: 26rpx; color: var(--twin-text); font-weight: 500; margin-top: 4rpx; }
.metric-divider { width: 2rpx; height: 48rpx; background: var(--twin-border); }

/* 中间夹层 */
.sandwich-middle { background: var(--twin-card-bg); border-radius: 0; padding: 20rpx 24rpx; border-left: 8rpx solid var(--twin-accent); margin: -2rpx 0; }
.middle-row { display: flex; justify-content: space-around; }
.middle-item { text-align: center; }
.middle-num { font-size: 40rpx; font-weight: 700; color: var(--twin-accent); }
.middle-recorder { display: block; text-align: center; font-size: 22rpx; color: var(--ink-md); margin-top: 10rpx; }
.middle-label { display: block; font-size: 22rpx; color: var(--twin-text-secondary); margin-top: 4rpx; }

/* 快速操作 */
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 16rpx; }
.action-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12rpx; }
.quick-btn { text-align: center; padding: 24rpx 8rpx; background: var(--twin-card-bg); border-radius: 16rpx; }
.quick-emoji { font-size: 36rpx; display: block; }
.quick-label { font-size: 22rpx; color: var(--ink); margin-top: 8rpx; display: block; }
.share-row { text-align:center; padding: 20rpx; margin-top: 16rpx; background: var(--amber-lt); border-radius: 16rpx; font-size: 24rpx; color: var(--amber); font-weight: 600; }
.share-row:active { opacity: .7; }
</style>
