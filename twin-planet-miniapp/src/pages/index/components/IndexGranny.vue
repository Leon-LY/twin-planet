<!-- 奶奶/爷爷模式 — 3个大按钮 + 今日摘要 -->
<template>
  <view class="page-shell granny-shell journal-paper page-enter">
    <text class="heading-xl" style="text-align:center;display:block;margin-bottom:8rpx">双宝记</text>
    <text class="body-text" style="text-align:center;display:block;margin-bottom:32rpx">{{ greeting }}</text>

    <!-- P1-7: 今日摘要卡片 -->
    <view class="granny-summary" v-if="summaryA || summaryB">
      <view class="granny-summary-item" v-if="summaryA">
        <text class="granny-summary-name amber">🐣 {{ summaryA.name }}</text>
        <text class="granny-summary-text">{{ summaryA.text }}</text>
      </view>
      <view class="granny-summary-item" v-if="summaryB">
        <text class="granny-summary-name rose">🐥 {{ summaryB.name }}</text>
        <text class="granny-summary-text">{{ summaryB.text }}</text>
      </view>
    </view>
    <view class="granny-summary granny-summary-empty" v-else>
      <text class="granny-summary-text">今天还没有记录，点下面按钮开始吧</text>
    </view>

    <view class="granny-actions">
      <view class="granny-btn" @click="goRecord"><text class="granny-emoji">✏️</text><text class="granny-label">记一笔</text></view>
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
import { useBabiesStore } from '@/stores/babies'

const props = defineProps<{ goRecord: () => void; goGrowth: () => void; goHelp: () => void }>()

const recordsStore = useRecordsStore()
const userStore = useUserStore()
const babiesStore = useBabiesStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h<6) return '凌晨好'; if (h<9) return '早上好'; if (h<12) return '上午好'
  if (h<14) return '中午好'; if (h<18) return '下午好'; if (h<22) return '晚上好'
  return '夜深了'
})

// P1-7: 今日摘要计算
const todayStart = new Date().setHours(0,0,0,0)
const summaryA = computed(() => {
  const baby = babiesStore.babyA; if (!baby) return null
  const logs = recordsStore.logs.filter(l => l.babyId === baby.id && l.createdAt >= todayStart)
  if (!logs.length) return null
  const counts: Record<string,number> = {}
  logs.forEach(l => { counts[l.type] = (counts[l.type]||0) + 1 })
  const parts: string[] = []
  if (counts.feeding) parts.push(`喂了${counts.feeding}次`)
  if (counts.sleep) parts.push(`睡了${counts.sleep}觉`)
  if (counts.diaper) parts.push(`换了${counts.diaper}次尿布`)
  return { name: baby.nickname || '大宝', text: parts.join(' · ') || '今天有记录' }
})
const summaryB = computed(() => {
  const baby = babiesStore.babyB; if (!baby) return null
  const logs = recordsStore.logs.filter(l => l.babyId === baby.id && l.createdAt >= todayStart)
  if (!logs.length) return null
  const counts: Record<string,number> = {}
  logs.forEach(l => { counts[l.type] = (counts[l.type]||0) + 1 })
  const parts: string[] = []
  if (counts.feeding) parts.push(`喂了${counts.feeding}次`)
  if (counts.sleep) parts.push(`睡了${counts.sleep}觉`)
  if (counts.diaper) parts.push(`换了${counts.diaper}次尿布`)
  return { name: baby.nickname || '二宝', text: parts.join(' · ') || '今天有记录' }
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
.granny-btn{text-align:center;padding:64rpx;background:linear-gradient(180deg,rgba(255,255,255,0.5) 0%,transparent 35%,rgba(0,0,0,0.03) 100%),var(--cream);border-radius:var(--radius-lg);border:3rpx solid var(--dot);display:flex;flex-direction:column;align-items:center;gap:16rpx;box-shadow:0 4rpx 0 rgba(0,0,0,0.06),0 6rpx 16rpx rgba(0,0,0,0.04),0 10rpx 28rpx rgba(0,0,0,0.03)}
.granny-btn:active{border-color:var(--amber);transform:scale(.97);box-shadow:0 2rpx 0 rgba(0,0,0,0.04),0 3rpx 8rpx rgba(0,0,0,0.03)}
.granny-help{border-color:var(--gold)}
.granny-emoji{font-size:80rpx}
.granny-label{font-family:var(--font-journal);font-size:52rpx;font-weight:700;color:var(--ink)}
/* P1-7: 今日摘要卡片 */
.granny-summary{background:linear-gradient(180deg,rgba(255,255,255,0.45) 0%,var(--cream) 100%);border-radius:var(--radius-md);padding:28rpx 32rpx;margin-bottom:36rpx;border:2rpx solid var(--dot);box-shadow:0 1rpx 0 rgba(0,0,0,0.03),0 2rpx 8rpx rgba(0,0,0,0.04)}
.granny-summary-item{display:flex;flex-direction:column;gap:6rpx;padding:12rpx 0}
.granny-summary-item+.granny-summary-item{border-top:1.5px dashed var(--dot);padding-top:16rpx}
.granny-summary-name{font-size:36rpx;font-weight:600}
.granny-summary-name.amber{color:var(--amber)}
.granny-summary-name.rose{color:var(--rose)}
.granny-summary-text{font-size:32rpx;color:var(--ink);line-height:1.5}
.granny-summary-empty{text-align:center;padding:24rpx}
.last-update{text-align:center;font-size:var(--font-caption);color:var(--ink-lt);margin-top:40rpx}
</style>
