<template>
  <view class="duty-page">
    <!-- 我独自带娃 -->
    <view class="duty-header">
      <text class="duty-icon">🦸</text>
      <text class="duty-title">爸爸值班模式</text>
      <text class="duty-sub">照着清单做，一个人也能搞定两个</text>
    </view>

    <!-- 今日鸡汤 -->
    <view class="phrase-card" v-if="store.phrase">
      <text class="phrase-text">{{ store.phrase }}</text>
    </view>

    <!-- 进度环 -->
    <view class="progress-section" v-if="store.tasks.length">
      <view class="progress-ring" :style="{ '--pct': store.progress + '%' }">
        <text class="progress-num" v-if="!store.isAllDone">{{ store.doneCount }}/{{ store.totalCount }}</text>
        <text class="progress-num done" v-else>🎉</text>
      </view>
      <text class="progress-label">{{ store.isAllDone ? '全部完成！好爸爸！' : '还剩 ' + store.undoneCount + ' 项' }}</text>
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
            <text class="baby-chip blue" :class="{ off: !task.babyANeed }" @click="store.toggleBabyNeed(task.id, 'A')">
              {{ task.babyANeed ? '👦 安宁' : '安宁 ×' }}
            </text>
            <text class="baby-chip pink" :class="{ off: !task.babyBNeed }" @click="store.toggleBabyNeed(task.id, 'B')">
              {{ task.babyBNeed ? '👧 安然' : '安然 ×' }}
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
import { useDutyStore, CATEGORY_META } from '@/stores/duty'
import { useAlertsStore } from '@/stores/alerts'

const store = useDutyStore()
const alertsStore = useAlertsStore()

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
  uni.showToast({ title: '🏆 你太棒了！', icon: 'success', duration: 2000 })
  setTimeout(() => { uni.navigateBack() }, 1500)
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '爸爸值班' })
  if (store.tasks.length === 0) startDuty()
  alertsStore.checkAlerts()
})

onShow(() => {
  alertsStore.checkAlerts()
})
</script>

<style scoped>
.duty-page { min-height: 100vh; background: #FFFBF5; padding: 32rpx 32rpx 120rpx; }

.duty-header { text-align: center; margin-bottom: 28rpx; }
.duty-icon { font-size: 48px; }
.duty-title { display: block; font-size: 44rpx; font-weight: 700; color: #2D3748; margin: 12rpx 0; }
.duty-sub { font-size: 26rpx; color: #A0AEC0; }

.phrase-card { background: #EBF8FF; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 28rpx; border-left: 6rpx solid #4299E1; }
.phrase-text { font-size: 26rpx; color: #2D3748; line-height: 1.6; }

.progress-section { text-align: center; margin-bottom: 32rpx; }
.progress-ring {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: conic-gradient(#48BB78 0deg, #48BB78 calc(3.6deg * var(--pct, 0)), #EDF2F7 calc(3.6deg * var(--pct, 0)));
  display: inline-flex; align-items: center; justify-content: center;
  clip-path: circle(44rpx at center); /* 内圈镂空 */
}
.progress-num { font-size: 36rpx; font-weight: 700; color: #2D3748; }
.progress-num.done { font-size: 40rpx; }
.progress-label { display: block; font-size: 24rpx; color: #718096; margin-top: 12rpx; }

.task-list { display: flex; flex-direction: column; gap: 10rpx; }
.task-card { display: flex; gap: 16rpx; padding: 20rpx 20rpx; background: #FFFFFF; border-radius: 16rpx; align-items: flex-start; }
.task-card.done { opacity: 0.55; }
.task-check { padding-top: 4rpx; }
.check-box { font-size: 32rpx; }
.task-body { flex: 1; }
.task-header { display: flex; align-items: center; gap: 10rpx; margin-bottom: 10rpx; }
.task-emoji { font-size: 26rpx; }
.task-title { font-size: 28rpx; font-weight: 600; color: #2D3748; }
.task-title.done { text-decoration: line-through; color: #A0AEC0; }
.task-babies { display: flex; gap: 12rpx; }
.baby-chip { font-size: 22rpx; padding: 6rpx 18rpx; border-radius: 20rpx; }
.baby-chip.blue { background: #EBF8FF; color: #4299E1; }
.baby-chip.pink { background: #FFF5F5; color: #F56565; }
.baby-chip.off { background: #F7FAFC; color: #CBD5E0; text-decoration: line-through; }

.bottom-actions { position: fixed; bottom: 0; left: 0; right: 0; padding: 24rpx 32rpx calc(48rpx + env(safe-area-inset-bottom)); background: linear-gradient(transparent, #FFFBF5 30%); }
.btn-start, .btn-done { width: 100%; padding: 28rpx 0; background: #4299E1; color: #FFFFFF; border: none; border-radius: 24rpx; font-size: 36rpx; font-weight: 600; }
.btn-done { background: #48BB78; }
.btn-reset { width: 100%; padding: 28rpx 0; background: #FFFFFF; color: #718096; border: 2rpx solid #E2E8F0; border-radius: 24rpx; font-size: 30rpx; }
</style>
