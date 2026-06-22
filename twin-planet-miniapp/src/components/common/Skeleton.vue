<!-- 手帐纸骨架屏 -->
<template>
  <view class="skeleton-wrap" v-if="loading">
    <view class="skel-card" v-for="i in count" :key="i">
      <view class="skel-line skel-shimmer" :style="{ width: '60%' }"></view>
      <view class="skel-line skel-shimmer" :style="{ width: '90%' }"></view>
      <view class="skel-line skel-shimmer" :style="{ width: '40%' }"></view>
      <view class="skel-line skel-shimmer" :style="{ width: '75%' }"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  loading: boolean
  count?: number
}>(), {
  count: 2,
})
</script>

<style scoped>
.skeleton-wrap {
  padding: 20rpx 0;
}
.skel-card {
  background: var(--cream, #FFF5E8);
  border-radius: 12rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  border: 1.5rpx solid var(--dot, #E8DCC8);
}
.skel-line {
  height: 28rpx;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(90deg, rgba(232,220,200,0.3) 0%, rgba(232,220,200,0.6) 50%, rgba(232,220,200,0.3) 100%);
  background-size: 200% 100%;
  animation: skelShimmer 1.5s ease-in-out infinite;
}
.skel-line:last-child { margin-bottom: 0; }
@keyframes skelShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
