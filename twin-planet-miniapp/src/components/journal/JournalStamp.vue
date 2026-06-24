<template>
  <view class="journal-stamp" :class="'stamp-' + variant">
    <slot>{{ text }}</slot>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'amber' | 'mint' | 'gold'
  text?: string
}>(), {
  variant: 'amber',
  text: '',
})
</script>
