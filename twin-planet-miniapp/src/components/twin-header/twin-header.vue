<template>
  <view class="header">
    <view class="brand-mark brand-mark-sm" />
    <text class="header-title">{{ title }}</text>
    <text class="header-desc" v-if="desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
}>()
</script>

<style scoped>
.header {
  text-align: left;
  margin-bottom: var(--space-lg);
  padding: 8rpx 0;
}
.header-title {
  display: block;
  font-size: var(--font-hero);
  font-weight: 800;
  color: var(--text-starlight);
  line-height: var(--leading-tight);
  letter-spacing: 2rpx;
  margin-top: 16rpx;
}
.header-desc {
  display: block;
  font-size: var(--font-sm);
  color: var(--text-dust);
  line-height: var(--leading-relaxed);
  margin-top: 8rpx;
}
</style>
