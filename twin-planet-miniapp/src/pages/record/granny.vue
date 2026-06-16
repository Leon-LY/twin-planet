<!-- 奶奶/爷爷模式 · 精简记录页 v1 — 4个大按钮 + 宝宝选择 -->
<template>
  <view class="granny-record journal-paper page-enter">
    <!-- 宝宝选择 -->
    <view class="granny-baby-tabs">
      <view
        class="granny-baby-tab"
        :class="{ active: activeBabyId === babyA?.id, amber: true }"
        @click="activeBabyId = babyA?.id"
      >
        <text class="granny-baby-emoji iconfont icon-baby-a"></text>
        <text class="granny-baby-name">{{ babyA?.nickname || '大宝' }}</text>
      </view>
      <view
        class="granny-baby-tab"
        :class="{ active: activeBabyId === babyB?.id, rose: true }"
        @click="activeBabyId = babyB?.id"
      >
        <text class="granny-baby-emoji iconfont icon-baby-b"></text>
        <text class="granny-baby-name">{{ babyB?.nickname || '二宝' }}</text>
      </view>
    </view>

    <!-- 当前选中的宝宝提示 -->
    <view class="granny-active-hint" v-if="activeBaby">
      正在为 <text :class="activeBabyId === babyA?.id ? 'amber' : 'rose'">{{ activeBaby.nickname }}</text> 记录
    </view>

    <!-- 4 个大按钮 2x2 网格 -->
    <view class="granny-actions">
      <view class="granny-action-btn" @click="doRecord('feeding')">
        <text class="granny-action-emoji iconfont icon-bottle"></text>
        <text class="granny-action-label">吃奶了</text>
      </view>
      <view class="granny-action-btn" @click="doRecord('sleep')">
        <text class="granny-action-emoji iconfont icon-sleep-zzz"></text>
        <text class="granny-action-label">睡觉了</text>
      </view>
      <view class="granny-action-btn" @click="doRecord('diaper')">
        <text class="granny-action-emoji iconfont icon-diaper"></text>
        <text class="granny-action-label">换尿布</text>
      </view>
      <view class="granny-action-btn" @click="doRecord('temperature')">
        <text class="granny-action-emoji iconfont icon-thermometer"></text>
        <text class="granny-action-label">量体温</text>
      </view>
    </view>

    <!-- 反馈文字 -->
    <view class="granny-feedback" v-if="lastAction">
      <text class="icon-check"></text> 已记录！{{ lastBabyName }}{{ lastActionLabel }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const activeBabyId = ref(babiesStore.babyA?.id ?? babiesStore.babyB?.id ?? '')
const activeBaby = computed(() => babiesStore.getBaby(activeBabyId.value))

const lastAction = ref('')
const lastBabyName = ref('')

const actionLabels: Record<string, string> = {
  feeding: '吃奶了',
  sleep: '睡觉了',
  diaper: '换尿布了',
  temperature: '量体温了',
}

const lastActionLabel = computed(() => actionLabels[lastAction.value] || '')

function doRecord(type: string) {
  const id = activeBabyId.value
  if (!id) {
    uni.showToast({ title: '请先选择宝宝', icon: 'none' })
    return
  }
  recordsStore.quickLog(id, type as any)
  lastBabyName.value = activeBaby.value?.nickname || '宝宝'
  lastAction.value = type
  // 1.5秒后自动返回首页
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style scoped>
.granny-record {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx calc(100rpx + env(safe-area-inset-bottom));
  background: var(--paper);
}

/* ---- 宝宝标签 ---- */
.granny-baby-tabs {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
  width: 100%;
  justify-content: center;
}

.granny-baby-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 28rpx 48rpx;
  border-radius: var(--radius-lg);
  border: 3rpx solid var(--dot);
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 35%, rgba(0,0,0,0.03) 100%), var(--cream);
  box-shadow: 0 3rpx 0 rgba(0,0,0,0.05), 0 4rpx 12rpx rgba(0,0,0,0.04);
  transition: all 0.15s var(--ease-stamp);
  opacity: 0.5;
  min-width: 200rpx;
}

.granny-baby-tab.active {
  opacity: 1;
}

.granny-baby-tab.active.amber {
  border-color: var(--amber);
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(224,123,62,0.04) 100%), var(--amber-lt);
  box-shadow: 0 3rpx 0 rgba(224,123,62,0.2), 0 4rpx 12rpx rgba(224,123,62,0.1);
}

.granny-baby-tab.active.rose {
  border-color: var(--rose);
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(212,128,104,0.04) 100%), var(--rose-lt);
  box-shadow: 0 3rpx 0 rgba(212,128,104,0.2), 0 4rpx 12rpx rgba(212,128,104,0.1);
}

.granny-baby-tab:active {
  transform: scale(0.95);
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.06);
}

.granny-baby-emoji {
  font-size: 48rpx;
  transition: transform 0.3s var(--ease-bounce);
}

.granny-baby-tab:active .granny-baby-emoji {
  transform: scale(1.2);
}

.granny-baby-name {
  font-family: var(--font-journal);
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);
}

/* ---- 当前宝宝提示 ---- */
.granny-active-hint {
  font-size: var(--font-sm);
  color: var(--ink-md);
  margin-bottom: 40rpx;
  font-family: var(--font-journal);
}

.granny-active-hint .amber {
  color: var(--amber);
  font-weight: 700;
}

.granny-active-hint .rose {
  color: var(--rose);
  font-weight: 700;
}

/* ---- 4个大按钮 2x2 ---- */
.granny-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28rpx;
  width: 100%;
  max-width: 600rpx;
}

.granny-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  aspect-ratio: 1;
  min-height: 240rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 35%, rgba(0,0,0,0.03) 100%), var(--cream);
  border: 3rpx solid var(--dot);
  border-radius: var(--radius-lg);
  box-shadow: 0 4rpx 0 rgba(0,0,0,0.06), 0 6rpx 16rpx rgba(0,0,0,0.04), 0 10rpx 28rpx rgba(0,0,0,0.03);
  transition: all 0.15s var(--ease-stamp);
}

.granny-action-btn:active {
  transform: scale(0.94);
  border-color: var(--amber);
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 35%, rgba(224,123,62,0.04) 100%), var(--amber-lt);
  box-shadow: inset 0 3rpx 6rpx rgba(0,0,0,0.06), 0 1rpx 0 rgba(0,0,0,0.03);
}

.granny-action-emoji {
  font-size: 80rpx;
  transition: transform 0.3s var(--ease-bounce);
  line-height: 1;
}

.granny-action-btn:active .granny-action-emoji {
  transform: scale(1.15);
}

.granny-action-label {
  font-family: var(--font-journal);
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
}

/* ---- 反馈文字 ---- */
.granny-feedback {
  margin-top: 48rpx;
  font-size: var(--font-md);
  color: var(--mint);
  font-weight: 700;
  font-family: var(--font-journal);
  text-align: center;
  animation: feedbackIn 0.4s var(--ease-soft);
}

@keyframes feedbackIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
