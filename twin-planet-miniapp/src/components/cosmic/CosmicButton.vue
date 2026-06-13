<!--
  宇宙按钮 · CosmicButton
  新粗野主义主按钮 — 厚霓虹边框 + 光晕 + 按压缩放。

  Props:
    variant   - 'primary' | 'outline' | 'danger' | 'ghost' | 'a' | 'b'
    disabled  - 是否禁用
    block     - 是否块级（全宽）
    size      - 'sm' | 'md' | 'lg'
    glowPulse - 是否霓虹闪烁动画
-->
<template>
  <button
    class="cosmic-btn"
    :class="[variantClass, sizeClass, { block, 'glow-pulse': glowPulse }]"
    :disabled="disabled"
    :hover-class="disabled ? '' : 'cosmic-btn-hover'"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'danger' | 'ghost' | 'a' | 'b'
  disabled?: boolean
  block?: boolean
  size?: 'sm' | 'md' | 'lg'
  glowPulse?: boolean
}>(), {
  variant: 'primary',
  disabled: false,
  block: true,
  size: 'md',
  glowPulse: false,
})

defineEmits<{ click: [] }>()

const variantClass = computed(() => `btn-${props.variant}`)
const sizeClass = computed(() => `btn-${props.size}`)
</script>

<style scoped>
.cosmic-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 700;
  letter-spacing: 2rpx;
  transition: transform var(--dur-instant), box-shadow var(--dur-quick), opacity var(--dur-quick);
  position: relative;
  /* 重置 button 默认样式 */
  padding: 0;
  margin: 0;
  line-height: 1;
  background: none;
}
.cosmic-btn::after { border: none; } /* 覆盖 uni-app button 伪元素 */

/* --- 尺寸 --- */
.btn-sm { min-height: 72rpx; padding: 16rpx 28rpx; font-size: var(--font-body); }
.btn-md { min-height: 88rpx; padding: 24rpx 40rpx; font-size: var(--font-body-lg); }
.btn-lg { min-height: 104rpx; padding: 30rpx 48rpx; font-size: var(--font-card); }

/* --- 变体 --- */

/* Primary — 霓虹边框 + 微光晕 */
.btn-primary {
  background: var(--surface-card);
  color: var(--text-starlight);
  border: 3rpx solid var(--border-glow);
  box-shadow: 0 0 16rpx rgba(0,229,255,0.08);
}
.btn-primary.cosmic-btn-hover {
  box-shadow: 0 0 32rpx rgba(0,229,255,0.2);
}

/* Outline */
.btn-outline {
  background: transparent;
  color: var(--text-starlight);
  border: 2rpx solid var(--border-void);
}
.btn-outline.cosmic-btn-hover {
  border-color: var(--cosmic-cyan);
}

/* Ghost — 无边框、微背景 */
.btn-ghost {
  background: rgba(255,255,255,0.04);
  color: var(--text-dust);
  border: 1rpx solid transparent;
}
.btn-ghost.cosmic-btn-hover {
  background: rgba(255,255,255,0.08);
  color: var(--text-starlight);
}

/* 大宝星球色 — 宇宙琥珀 */
.btn-a {
  background: rgba(255,107,53,0.12);
  color: var(--twin-a);
  border: 2rpx solid rgba(255,107,53,0.25);
  box-shadow: 0 0 16rpx var(--twin-a-glow);
}
.btn-a.cosmic-btn-hover {
  background: rgba(255,107,53,0.2);
  box-shadow: 0 0 28rpx var(--twin-a-glow);
}

/* 二宝星球色 — 星云紫罗兰 */
.btn-b {
  background: rgba(168,85,247,0.12);
  color: var(--twin-b);
  border: 2rpx solid rgba(168,85,247,0.25);
  box-shadow: 0 0 16rpx var(--twin-b-glow);
}
.btn-b.cosmic-btn-hover {
  background: rgba(168,85,247,0.2);
  box-shadow: 0 0 28rpx var(--twin-b-glow);
}

/* Danger — 脉冲星红 */
.btn-danger {
  background: transparent;
  color: var(--cosmic-red);
  border: 2rpx solid var(--cosmic-red);
}
.btn-danger.cosmic-btn-hover {
  background: rgba(255,77,106,0.08);
}

/* --- 块级 --- */
.block { width: 100%; }

/* --- 禁用 --- */
.cosmic-btn[disabled] {
  opacity: 0.3;
  box-shadow: none;
}

/* --- 霓虹闪烁 --- */
.glow-pulse {
  animation: neonFlicker 2s var(--ease-pulse) infinite;
}

/* --- 按压反馈 --- */
.cosmic-btn-hover {
  transform: scale(0.96);
}

@keyframes neonFlicker {
  0%, 100% { box-shadow: 0 0 8rpx var(--cosmic-cyan), 0 0 16rpx rgba(0,229,255,0.3); }
  50%      { box-shadow: 0 0 12rpx var(--cosmic-cyan), 0 0 24rpx rgba(0,229,255,0.5); }
}
</style>
