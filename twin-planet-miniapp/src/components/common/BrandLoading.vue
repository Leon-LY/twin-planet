<template>
  <view class="brand-loading">
    <view class="foxes">
      <!-- Amber 狐（大宝） -->
      <view class="fox fox-amber">
        <view class="fox-body"></view>
        <view class="fox-tail"></view>
      </view>
      <!-- Terracotta 狐（小宝） -->
      <view class="fox fox-terracotta">
        <view class="fox-body"></view>
        <view class="fox-tail"></view>
      </view>
    </view>
    <view class="brand-text">
      <text class="brand-name">双宝记</text>
      <text class="brand-slogan">并蒂而生，同步成长</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.brand-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--paper);
  gap: 48rpx;
}

.foxes {
  display: flex;
  align-items: center;
  gap: 8rpx;
  position: relative;
}

.fox {
  position: relative;
  width: 80rpx;
  height: 80rpx;
}

/* 狐狸身体 — 略扁的椭圆 */
.fox-body {
  position: absolute;
  width: 64rpx;
  height: 56rpx;
  border-radius: 50%;
  top: 12rpx;
  left: 8rpx;
  animation: foxBreathe 3s var(--ease-soft) infinite;
}

/* 狐狸尾巴 — 从身体侧面延伸 */
.fox-tail {
  position: absolute;
  width: 32rpx;
  height: 20rpx;
  border-radius: 50%;
  top: 28rpx;
  animation: tailWag 3s var(--ease-soft) infinite;
}

/* Amber 狐（暖阳色） */
.fox-amber .fox-body {
  background: var(--amber);
  box-shadow: 0 4rpx 16rpx rgba(224,123,62,0.25);
}
.fox-amber .fox-tail {
  right: 0;
  background: var(--amber);
  opacity: 0.7;
  transform-origin: left center;
}

/* Terracotta 狐（陶土色） */
.fox-terracotta .fox-body {
  background: var(--terracotta);
  box-shadow: 0 4rpx 16rpx rgba(192,133,82,0.25);
}
.fox-terracotta .fox-tail {
  left: 0;
  background: var(--terracotta);
  opacity: 0.7;
  transform-origin: right center;
}

/* 呼吸动画 — 双狐同步脉动 */
@keyframes foxBreathe {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.06); }
}

/* 尾巴摆动 — 交错相位 */
@keyframes tailWag {
  0%,100% { transform: rotate(0deg); }
  25%     { transform: rotate(-8deg); }
  75%     { transform: rotate(8deg); }
}

/* 品牌文字 */
.brand-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  animation: fadeInScale 0.8s var(--ease-page) 0.6s both;
}
.brand-name {
  font-family: var(--font-journal);
  font-size: 56rpx;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: 6rpx;
}
.brand-slogan {
  font-size: 24rpx;
  color: var(--ink-md);
  letter-spacing: 8rpx;
}
</style>
