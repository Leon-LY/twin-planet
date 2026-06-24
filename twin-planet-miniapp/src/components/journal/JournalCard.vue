<template>
  <view :class="cardClass">
    <view v-if="$slots.tape || tape" class="card-tape">
      <slot name="tape">
        <JournalTape :variant="tape" v-if="tape" />
      </slot>
    </view>
    <slot />
    <view v-if="curl" class="journal-curl-abs" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JournalTape from './JournalTape.vue'

const props = withDefaults(defineProps<{
  variant?: 'paper' | 'accent' | 'entry' | 'deep'
  accent?: 'amber' | 'terracotta' | 'mint' | 'gold'
  tape?: 'amber' | 'terracotta' | 'mint' | 'gold'
  curl?: boolean
  margin?: boolean
}>(), {
  variant: 'paper',
})

const cardClass = computed(() => ({
  'card-paper': props.variant === 'paper',
  'card-accent': props.variant === 'accent',
  'card-entry': props.variant === 'entry',
  'journal-card-deep': props.variant === 'deep',
  'journal-margin': props.margin,
  'rose': props.accent === 'terracotta',
  'mint': props.accent === 'mint',
  'gold': props.accent === 'gold',
  'journal-curl': props.curl,
}))
</script>

<style scoped>
.card-tape {
  position: relative;
  z-index: var(--z-decorative);
}
.journal-curl-abs {
  position: absolute;
  right: -2rpx;
  bottom: -2rpx;
  pointer-events: none;
}
</style>
