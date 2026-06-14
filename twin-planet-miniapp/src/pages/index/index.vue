<template>
  <view class="page-shell">
    <text class="heading-xl">双宝记</text>
    <text class="body-text" style="display:block;margin-top:32rpx">纯静态页面 — 无脚本</text>
    <view style="margin-top:40rpx">
      <text class="caption">品牌色测试:</text>
      <view style="display:flex;gap:16rpx;margin-top:16rpx">
        <view style="width:80rpx;height:80rpx;border-radius:50%;background:var(--amber)"/>
        <view style="width:80rpx;height:80rpx;border-radius:50%;background:var(--rose)"/>
        <view style="width:80rpx;height:80rpx;border-radius:50%;background:var(--mint)"/>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
