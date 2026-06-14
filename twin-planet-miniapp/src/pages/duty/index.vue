<template>
  <view class="duty-page">
    <!-- 值班模式 -->
    <view class="duty-header">
      <text class="duty-icon">🦸</text>
      <text class="duty-title">值班清单</text>
      <text class="duty-sub">照着清单做，一个人也能搞定两个</text>
    </view>

    <!-- 今日鸡汤 -->
    <view class="phrase-card" v-if="store.phrase">
      <text class="phrase-text">{{ store.phrase }}</text>
    </view>

    <!-- 进度环 -->
    <view class="progress-section" v-if="store.tasks.length">
      <view class="progress-ring" :class="{ celebrated: store.isAllDone }" :style="{ '--pct': store.progress + '%' }">
        <text class="progress-num" v-if="!store.isAllDone">{{ store.doneCount }}/{{ store.totalCount }}</text>
        <text class="progress-num done" v-else>🎉</text>
      </view>
      <text class="progress-label">{{ store.isAllDone ? '🎉 任务全部搞定！' : '还剩 ' + store.undoneCount + ' 项' }}</text>
    </view>

    <!-- 清单 -->
    <view class="task-list" v-if="store.tasks.length">
      <view
        v-for="task in store.tasks"
        :key="task.id"
        class="task-card"
        :class="{ done: task.done }"
      >
        <view class="task-check" @click="store.toggleTask(task.id)">
          <text class="check-box">{{ task.done ? '✅' : '⬜' }}</text>
        </view>
        <view class="task-body">
          <view class="task-header">
            <text class="task-emoji">{{ CATEGORY_META[task.category].emoji }}</text>
            <text class="task-title" :class="{ done: task.done }">{{ task.title }}</text>
          </view>
          <view class="task-babies">
            <text class="baby-chip amber" :class="{ off: !task.babyANeed }" @click="store.toggleBabyNeed(task.id, 'A')">
              {{ task.babyANeed ? getBabyName('A') : getBabyName('A') + ' 跳过' }}
            </text>
            <text class="baby-chip rose" :class="{ off: !task.babyBNeed }" @click="store.toggleBabyNeed(task.id, 'B')">
              {{ task.babyBNeed ? getBabyName('B') : getBabyName('B') + ' 跳过' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 按钮 -->
    <view class="bottom-actions">
      <button v-if="!store.tasks.length" class="btn-start" @click="startDuty">
        🚀 开始值班
      </button>
      <button v-else-if="!store.isAllDone" class="btn-reset" @click="resetDuty">
        重新开始
      </button>
      <button v-else class="btn-done" @click="finishDuty">
        🏆 值班完成
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useDutyStore, CATEGORY_META } from '@/stores/duty'
import { useAlertsStore } from '@/stores/alerts'

import { useStickerSync } from '@/composables/useStickerSync'

import { useBabiesStore } from '@/stores/babies'

const store = useDutyStore()
const alertsStore = useAlertsStore()
const babiesStore = useBabiesStore()
const { syncStickers } = useStickerSync()

function getBabyName(order: 'A' | 'B'): string {
  const baby = order === 'A' ? babiesStore.babyA : babiesStore.babyB
  return baby?.nickname || baby?.name || (order === 'A' ? '大宝' : '二宝')
}

function startDuty() {
  store.initDuty()
}

function resetDuty() {
  uni.showModal({
    title: '重新开始',
    content: '当前进度将被清空，确定重新开始吗？',
    success: (res) => {
      if (res.confirm) { store.resetDuty(); store.initDuty() }
    }
  })
}

function finishDuty() {
  uni.showModal({
    title: '完成值班',
    content: '确认所有任务都完成了吗？值班记录将被保存。',
    success: (res) => {
      if (!res.confirm) return
      // 完成值班 = 获得贴纸
      syncStickers({ dutyDoneCount: 1 })
      uni.showToast({ title: '🏆 太棒了！', icon: 'success', duration: 2000 })
      setTimeout(() => { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/index/index' }) }) }, 1500)
    }
  })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '值班清单' })
  if (store.tasks.length === 0) startDuty()
})

tonShareAppMessage(() => ({ title: "🦸 双宝记 · 值班清单", path: "/pages/index/index", imageUrl: "/static/share-brand.png" }))
onShow(() => {
  alertsStore.checkAlerts()
})
</script>

<style scoped>
.duty-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx calc(120rpx + env(safe-area-inset-bottom)); }

.duty-header { text-align: center; margin-bottom: 28rpx; }
.duty-icon { font-size: 48rpx; }
.duty-title { display: block; font-size: 44rpx; font-weight: 700; color: var(--twin-text); margin: 12rpx 0; }
.duty-sub { font-size: 26rpx; color: var(--twin-text-secondary); }

.phrase-card { background: var(--twin-baby-a-light); border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 28rpx; border-left: 6rpx solid var(--twin-baby-a); }
.phrase-text { font-size: 26rpx; color: var(--twin-text); line-height: 1.6; }

.progress-section { text-align: center; margin-bottom: 32rpx; }
.progress-ring {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  border: 8rpx solid var(--twin-border);
  position: relative;
}
/* WXSS-safe: 用 border-color 替代 conic-gradient */
.progress-ring.celebrated {
  border-color: var(--twin-accent);
  box-shadow: 0 0 24rpx rgba(107,175,126,0.2);
}
.progress-num { font-size: 36rpx; font-weight: 700; color: var(--twin-text); }
.progress-num.done { font-size: 40rpx; }
.progress-label { display: block; font-size: 24rpx; color: var(--twin-text-tertiary); margin-top: 12rpx; }

.task-list { display: flex; flex-direction: column; gap: 10rpx; }
.task-card { display: flex; gap: 16rpx; padding: 20rpx 20rpx; background: var(--twin-card-bg); border-radius: 16rpx; align-items: flex-start; }
.task-card.done { opacity: 0.55; }
.task-check { padding-top: 4rpx; }
.check-box { font-size: 32rpx; }
.task-body { flex: 1; }
.task-header { display: flex; align-items: center; gap: 10rpx; margin-bottom: 10rpx; }
.task-emoji { font-size: 26rpx; }
.task-title { font-size: 28rpx; font-weight: 600; color: var(--twin-text); }
.task-title.done { text-decoration: line-through; color: var(--twin-text-secondary); }
.task-babies { display: flex; gap: 12rpx; }
.baby-chip { font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 20rpx; }
.baby-chip.amber { background: var(--twin-baby-a-light); color: var(--twin-baby-a); }
.baby-chip.rose { background: var(--twin-baby-b-light); color: var(--twin-baby-b); }
.baby-chip.off { background: var(--twin-hover); color: var(--twin-text-muted); text-decoration: line-through; }

.bottom-actions { position: fixed; bottom: 0; left: 0; right: 0; padding: 24rpx 32rpx calc(48rpx + env(safe-area-inset-bottom)); background: linear-gradient(transparent, var(--twin-bg) 30%); }
.btn-start, .btn-done { width: 100%; padding: 28rpx 0; background: var(--twin-baby-a); color: #FFF; border: none; border-radius: 24rpx; font-size: 36rpx; font-weight: 600; }
.btn-done { background: var(--twin-accent); }
.btn-reset { width: 100%; padding: 28rpx 0; background: var(--twin-card-bg); color: var(--twin-text-tertiary); border: 2rpx solid var(--twin-border); border-radius: 24rpx; font-size: 30rpx; }
</style>
