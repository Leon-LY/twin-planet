<template>
  <view class="segment">
    <view
      v-for="item in items"
      :key="item.value"
      class="segment-item"
      :class="{ active: modelValue === item.value }"
      @click="select(item.value)"
    >
      <text v-if="item.icon" class="iconfont seg-icon" :class="item.icon"></text>
      <text class="seg-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts" generic="T extends string">
defineProps<{
  items: { label: string; value: T; icon?: string }[]
  modelValue?: T
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function select(value: T) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.segment {
  display: inline-flex;
  background: var(--paper);
  border: 1.5rpx solid var(--dot);
  border-radius: var(--radius-full);
  box-shadow: inset 0 1rpx 3rpx rgba(0,0,0,0.04);
  overflow: hidden;
}
.segment-item {
  padding: 12rpx 24rpx;
  font-size: var(--font-caption);
  color: var(--ink-md);
  font-weight: 500;
  transition: all 0.2s var(--ease-stamp);
  display: flex;
  align-items: center;
  gap: 4rpx;
  white-space: nowrap;
}
.segment-item.active {
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%, transparent 40%,
    rgba(0,0,0,0.03) 100%
  ), var(--cream);
  color: var(--amber);
  box-shadow: 0 1.5rpx 0 rgba(0,0,0,0.04), 0 2rpx 6rpx rgba(0,0,0,0.04);
  border-radius: var(--radius-full);
}
.seg-icon {
  font-size: 0.9em;
}
</style>
