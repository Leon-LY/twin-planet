<!--
  宇宙卡片 · CosmicCard
  新粗野主义风格卡片 — 厚边框、大圆角、可选的星球色光晕。

  Props:
    glow     - 光晕颜色: 'a' | 'b' | 'cyan' | 'green' | 'gold' | null
    active   - 是否选中态
    padding  - 内边距覆盖 (默认 var(--space-md))
    onClick  - 点击回调
-->
<template>
  <view
    class="cosmic-card"
    :class="[glowClass, { active, clickable: !!$attrs.onClick || !!$listeners?.click }]"
    :style="{ padding: padding }"
    @click="$emit('click')"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  glow?: 'a' | 'b' | 'cyan' | 'green' | 'gold' | null
  active?: boolean
  padding?: string
}>(), {
  glow: null,
  active: false,
  padding: 'var(--space-md)',
})

defineEmits<{ click: [] }>()

const glowClass = computed(() => {
  if (!props.glow) return ''
  return `glow-${props.glow}`
})
</script>

<style scoped>
.cosmic-card {
  background: var(--surface-card);
  border: 2rpx solid var(--border-void);
  border-radius: var(--radius-xl);
  transition: border-color var(--dur-quick) var(--ease-orbit),
              box-shadow var(--dur-quick) var(--ease-orbit);
}

.cosmic-card.clickable:active {
  transform: scale(0.98);
  transition: transform var(--dur-instant);
}

.cosmic-card.active {
  border-color: var(--border-active);
}

/* 光晕变体 */
.cosmic-card.glow-a {
  border-color: rgba(255,107,53,0.2);
  box-shadow: 0 0 24rpx rgba(255,107,53,0.06);
}
.cosmic-card.glow-b {
  border-color: rgba(168,85,247,0.2);
  box-shadow: 0 0 24rpx rgba(168,85,247,0.06);
}
.cosmic-card.glow-cyan {
  border-color: rgba(0,229,255,0.15);
  box-shadow: 0 0 20rpx rgba(0,229,255,0.06);
}
.cosmic-card.glow-green {
  border-color: rgba(0,255,163,0.15);
  box-shadow: 0 0 20rpx rgba(0,255,163,0.06);
}
.cosmic-card.glow-gold {
  border-color: rgba(255,210,63,0.2);
  box-shadow: 0 0 24rpx rgba(255,210,63,0.08);
}
</style>
