<template>
  <view class="j-tab-bar">
    <view
      v-for="item in items"
      :key="item.value"
      class="tab-item"
      :class="{ active: modelValue === item.value }"
      @click="select(item.value)"
    >
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts" generic="T extends string">
defineProps<{
  items: { label: string; value: T }[]
  modelValue?: T
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function select(value: T) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.j-tab-bar {
  display: flex;
  background: var(--paper);
  border-bottom: 1.5rpx solid var(--dot);
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  font-size: var(--font-body);
  color: var(--ink-md);
  font-weight: 500;
  position: relative;
  transition: all 0.25s var(--ease-stamp);
}
.tab-item.active {
  color: var(--amber);
  font-weight: 700;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  right: 25%;
  height: 4rpx;
  background: var(--amber);
  border-radius: 2rpx;
}
</style>
