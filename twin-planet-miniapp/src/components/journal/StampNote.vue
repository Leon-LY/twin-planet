<!-- 便签式盖章卡片 — 从首页弹出，单宝宝记录 -->
<template>
  <view v-if="visible" class="sn-overlay" @click="$emit('close')">
    <view class="sn-card" @click.stop>
      <!-- 便签撕边胶带 -->
      <view class="sn-tape" />

      <text class="sn-title">记一笔</text>

      <!-- 宝宝选择行 -->
      <view class="sn-babies">
        <view
          v-if="babyA"
          class="sn-baby"
          :class="{ active: selectedBabyId === babyA.id }"
          @click="selectedBabyId = babyA.id"
        >
          <image class="sn-baby-avatar" :src="'/static/avatars/baby-a-amber.png'" mode="aspectFill" />
          <text class="sn-baby-name" :style="{ color: selectedBabyId === babyA.id ? 'var(--amber)' : 'var(--ink-md)' }">{{ babyA.nickname || babyA.name || '大宝' }}</text>
        </view>
        <view
          v-if="babyB"
          class="sn-baby"
          :class="{ active: selectedBabyId === babyB.id }"
          @click="selectedBabyId = babyB.id"
        >
          <image class="sn-baby-avatar" :src="'/static/avatars/baby-b-terracotta.png'" mode="aspectFill" />
          <text class="sn-baby-name" :style="{ color: selectedBabyId === babyB.id ? 'var(--terracotta)' : 'var(--ink-md)' }">{{ babyB.nickname || babyB.name || '小宝' }}</text>
        </view>
      </view>

      <!-- 印章网格（6 枚） -->
      <view class="sn-stamps">
        <view
          v-for="s in sortedStamps"
          :key="s.type"
          class="sn-stamp"
          :class="{ dimmed: lastStampedType === s.type }"
          @click="doStamp(s.type)"
        >
          <view class="stamp-body" :class="`stamp-${s.type}`">
            <text class="stamp-emoji">{{ s.emoji }}</text>
          </view>
          <text class="stamp-label">{{ s.label }}</text>
        </view>
      </view>

      <!-- 盖章反馈 -->
      <text class="sn-feedback" v-if="stampFeedback">{{ stampFeedback }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecordsStore } from '@/stores/records'
import { useHaptic } from '@/composables/useHaptic'

interface Baby {
  id: string
  nickname?: string
  name: string
  birthOrder: number
}

const props = defineProps<{
  visible: boolean
  babyA: Baby | null
  babyB: Baby | null
  defaultBabyId: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const recordsStore = useRecordsStore()
const haptic = useHaptic()

const STAMPS = [
  { type: 'feeding' as const, emoji: '🍼', label: '喂奶' },
  { type: 'sleep' as const, emoji: '😴', label: '哄睡' },
  { type: 'diaper' as const, emoji: '💧', label: '尿布' },
  { type: 'temperature' as const, emoji: '🌡️', label: '体温' },
  { type: 'medicine' as const, emoji: '💊', label: '用药' },
  { type: 'bath' as const, emoji: '🛁', label: '洗澡' },
]

/** 智能排序：深夜优先喂奶/哄睡，早晨优先尿布 */
const sortedStamps = computed(() => {
  const h = new Date().getHours()
  const order = [...STAMPS]
  // 深夜 22-06：喂奶、哄睡排前
  if (h >= 22 || h < 6) {
    const feeding = order.splice(order.findIndex(s => s.type === 'feeding'), 1)[0]
    const sleep = order.splice(order.findIndex(s => s.type === 'sleep'), 1)[0]
    order.unshift(sleep, feeding)
  }
  // 早晨 06-09：尿布排第二
  else if (h >= 6 && h < 9) {
    const diaper = order.splice(order.findIndex(s => s.type === 'diaper'), 1)[0]
    order.splice(1, 0, diaper)
  }
  return order
})

const selectedBabyId = ref<string | null>(null)
const lastStampedType = ref<string>('')
const stampFeedback = ref('')

watch(() => props.visible, (v) => {
  if (v) {
    selectedBabyId.value = props.defaultBabyId
    lastStampedType.value = ''
    stampFeedback.value = ''
  }
})

function doStamp(type: string) {
  const babyId = selectedBabyId.value
  if (!babyId) {
    uni.showToast({ title: '请先选择宝宝', icon: 'none', duration: 1000 })
    return
  }

  const baby = [props.babyA, props.babyB].find(b => b?.id === babyId)
  const babyName = baby?.nickname || baby?.name || '宝宝'

  recordsStore.quickLog(babyId, type as any)
  haptic.sparkle()

  // 短暂反馈
  lastStampedType.value = type
  const stamp = STAMPS.find(s => s.type === type)
  stampFeedback.value = `✅ ${stamp?.emoji} ${babyName} · ${stamp?.label}`
  setTimeout(() => {
    lastStampedType.value = ''
    stampFeedback.value = ''
  }, 1500)
}
</script>

<style scoped>
.sn-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(45,35,24,0.3);
  display: flex; align-items: center; justify-content: center;
  z-index: 998;
  animation: fadeIn .25s var(--ease-soft);
}

.sn-card {
  width: 580rpx;
  background:
    radial-gradient(ellipse 50% 40% at 30% 20%, rgba(224,123,62,0.06) 0%, transparent 55%),
    radial-gradient(ellipse 45% 35% at 70% 75%, rgba(79,174,110,0.04) 0%, transparent 50%),
    var(--paper);
  border-radius: 12rpx 24rpx 12rpx 24rpx;
  padding: 28rpx 28rpx 24rpx;
  box-shadow:
    0 8rpx 40rpx rgba(45,35,24,0.12),
    0 2rpx 8rpx rgba(45,35,24,0.06),
    inset 0 1rpx 0 rgba(255,255,255,0.4);
  position: relative;
  animation: fadeInScale .35s var(--ease-page) both;
}

/* 和纸胶带 */
.sn-tape {
  position: absolute; top: -10rpx; left: 50%; transform: translateX(-50%) rotate(-2.5deg);
  width: 80rpx; height: 22rpx;
  background: linear-gradient(175deg, rgba(224,123,62,0.30), rgba(224,123,62,0.12));
  border-radius: 3rpx 1rpx 4rpx 2rpx;
  box-shadow: 0 1rpx 2rpx rgba(0,0,0,0.05);
}

.sn-title {
  display: block; text-align: center;
  font-family: var(--font-journal); font-size: 28rpx; font-weight: 700;
  color: var(--ink); margin-bottom: 20rpx;
  position: relative; z-index: 1;
}

/* === 宝宝选择 === */
.sn-babies {
  display: flex; gap: 16rpx; justify-content: center; margin-bottom: 20rpx;
}
.sn-baby {
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  padding: 12rpx 28rpx;
  border-radius: 20rpx;
  border: 2rpx solid var(--dot);
  background: var(--cream);
  transition: all .2s var(--ease-stamp);
}
.sn-baby.active {
  border-color: var(--amber);
  background: var(--amber-lt);
  transform: scale(1.04);
  box-shadow: 0 0 12rpx rgba(224,123,62,0.15);
}
.sn-baby-avatar {
  width: 60rpx; height: 60rpx; border-radius: 50%;
  border: 2rpx solid var(--cream);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}
.sn-baby-name {
  font-family: var(--font-journal); font-size: 24rpx; font-weight: 600;
}

/* === 印章网格 === */
.sn-stamps {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rpx 12rpx;
  padding: 16rpx 12rpx;
  background: linear-gradient(180deg, rgba(0,0,0,0.015), transparent 30%, var(--paper));
  border-radius: 16rpx;
  border: 1.5rpx solid var(--dot);
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.04);
  margin-bottom: 12rpx;
}
.sn-stamp {
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  transition: all .2s var(--ease-stamp);
}
.sn-stamp:active { transform: scale(0.90); }
.sn-stamp.dimmed { opacity: 0.5; }

/* 复用 record 页的印章 CSS */
.stamp-body {
  width: 72rpx; height: 72rpx;
  border-radius: 46% 54% 52% 48% / 48% 50% 54% 52%;
  background: var(--cream);
  display: flex; align-items: center; justify-content: center;
  box-shadow:
    0 2rpx 0 rgba(160,110,70,0.3),
    0 3rpx 8rpx rgba(0,0,0,0.08),
    0 1rpx 0 rgba(255,255,255,0.6) inset;
  position: relative;
  transform: rotate(-1deg);
  transition: all .25s var(--ease-stamp);
}
.stamp-body::before {
  content: ''; position: absolute; inset: 4rpx; border-radius: inherit; z-index: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 3rpx, rgba(0,0,0,0.015) 3rpx, rgba(0,0,0,0.015) 4rpx);
}
.stamp-body::after {
  content: ''; position: absolute; inset: -1rpx; border-radius: inherit; z-index: -1; pointer-events: none;
  background:
    radial-gradient(ellipse 30% 50% at 15% 40%, rgba(224,123,62,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 25% 45% at 80% 55%, rgba(224,123,62,0.06) 0%, transparent 55%);
  opacity: 0.6;
}
.stamp-emoji { font-size: 34rpx; position: relative; z-index: 1; }

/* 各印章主题色 */
.stamp-feeding {
  box-shadow: 0 2rpx 0 rgba(160,110,70,0.35), 0 3rpx 8rpx rgba(0,0,0,0.08), 0 1rpx 0 rgba(255,255,255,0.6) inset;
  background: radial-gradient(ellipse 55% 60% at 38% 42%, rgba(224,123,62,0.08) 0%, transparent 55%), var(--cream);
}
.stamp-sleep {
  transform: rotate(1.5deg);
  background: radial-gradient(ellipse 50% 55% at 40% 45%, rgba(45,35,24,0.05) 0%, transparent 55%), var(--cream);
  box-shadow: 0 2rpx 0 rgba(60,50,40,0.35), 0 3rpx 8rpx rgba(0,0,0,0.06);
}
.stamp-diaper {
  transform: rotate(-2deg);
  background: radial-gradient(ellipse 55% 60% at 44% 40%, rgba(192,133,82,0.07) 0%, transparent 55%), var(--cream);
  box-shadow: 0 2rpx 0 rgba(150,100,65,0.35), 0 3rpx 8rpx rgba(0,0,0,0.06);
}
.stamp-temperature {
  transform: rotate(0.8deg);
  background: radial-gradient(ellipse 50% 55% at 42% 45%, rgba(79,174,110,0.06) 0%, transparent 55%), var(--cream);
  box-shadow: 0 2rpx 0 rgba(70,140,95,0.35), 0 3rpx 8rpx rgba(0,0,0,0.06);
}
.stamp-medicine {
  transform: rotate(-1.2deg);
  background: radial-gradient(ellipse 55% 60% at 40% 43%, rgba(200,153,62,0.07) 0%, transparent 55%), var(--cream);
  box-shadow: 0 2rpx 0 rgba(170,130,50,0.35), 0 3rpx 8rpx rgba(0,0,0,0.06);
}
.stamp-bath {
  transform: rotate(1.8deg);
  background: radial-gradient(ellipse 50% 55% at 45% 40%, rgba(156,142,124,0.06) 0%, transparent 55%), var(--cream);
  box-shadow: 0 2rpx 0 rgba(120,110,100,0.35), 0 3rpx 8rpx rgba(0,0,0,0.06);
}

/* 盖章反馈 */
.sn-feedback {
  display: block; text-align: center;
  font-family: var(--font-journal); font-size: 24rpx; color: var(--mint);
  animation: fadeInScale .3s var(--ease-bounce) both;
  padding: 8rpx 0 0;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes fadeInScale { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
</style>
