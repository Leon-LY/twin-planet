<!-- 奶奶/爷爷专用 — 全屏大字帮助页面（P1-8 整改：替换 ActionSheet 帮助流程） -->
<template>
  <view :class="['help-shell', 'journal-paper', 'page-enter', { 'font-large': isGrandmaMode }]">
    <!-- 返回按钮 -->
    <view class="help-back" @click="goBack">
      <text class="help-back-arrow">←</text>
      <text class="help-back-label">返回</text>
    </view>

    <!-- 标题 -->
    <view class="help-header">
      <text class="help-title">需要帮忙吗？</text>
      <text class="help-subtitle">别着急，点下面的大按钮</text>
    </view>

    <!-- 3 个巨大按钮 -->
    <view class="help-buttons">
      <!-- 1. 一键呼叫 -->
      <view class="help-btn help-btn-call" @click="makeCall">
        <text class="help-btn-emoji">📞</text>
        <text class="help-btn-label">一键呼叫</text>
        <text class="help-btn-hint" v-if="phoneNumber">呼叫 {{ phoneNumber }}</text>
        <text class="help-btn-hint help-btn-hint-warn" v-else>请让家人先在设置中填写联系电话</text>
      </view>

      <!-- 2. 发送求助（微信分享） -->
      <button class="help-btn help-btn-share" open-type="share">
        <text class="help-btn-emoji">📩</text>
        <text class="help-btn-label">发送求助</text>
        <text class="help-btn-hint">"请帮我看看孩子"</text>
      </button>

      <!-- 3. 使用说明 -->
      <view class="help-btn help-btn-guide" @click="toggleGuide">
        <text class="help-btn-emoji iconfont icon-book"></text>
        <text class="help-btn-label">使用说明</text>
        <text class="help-btn-hint">3 步学会记录</text>
      </view>
    </view>

    <!-- 展开式使用说明 -->
    <view class="help-guide" v-if="showGuide">
      <view class="help-step">
        <text class="help-step-emoji iconfont icon-edit"></text>
        <view class="help-step-body">
          <text class="help-step-num">第 1 步</text>
          <text class="help-step-text">点 <text class="help-hl">"记一笔"</text>，选要记录的宝宝</text>
        </view>
      </view>
      <view class="help-step">
        <text class="help-step-emoji iconfont icon-bottle"></text>
        <view class="help-step-body">
          <text class="help-step-num">第 2 步</text>
          <text class="help-step-text">点对应的按钮：<text class="help-hl">吃奶</text>、<text class="help-hl">睡觉</text>、<text class="help-hl">尿布</text> 或 <text class="help-hl">体温</text></text>
        </view>
      </view>
      <view class="help-step">
        <text class="help-step-emoji">✅</text>
        <view class="help-step-body">
          <text class="help-step-num">第 3 步</text>
          <text class="help-step-text">看到 <text class="help-hl">"已记录"</text> 就是成功了！</text>
        </view>
      </view>
    </view>

    <!-- 底部留白 -->
    <view class="help-spacer"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const showGuide = ref(false)
const isGrandmaMode = computed(() => userStore.isGrandmaMode)
const phoneNumber = computed(() => userStore.profile?.phone || '')

function goBack() {
  uni.navigateBack()
}

function makeCall() {
  if (!phoneNumber.value) {
    uni.showToast({ title: '请让家人先在设置中填写联系电话', icon: 'none', duration: 3000 })
    return
  }
  uni.makePhoneCall({ phoneNumber: phoneNumber.value })
}

function toggleGuide() {
  showGuide.value = !showGuide.value
}

onShareAppMessage(() => {
  return {
    title: '请帮我看看孩子',
    path: '/pages/index/index?from=help',
  }
})
</script>

<style scoped>
.help-shell {
  min-height: 100vh;
  padding: 48rpx 48rpx calc(64rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

/* 返回按钮 */
.help-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0;
  margin-bottom: 24rpx;
}
.help-back-arrow {
  font-size: 52rpx;
  color: var(--amber);
  font-weight: 700;
  line-height: 1;
}
.help-back-label {
  font-size: var(--font-card);
  color: var(--amber);
  font-weight: 600;
}

/* 标题区 */
.help-header {
  text-align: center;
  margin-bottom: 56rpx;
}
.help-title {
  display: block;
  font-family: var(--font-journal);
  font-size: var(--font-xl);
  color: var(--ink);
  font-weight: 700;
  margin-bottom: 14rpx;
  line-height: 1.2;
}
.help-subtitle {
  display: block;
  font-size: var(--font-card);
  color: var(--ink-md);
  line-height: 1.4;
}

/* 按钮容器 */
.help-buttons {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

/* 巨大按钮 — 物理凸起 + 按压凹陷 */
.help-btn {
  min-height: 140rpx;
  padding: 44rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border-radius: var(--radius-lg);
  border: 3rpx solid var(--dot);
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 35%, rgba(0,0,0,0.03) 100%), var(--cream);
  box-shadow: 0 4rpx 0 rgba(0,0,0,0.06), 0 6rpx 16rpx rgba(0,0,0,0.04), 0 10rpx 28rpx rgba(0,0,0,0.03);
  transition: all 0.15s var(--ease-stamp);
  position: relative;
  text-align: center;
}
.help-btn:active {
  transform: scale(0.97);
  border-color: var(--amber);
  box-shadow: 0 2rpx 0 rgba(0,0,0,0.04), 0 3rpx 8rpx rgba(0,0,0,0.03);
}

/* 按钮颜色变体 */
.help-btn-call {
  border-color: var(--amber-md);
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 35%, rgba(0,0,0,0.03) 100%), linear-gradient(180deg, var(--amber-lt) 0%, var(--cream) 100%);
}
.help-btn-share {
  border-color: var(--gold-lt);
}
.help-btn-guide {
  border-color: var(--mint);
}

/* 分享按钮 — 重置微信 button 默认样式 */
.help-btn-share {
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 35%, rgba(0,0,0,0.03) 100%), var(--cream);
  line-height: normal;
  box-sizing: border-box;
  font-size: inherit;
}
.help-btn-share::after {
  border: none;
}

.help-btn-emoji {
  font-size: 80rpx;
  line-height: 1;
}

.help-btn-label {
  font-family: var(--font-journal);
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
}

.help-btn-hint {
  font-size: var(--font-card);
  color: var(--ink-md);
  line-height: 1.3;
}
.help-btn-hint-warn {
  color: var(--gold);
}

/* 使用说明卡片 */
.help-guide {
  margin-top: 56rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, var(--cream) 100%);
  border-radius: var(--radius-lg);
  border: 2rpx solid var(--dot);
  padding: 40rpx 36rpx;
  display: flex;
  flex-direction: column;
  gap: 36rpx;
  box-shadow: 0 1rpx 0 rgba(0,0,0,0.03), 0 3rpx 8rpx rgba(0,0,0,0.04);
}

/* 每个步骤 */
.help-step {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}
.help-step-emoji {
  font-size: 64rpx;
  flex-shrink: 0;
  line-height: 1.2;
}
.help-step-body {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}
.help-step-num {
  font-size: var(--font-card);
  color: var(--amber);
  font-weight: 700;
  line-height: 1.3;
}
.help-step-text {
  font-size: var(--font-card);
  color: var(--ink);
  line-height: 1.5;
}

/* 高亮关键词 */
.help-hl {
  color: var(--amber);
  font-weight: 700;
}

/* 底部弹性撑开 */
.help-spacer {
  flex: 1;
  min-height: 32rpx;
}
</style>
