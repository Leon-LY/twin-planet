<template>
  <view class="j-page-header">
    <view v-if="$slots.icon || icon" class="j-page-icon">
      <slot name="icon">
        <text class="iconfont" :class="icon"></text>
      </slot>
    </view>
    <view class="j-page-titles">
      <text class="j-page-title">{{ title }}</text>
      <text v-if="subtitle" class="j-page-subtitle">{{ subtitle }}</text>
    </view>
    <view v-if="$slots.extra" class="j-page-extra">
      <slot name="extra" />
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.j-page-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx dashed var(--dot);
}
.j-page-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--amber);
}
.j-page-titles {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.j-page-title {
  font-family: var(--font-journal);
  font-size: var(--font-title);
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -1rpx;
}
.j-page-subtitle {
  font-size: var(--font-caption);
  color: var(--ink-md);
}
.j-page-extra {
  flex-shrink: 0;
}
</style>
