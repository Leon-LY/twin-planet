<template>
  <view class="journal-tape" :class="'tape-' + variant" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'amber' | 'terracotta' | 'mint' | 'gold'
}>(), {
  variant: 'amber',
})
</script>
