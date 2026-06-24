<template>
  <view
    class="check-stamp"
    :class="{ checked: modelValue }"
    @click="toggle"
  >
    <view v-if="modelValue" class="check-mark">✓</view>
    <slot />
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.check-stamp {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  border: 1.5rpx dashed var(--dot);
  border-radius: var(--radius-top);
  font-size: var(--font-caption);
  color: var(--ink-md);
  transition: all 0.25s var(--ease-stamp);
  background: transparent;
}
.check-stamp.checked {
  border-style: solid;
  border-color: var(--mint);
  background: var(--mint-lt);
  color: var(--mint);
}
.check-mark {
  font-size: 18rpx;
  font-weight: 700;
}
</style>
