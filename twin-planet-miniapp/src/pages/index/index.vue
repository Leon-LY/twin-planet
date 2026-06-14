<template>
  <view class="page-shell">
    <text class="heading-xl">双宝记</text>
    <text class="body-text" style="display:block">Store测试: 全部导入成功</text>
    <text class="body-text" style="display:block;margin-top:8rpx">角色: {{ userStore.roleLabel }}</text>
    <text class="body-text" style="display:block">同步率: {{ syncRate }}%</text>
    <text class="body-text" style="display:block">快速参考: {{ quickRef.lastFeeding }}</text>
  </view>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { useBabiesStore } from "@/stores/babies"
import { useRecordsStore } from "@/stores/records"
import { useStickersStore } from "@/stores/stickers"
import { useAlertsStore } from "@/stores/alerts"
import { useStickerSync } from "@/composables/useStickerSync"
import { useQuickRef } from "@/composables/useQuickRef"
import { getDiscoverFeatures } from "@/config/roles"

const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()
const stickersStore = useStickersStore()
const alertsStore = useAlertsStore()
const { syncStickers } = useStickerSync()
const { quickRef } = useQuickRef()
const features = getDiscoverFeatures(userStore.profile?.role)

const syncRate = computed(() => recordsStore.twinSyncRate)
onMounted(() => { 
  uni.setNavigationBarTitle({ title: "双宝记" })
  syncStickers()
})
</script>
<style scoped>
.page-shell{min-height:100vh;background:var(--paper);padding:48rpx 28rpx}
</style>
