<!--
  宇宙星场背景 · Cosmic Starfield
  纯 CSS 实现 — 不用 Canvas，WeChat 小程序兼容。
  多层星星以不同速度闪烁，营造深邃太空感。
-->
<template>
  <view class="starfield-bg" aria-hidden="true">
    <!-- 远处的星星：小而慢 -->
    <view class="starfield-layer stars-distant">
      <view
        v-for="star in distantStars"
        :key="'d'+star.id"
        class="star-dot"
        :style="{
          left: star.x + 'rpx',
          top: star.y + 'rpx',
          width: star.size + 'rpx',
          height: star.size + 'rpx',
          animationDelay: star.delay + 's',
          animationDuration: star.duration + 's',
          opacity: star.opacity,
        }"
      />
    </view>
    <!-- 近处的星星：大而亮 -->
    <view class="starfield-layer stars-near">
      <view
        v-for="star in nearStars"
        :key="'n'+star.id"
        class="star-dot star-near"
        :style="{
          left: star.x + 'rpx',
          top: star.y + 'rpx',
          width: star.size + 'rpx',
          height: star.size + 'rpx',
          animationDelay: star.delay + 's',
          animationDuration: star.duration + 's',
          opacity: star.opacity,
        }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

/**
 * 生成伪随机星星分布。用确定的 seed 保证每次渲染一致，
 * 避免 Vue 重渲染造成的闪烁。
 */
function generateStars(count: number, maxX: number, maxY: number, seed: number): Star[] {
  const stars: Star[] = []
  let s = seed
  for (let i = 0; i < count; i++) {
    s = (s * 16807) % 2147483647
    const x = (s % maxX)
    s = (s * 16807) % 2147483647
    const y = (s % maxY)
    s = (s * 16807) % 2147483647
    stars.push({
      id: i,
      x,
      y,
      size: 1 + (s % 3),
      delay: (s % 500) / 100,
      duration: 2 + (s % 4),
      opacity: 0.15 + ((s % 40) / 100),
    })
  }
  return stars
}

// 用 750rpx 设计稿宽度，高度取典型屏幕 ~1200rpx
const distantStars = computed(() => generateStars(60, 750, 1200, 42))
const nearStars = computed(() => generateStars(20, 750, 1200, 137))
</script>

<style scoped>
.starfield-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.starfield-layer {
  position: absolute;
  inset: 0;
}

.star-dot {
  position: absolute;
  border-radius: 50%;
  background: var(--text-starlight);
  animation: starTwinkle var(--dur-breathe) var(--ease-pulse) infinite;
}

.star-near {
  background: var(--cosmic-chrome);
  box-shadow: 0 0 4rpx rgba(232,213,255,0.3);
}

@keyframes starTwinkle {
  0%, 100% { opacity: inherit; transform: scale(1); }
  50%      { opacity: calc(inherit * 3); transform: scale(1.6); }
}
</style>
