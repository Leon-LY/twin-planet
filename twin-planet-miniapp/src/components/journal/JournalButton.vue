<template>
  <button
    :class="btnClass"
    :loading="loading"
    :disabled="disabled"
    @tap="handleTap"
    class="j-btn"
  >
    <text v-if="icon" class="j-btn-icon iconfont" :class="icon"></text>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  breathe?: boolean
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{ click: [] }>()

function handleTap() {
  if (props.disabled || props.loading) return
  emit('click')
}

const btnClass = computed(() => ({
  'btn-primary': props.variant === 'primary',
  'btn-outline': props.variant === 'outline',
  'btn-danger': props.variant === 'danger',
  'btn-ghost': props.variant === 'ghost',
  'btn-sm': props.size === 'sm',
  'btn-lg': props.size === 'lg',
  'btn-breathe': props.breathe,
}))
</script>

<style scoped>
/* 重置小程序原生 button 默认样式 */
button {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  line-height: inherit;
  font-size: inherit;
  color: inherit;
  border-radius: 0;
}
button::after {
  border: none;
}

.j-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
}
.j-btn-icon { font-size: 1.1em; }

/* ── 主按钮：陶土色 ── */
.btn-primary {
  background: var(--terracotta);
  color: var(--cream);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: 0 4rpx 16rpx rgba(192,133,82,0.25);
  transition: all var(--dur-fast) var(--ease-stamp);
  min-height: var(--touch-min);
  padding: 24rpx 40rpx;
  font-size: var(--font-body);
  font-weight: 600;
}
.btn-primary:active {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(192,133,82,0.15);
}
.btn-primary[disabled] {
  background: var(--ink-lt);
  color: var(--ink-md);
  box-shadow: none;
  opacity: 0.6;
}

/* ── 描边按钮 ── */
.btn-outline {
  background: var(--paper);
  color: var(--ink);
  border: 2rpx solid var(--dot);
  border-radius: var(--radius-full);
  box-shadow: 0 2rpx 6rpx rgba(45,35,24,0.03);
  transition: all var(--dur-fast) var(--ease-stamp);
  min-height: var(--touch-min);
  padding: 20rpx 32rpx;
  font-size: var(--font-body);
  font-weight: 500;
}
.btn-outline:active {
  transform: scale(0.96);
  border-color: var(--terracotta);
  background: var(--terracotta-lt);
}

/* ── 危险按钮 ── */
.btn-danger {
  background: var(--twin-danger);
  color: var(--cream);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: 0 4rpx 16rpx rgba(212,112,107,0.2);
  transition: all var(--dur-fast) var(--ease-stamp);
  min-height: var(--touch-min);
  padding: 24rpx 40rpx;
  font-size: var(--font-body);
  font-weight: 600;
}
.btn-danger:active {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(212,112,107,0.12);
}

/* ── 幽灵按钮 ── */
.btn-ghost {
  background: transparent;
  color: var(--ink-md);
  border: none;
  border-radius: var(--radius-sm);
  transition: all var(--dur-fast) var(--ease-soft);
  padding: 16rpx 28rpx;
  font-size: var(--font-body);
  font-weight: 500;
}
.btn-ghost:active {
  background: var(--terracotta-lt);
  color: var(--terracotta);
}

/* ── 小号 ── */
.btn-sm {
  padding: 14rpx 24rpx !important;
  font-size: var(--font-sm) !important;
  min-height: auto;
}
.btn-lg {
  min-height: 100rpx;
  padding: 28rpx 48rpx;
  font-size: 36rpx;
  border-radius: var(--radius-full);
}
</style>
