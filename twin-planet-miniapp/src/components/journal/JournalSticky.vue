<template>
  <view class="journal-sticky" :style="{ transform: 'rotate(' + rotation + 'deg)' }">
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rotation?: number
}>(), {
  rotation: -1.5,
})
</script>
