<template>
  <view class="wash-spot" :class="wash" :style="sizeStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  wash?: 'amber' | 'terracotta' | 'mint' | 'gold' | 'ink' | 'stain'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  wash: 'amber',
  size: 'md',
})

const sizeStyle = computed(() => {
  const sizes: Record<string, string> = { sm: '50% 50%', md: '75% 75%', lg: '100% 100%' }
  return { width: sizes[props.size] || '75%', height: sizes[props.size] || '75%' }
})
</script>
