<template>
  <view class="close-btn" @click="$emit('click', $event)">
    <text class="iconfont">✕</text>
  </view>
</template>

<script setup lang="ts">
defineEmits<{ click: [event: any] }>()
</script>
