<template>
  <button
    :class="btnClass"
    :loading="loading"
    :disabled="disabled"
    @click="$emit('click', $event)"
    class="j-btn"
  >
    <text v-if="icon" class="j-btn-icon iconfont" :class="icon"></text>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  breathe?: boolean
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{ click: [event: any] }>()

const btnClass = computed(() => ({
  'btn-primary': props.variant === 'primary' || !props.variant,
  'btn-outline': props.variant === 'outline',
  'btn-danger': props.variant === 'danger',
  'btn-ghost': props.variant === 'ghost',
  'btn-sm': props.size === 'sm',
  'primary': props.size === 'sm' && (props.variant === 'primary' || !props.variant),
  'btn-breathe': props.breathe,
  'btn-lg': props.size === 'lg',
  'btn-md': props.size === 'md' || !props.size,
}))
</script>

<style scoped>
.j-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  white-space: nowrap;
}
.j-btn-icon {
  font-size: 1.1em;
}
.btn-lg {
  min-height: 100rpx;
  padding: 28rpx 48rpx;
  font-size: 36rpx;
  border-radius: var(--radius-full);
}
.btn-md {
  min-height: 88rpx;
  padding: 24rpx 40rpx;
  font-size: 28rpx;
  border-radius: var(--radius-full);
}
</style>
