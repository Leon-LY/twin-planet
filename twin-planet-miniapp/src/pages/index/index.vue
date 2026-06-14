<template>
  <view class="page-shell">
    <text class="heading-xl" style="margin-bottom:32rpx">双宝记</text>
    <text class="body-text">页面加载成功！Store测试：{{ test }}</text>
  </view>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useUserStore } from "@/stores/user"
const userStore = useUserStore()
const test = ref(userStore.isLoggedIn ? '已登录' : '未登录')
onMounted(() => { uni.setNavigationBarTitle({ title: "双宝记" }) })
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
