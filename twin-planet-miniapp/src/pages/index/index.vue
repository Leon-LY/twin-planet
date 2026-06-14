<template>
  <view class="page-shell">
    <text class="heading-xl">双宝记 · {{ greeting }}</text>
    <text class="body-text" style="display:block;margin-top:16rpx">登录: {{ userStore.isLoggedIn }}</text>
    <text class="body-text" style="display:block">贴纸: {{ stickersStore.collectionCount }}/{{ stickersStore.totalStickers }}</text>
    <text class="body-text" style="display:block">连续: {{ streakDays }}天</text>
  </view>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { useBabiesStore } from "@/stores/babies"
import { useRecordsStore } from "@/stores/records"
import { useStickersStore } from "@/stores/stickers"
const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const stickersStore = useStickersStore()
const streakDays = computed(() => recordsStore.streakDays)
const greeting=computed(()=>{const h=new Date().getHours();if(h<6)return"凌晨好";if(h<9)return"早上好";if(h<12)return"上午好";if(h<14)return"中午好";if(h<18)return"下午好";if(h<22)return"晚上好";return"夜深了"})
onMounted(() => { uni.setNavigationBarTitle({ title: "双宝记" }) })
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
