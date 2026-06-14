<template>
  <view class="page-shell">
    <text style="font-size:48rpx;color:#2D2318;display:block">双宝记 TEST</text>
    <text style="font-size:28rpx;color:#2D2318;display:block;margin-top:16rpx">greeting硬编码: 下午好</text>
    <text style="font-size:28rpx;color:#2D2318;display:block;margin-top:8rpx">greeting计算: {{ greeting }}</text>
    <text style="font-size:28rpx;color:#2D2318;display:block;margin-top:8rpx">roleEmoji: [{{ roleEmoji }}]</text>
    <text style="font-size:28rpx;color:#2D2318;display:block;margin-top:8rpx">roleLabel: [{{ roleLabel }}]</text>
    <text style="font-size:28rpx;color:#2D2318;display:block;margin-top:8rpx">streakDays: [{{ streakDays }}]</text>
  </view>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { useRecordsStore } from "@/stores/records"
const userStore=useUserStore();const recordsStore=useRecordsStore()
const streakDays=computed(()=>recordsStore.streakDays)
const greeting=computed(()=>{const h=new Date().getHours();if(h<6)return'凌晨好';if(h<9)return'早上好';if(h<12)return'上午好';if(h<14)return'中午好';if(h<18)return'下午好';if(h<22)return'晚上好';return'夜深了'})
const roleEmoji=computed(()=>{try{return userStore.roleEmoji}catch{return'?'}})
const roleLabel=computed(()=>{try{return userStore.roleLabel}catch{return'?'}})
onMounted(()=>{uni.setNavigationBarTitle({title:'双宝记'})})
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
