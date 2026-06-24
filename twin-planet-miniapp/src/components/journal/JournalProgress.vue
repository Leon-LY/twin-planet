<template>
  <view class="j-progress">
    <view class="progress-track">
      <view
        class="progress-fill"
        :class="'fill-' + variant"
        :style="{ width: clampedValue + '%' }"
      />
    </view>
    <text v-if="showLabel" class="progress-label">{{ clampedValue }}%</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value?: number
  variant?: 'gold' | 'amber' | 'mint' | 'terracotta'
  showLabel?: boolean
}>(), {
  value: 0,
  variant: 'amber',
  showLabel: false,
})

const clampedValue = computed(() => Math.max(0, Math.min(100, props.value)))
</script>

<style scoped>
.j-progress {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.progress-track {
  flex: 1;
  height: 10rpx;
  background: var(--dot);
  border-radius: 5rpx;
  box-shadow: inset 0 1rpx 3rpx rgba(0,0,0,0.06);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 5rpx;
  transition: width 0.5s var(--ease-ink);
}
.fill-amber  { background: linear-gradient(90deg, var(--amber-lt), var(--amber)); }
.fill-terracotta { background: linear-gradient(90deg, var(--terracotta-lt), var(--terracotta)); }
.fill-mint   { background: linear-gradient(90deg, var(--mint-lt), var(--mint)); }
.fill-gold   { background: linear-gradient(90deg, var(--gold-lt), var(--gold)); }
.progress-label {
  font-size: var(--font-caption);
  color: var(--ink-md);
  min-width: 48rpx;
  text-align: right;
}
</style>
