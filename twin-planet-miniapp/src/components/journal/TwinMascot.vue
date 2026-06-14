<!-- 双宝记 · 吉祥物 — 使用手绘级 PNG 素材 -->
<template>
  <view class="mascot-wrap" :class="[`size-${size}`, { linked: linked }]">
    <!-- 大宝 -->
    <view class="mascot-item" :class="{ bounce: bouncing === 'a' }">
      <image
        class="mascot-img"
        :src="amberSrc"
        mode="aspectFit"
      />
      <text class="mascot-label" v-if="showLabels">大宝</text>
    </view>

    <!-- 连接线 -->
    <view class="mascot-link" v-if="linked">
      <view class="link-dash" />
      <text class="link-star">✦</text>
      <view class="link-dash" />
    </view>

    <!-- 二宝 -->
    <view class="mascot-item" :class="{ bounce: bouncing === 'b' }">
      <image
        class="mascot-img"
        :src="roseSrc"
        mode="aspectFit"
      />
      <text class="mascot-label" v-if="showLabels">二宝</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  linked?: boolean
  showLabels?: boolean
  bouncing?: '' | 'a' | 'b'
}>()

const amberSrc = computed(() => {
  return props.size === 'sm' ? '/static/mascot-sm-amber.png' : '/static/mascot-amber.png'
})
const roseSrc = computed(() => {
  return props.size === 'sm' ? '/static/mascot-sm-rose.png' : '/static/mascot-rose.png'
})
</script>

<style scoped>
.mascot-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.mascot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* === Sizing === */
.size-sm .mascot-img { width: 64rpx; height: 64rpx; }
.size-sm .mascot-label { font-size: 16rpx; }
.size-sm .link-dash { width: 16rpx; }

.size-md .mascot-img { width: 120rpx; height: 120rpx; }
.size-md .mascot-label { font-size: 20rpx; }
.size-md .link-dash { width: 28rpx; }

.size-lg .mascot-img { width: 200rpx; height: 200rpx; }
.size-lg .mascot-label { font-size: 28rpx; }
.size-lg .link-dash { width: 40rpx; }

.mascot-img {
  border-radius: 50%;
  display: block;
}

/* === 标签 === */
.mascot-label {
  font-family: var(--font-journal);
  color: var(--ink-md);
  margin-top: 8rpx;
  font-weight: 600;
}

/* === 连接线 === */
.mascot-link {
  display: flex;
  align-items: center;
  margin: 0 6rpx;
}
.link-dash {
  height: 2rpx;
  border-top: 2rpx dashed var(--dot);
}
.link-star {
  font-size: 20rpx;
  color: var(--gold);
  margin: 0 2rpx;
}

/* === 弹跳动画 === */
.mascot-item.bounce .mascot-img {
  animation: mascotBounce .5s var(--ease-bounce);
}
@keyframes mascotBounce {
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-20rpx) scale(1.08); }
  70% { transform: translateY(-4rpx) scale(.96); }
  100% { transform: translateY(0) scale(1); }
}
</style>
