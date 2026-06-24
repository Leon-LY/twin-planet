<template>
  <view class="empty-state" :class="{ 'empty-state-card': card }">
    <text v-if="emoji" class="empty-emoji">{{ emoji }}</text>
    <text v-if="icon" class="empty-icon iconfont" :class="icon"></text>
    <text class="empty-title">{{ title }}</text>
    <text v-if="desc" class="empty-desc">{{ desc }}</text>
    <view v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  emoji?: string
  icon?: string
  title?: string
  desc?: string
  card?: boolean
}>(), {
  emoji: '🦊',
  title: '还没有内容',
  desc: '',
  card: false,
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64rpx 32rpx;
  text-align: center;
}
.empty-emoji {
  font-size: 72rpx;
  margin-bottom: 20rpx;
}
.empty-icon {
  font-size: 64rpx;
  margin-bottom: 20rpx;
  color: var(--amber);
}
.empty-title {
  font-family: var(--font-journal);
  font-size: var(--font-card);
  color: var(--ink);
  margin-bottom: 8rpx;
}
.empty-desc {
  font-size: var(--font-caption);
  color: var(--ink-md);
  line-height: 1.6;
}
.empty-action {
  margin-top: 24rpx;
}
</style>
