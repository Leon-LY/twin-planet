<template>
  <view :class="pageClass">
    <view v-if="backgroundWash" class="wash-spot" :class="backgroundWash" />
    <view v-if="hasSpine" class="journal-page-spine" />
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  hasPaper?: boolean
  hasSpine?: boolean
  hasSpots?: boolean
  backgroundWash?: 'amber' | 'terracotta' | 'mint' | 'gold' | 'ink' | 'stain' | string
}>(), {
  hasPaper: false,
  hasSpine: false,
  hasSpots: false,
  backgroundWash: '',
})

const pageClass = computed(() => ({
  'journal-page': true,
  'has-paper': props.hasPaper,
  'has-spine': props.hasSpine,
  'has-spots': props.hasSpots,
}))
</script>

<style scoped>
.journal-page-spine {
  position: absolute;
  left: 8rpx;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background: var(--spine-stitch);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}
.has-spots {
  position: relative;
}
</style>
