<!-- 奶奶/爷爷模式 — 3个大按钮 -->
<template>
  <view class="page-shell granny-shell journal-paper">
    <text class="heading-xl" style="text-align:center;display:block;margin-bottom:8rpx">双宝记</text>
    <text class="body-text" style="text-align:center;display:block;margin-bottom:64rpx">{{ greeting }}</text>
    <view class="granny-actions">
      <view class="granny-btn" @click="goRecord"><text class="granny-emoji">✋</text><text class="granny-label">记一笔</text></view>
      <view class="granny-btn" @click="goGrowth"><text class="granny-emoji">🌱</text><text class="granny-label">看看长多大了</text></view>
      <view class="granny-btn granny-help" @click="goHelp"><text class="granny-emoji">📞</text><text class="granny-label">问家里人</text></view>
    </view>
    <text class="last-update" v-if="lastUpdateText">最后更新 {{ lastUpdateText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecordsStore } from '@/stores/records'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ goRecord: () => void; goGrowth: () => void; goHelp: () => void }>()

const recordsStore = useRecordsStore()
const userStore = useUserStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h<6) return '凌晨好'; if (h<9) return '早上好'; if (h<12) return '上午好'
  if (h<14) return '中午好'; if (h<18) return '下午好'; if (h<22) return '晚上好'
  return '夜深了'
})

const lastUpdateText = computed(() => {
  const logs = recordsStore.logs
  if (!logs.length) return ''
  const m = Math.floor((Date.now() - logs[logs.length - 1].createdAt) / 60000)
  if (m < 1) return '刚刚'; if (m < 60) return `${m}分钟前`
  return `${Math.floor(m / 60)}小时前`
})
</script>

<style scoped>
.granny-shell{display:flex;flex-direction:column;justify-content:center;min-height:100vh;padding:80rpx 56rpx}
.granny-actions{display:flex;flex-direction:column;gap:40rpx}
.granny-btn{text-align:center;padding:64rpx;background:var(--cream);border-radius:var(--radius-lg);border:4rpx solid var(--dot);display:flex;flex-direction:column;align-items:center;gap:16rpx}
.granny-btn:active{border-color:var(--amber);transform:scale(.97)}
.granny-help{border-color:var(--gold)}
.granny-emoji{font-size:80rpx}
.granny-label{font-family:var(--font-journal);font-size:52rpx;font-weight:700;color:var(--ink)}
.last-update{text-align:center;font-size:28rpx;color:var(--ink-lt);margin-top:40rpx}
</style>
