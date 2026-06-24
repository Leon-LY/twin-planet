<template>
  <view
    :class="chipClass"
    @click="$emit('click', $event)"
  >
    <text v-if="icon" class="iconfont j-chip-icon" :class="icon"></text>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  active?: boolean
  variant?: 'default' | 'tag' | 'mint' | 'terracotta' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
}>(), {
  active: false,
  variant: 'default',
  size: 'md',
})

defineEmits<{ click: [event: any] }>()

const chipClass = computed(() => {
  const isTag = props.variant === 'tag'
  const base = isTag ? 'chip-tag' : 'chip'
  const on = props.active ? 'on' : ''
  const color = !isTag && props.active && props.variant !== 'default' ? props.variant : ''
  return {
    [base]: true,
    [on]: props.active && !isTag,
    [color]: !!color,
    'chip-sm': props.size === 'sm',
    'chip-lg': props.size === 'lg',
  }
})
</script>

<style scoped>
.j-chip-icon {
  font-size: 0.9em;
}
.chip-sm {
  padding: 4rpx 12rpx;
  font-size: 18rpx;
}
.chip-lg {
  padding: 12rpx 22rpx;
  font-size: 28rpx;
}
</style>
