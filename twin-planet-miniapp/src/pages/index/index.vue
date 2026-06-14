<template>
  <view style="padding:100rpx;text-align:center">
    <text style="font-size:48rpx;color:#333">双宝记</text>
    <text style="display:block;margin-top:40rpx;font-size:28rpx;color:#666">Hello World</text>
  </view>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { uni.setNavigationBarTitle({ title: 'Hello' }) })
</script>
<style scoped>
</style>
