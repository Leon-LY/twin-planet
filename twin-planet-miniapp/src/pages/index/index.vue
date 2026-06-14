<template>
  <view class="page-shell">
    <text class="heading-xl">双宝记</text>
    <text class="body-text" style="display:block;margin-top:16rpx">用户: {{ userStore.isLoggedIn ? '已登录' : '未登录' }}</text>
    <text class="body-text" style="display:block;margin-top:8rpx">宝宝A: {{ babyA?.nickname || '未设置' }}</text>
    <text class="body-text" style="display:block;margin-top:8rpx">宝宝B: {{ babyB?.nickname || '未设置' }}</text>
    <text class="body-text" style="display:block;margin-top:8rpx">记录数: {{ logCount }}</text>
  </view>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { useBabiesStore } from "@/stores/babies"
import { useRecordsStore } from "@/stores/records"
const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const logCount = computed(() => recordsStore.logs.length)
onMounted(() => { uni.setNavigationBarTitle({ title: "双宝记" }) })
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
