<!--
  宇宙星场背景 · Cosmic Starfield
  纯 CSS box-shadow 实现 — 零额外 DOM 元素，微信小程序高性能。
-->
<template>
  <view class="starfield-bg" aria-hidden="true">
    <view class="stars-layer" />
  </view>
</template>

<script setup lang="ts">
// 纯 CSS 组件，无 JS 逻辑
</script>

<style scoped>
.starfield-bg {
  position: fixed; inset: 0;
  pointer-events: none; overflow: hidden; z-index: 0;
}

.stars-layer {
  position: absolute; top: 0; left: 0;
  width: 4rpx; height: 4rpx;
  border-radius: 50%;
  background: transparent;
  animation: starTwinkle 3s var(--ease-pulse) infinite;
  /* 用 box-shadow 生成 50 颗星星 — 零额外 DOM */
  box-shadow:
    40rpx 60rpx   #F0ECFF,
    120rpx 30rpx  #F0ECFF,
    200rpx 80rpx  #E8D5FF,
    300rpx 20rpx  #F0ECFF,
    380rpx 100rpx #8B86A3,
    460rpx 40rpx  #F0ECFF,
    550rpx 90rpx  #E8D5FF,
    630rpx 30rpx  #F0ECFF,
    700rpx 70rpx  #8B86A3,
    80rpx 150rpx  #F0ECFF,
    180rpx 200rpx #E8D5FF,
    280rpx 140rpx #8B86A3,
    360rpx 220rpx #F0ECFF,
    450rpx 160rpx #E8D5FF,
    540rpx 200rpx #F0ECFF,
    640rpx 180rpx #8B86A3,
    710rpx 150rpx #F0ECFF,
    20rpx 280rpx  #8B86A3,
    150rpx 320rpx #F0ECFF,
    250rpx 260rpx #E8D5FF,
    350rpx 350rpx #F0ECFF,
    480rpx 300rpx #8B86A3,
    580rpx 340rpx #F0ECFF,
    680rpx 280rpx #E8D5FF,
    60rpx 420rpx  #F0ECFF,
    190rpx 460rpx #8B86A3,
    310rpx 400rpx #F0ECFF,
    420rpx 480rpx #E8D5FF,
    530rpx 420rpx #F0ECFF,
    650rpx 500rpx #8B86A3,
    100rpx 550rpx #F0ECFF,
    230rpx 600rpx #E8D5FF,
    370rpx 540rpx #8B86A3,
    500rpx 580rpx #F0ECFF,
    610rpx 620rpx #E8D5FF,
    40rpx 680rpx  #F0ECFF,
    170rpx 720rpx #8B86A3,
    290rpx 660rpx #F0ECFF,
    430rpx 750rpx #E8D5FF,
    560rpx 700rpx #F0ECFF,
    690rpx 760rpx #8B86A3,
    80rpx 820rpx  #F0ECFF,
    210rpx 860rpx #E8D5FF,
    340rpx 800rpx #8B86A3,
    470rpx 880rpx #F0ECFF,
    600rpx 840rpx #E8D5FF,
    720rpx 900rpx #F0ECFF,
    130rpx 940rpx #8B86A3,
    260rpx 980rpx #F0ECFF,
    400rpx 920rpx #E8D5FF;
}
</style>
