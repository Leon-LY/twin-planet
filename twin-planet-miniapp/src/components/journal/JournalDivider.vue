<template>
  <view :class="dividerClass" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'dot' | 'stitch' | 'dashed'
}>(), {
  variant: 'dashed',
})

const dividerClass = computed(() => ({
  'journal-divider': props.variant === 'dashed',
  'divider-dot': props.variant === 'dot',
  'divider-stitch': props.variant === 'stitch',
}))
</script>
