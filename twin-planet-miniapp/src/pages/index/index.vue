<!-- MINIMAL DEBUG PAGE -->
<template>
  <view class="page-shell">
    <text class="heading-xl">双宝记 Debug</text>
    <text>If you see this, the framework works.</text>
  </view>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { uni.setNavigationBarTitle({ title: 'Debug' }) })
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
