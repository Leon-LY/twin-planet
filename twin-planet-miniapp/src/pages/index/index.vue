<template>
  <view class="page-shell">
    <text class="heading-xl">{{ greeting }}</text>
    <text class="body-text" style="display:block;margin-top:8rpx">{{ greetLine2 }}</text>
    <text class="body-text" style="display:block;margin-top:8rpx">{{ dateStr }}</text>
    <text class="body-text" style="display:block;margin-top:8rpx">{{ roleEmoji }} {{ roleLabel }} | 连续{{ streakDays }}天 | {{ insightText }}</text>
  </view>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { useBabiesStore } from "@/stores/babies"
import { useRecordsStore } from "@/stores/records"
const userStore=useUserStore();const babiesStore=useBabiesStore();const recordsStore=useRecordsStore()
const streakDays=computed(()=>recordsStore.streakDays)
const greeting=computed(()=>{const h=new Date().getHours();if(h<6)return'凌晨好';if(h<9)return'早上好';if(h<12)return'上午好';if(h<14)return'中午好';if(h<18)return'下午好';if(h<22)return'晚上好';return'夜深了'})
const greetLine2=computed(()=>{const h=new Date().getHours();const r=userStore.profile?.role;return r==='dad'?'数据看板已就绪':h<14?'新的一天，两个小怪兽醒了没':'下午好，小怪兽们在干嘛呢'})
const roleEmoji=computed(()=>userStore.roleEmoji)
const roleLabel=computed(()=>userStore.roleLabel)
const dateStr=computed(()=>{const d=new Date();const days=['日','一','二','三','四','五','六'];return d.getMonth()+1+'月'+d.getDate()+'日 星期'+days[d.getDay()]})
const syncRate=computed(()=>recordsStore.twinSyncRate)
const insightText=computed(()=>'同步率 '+syncRate.value+'%')
const babyA=computed(()=>babiesStore.babyA)
const babyB=computed(()=>babiesStore.babyB)
onMounted(()=>{uni.setNavigationBarTitle({title:'双宝记'})})
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
