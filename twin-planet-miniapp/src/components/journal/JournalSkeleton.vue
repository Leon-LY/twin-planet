<template>
  <TwinSkeleton :type="type" :count="count" />
</template>

<script setup lang="ts">
import TwinSkeleton from '@/components/twin-skeleton/twin-skeleton.vue'

withDefaults(defineProps<{
  type?: 'brand' | 'twins' | 'list' | 'grid' | 'logs'
  count?: number
}>(), {
  type: 'list',
  count: 3,
})
</script>
