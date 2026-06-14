<!-- 贴纸收集册 -->
<template>
  <view class="stickers-page">
    <view class="page-header">
      <text class="page-title">贴纸收集册</text>
      <text class="page-subtitle">{{ store.collectionCount }} / {{ store.totalStickers }} 已收集</text>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
    </view>

    <!-- 分类展示 -->
    <view v-for="cat in categories" :key="cat.key" class="category">
      <text class="cat-label">{{ cat.label }}</text>
      <view class="cat-grid">
        <view v-for="s in cat.stickers" :key="s.label" class="sticker-cell" :class="{ earned: s.earned }">
          <text class="cell-emoji">{{ s.earned ? s.emoji : '❓' }}</text>
          <text class="cell-label" :class="{ earned: s.earned }">{{ s.label }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="store.collectionCount === 0">
      <text class="empty-emoji">📒</text>
      <text class="empty-title">贴纸册空空如也</text>
      <text class="empty-desc">开始记录双宝日常，收集第一张贴纸吧~</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStickersStore, STICKER_RULES } from '@/stores/stickers'

const store = useStickersStore()

const progressPercent = computed(() =>
  store.totalStickers > 0 ? Math.round((store.collectionCount / store.totalStickers) * 100) : 0
)

// 从 store 规则推导贴纸目录
const ALL_STICKERS = STICKER_RULES.map(r => ({
  emoji: r.emoji, label: r.label, category: r.category,
}))

const earnedSet = computed(() => new Set(store.stickers.map(s => s.label)))

const categories = computed(() => [
  { key: 'record', label: '📋 日常守护', stickers: enrich('record') },
  { key: 'streak', label: '🔥 连续记录', stickers: enrich('streak') },
  { key: 'sync', label: '💫 双宝同步', stickers: enrich('sync') },
  { key: 'milestone', label: '🌱 里程碑', stickers: enrich('milestone') },
  { key: 'special', label: '👑 特殊成就', stickers: enrich('special') },
])

function enrich(cat: string) {
  return ALL_STICKERS
    .filter(s => s.category === cat)
    .map(s => ({ ...s, earned: earnedSet.value.has(s.label) }))
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '贴纸收集册' })
})
</script>

<style scoped>
.stickers-page {
  min-height: 100vh;
  background: var(--paper);
  padding: 40rpx 28rpx calc(64rpx + env(safe-area-inset-bottom));
}
.page-header { margin-bottom: 24rpx; }
.page-title { display: block; font-family: var(--font-journal); font-size: var(--font-title); color: var(--ink); }
.page-subtitle { font-size: var(--font-body); color: var(--ink-md); margin-top: 4rpx; }

.progress-bar {
  height: 8rpx;
  background: var(--dot);
  border-radius: 4rpx;
  margin-bottom: 40rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--gold);
  border-radius: 4rpx;
  transition: width .5s var(--ease-soft);
}

.category { margin-bottom: 36rpx; }
.cat-label {
  font-family: var(--font-journal);
  font-size: var(--font-body);
  font-weight: 700;
  color: var(--ink);
  display: block;
  margin-bottom: 16rpx;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}
.sticker-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 20rpx 8rpx;
  background: var(--cream);
  border-radius: var(--radius-sm);
  border: 2rpx solid var(--dot);
  opacity: 0.4;
}
.sticker-cell.earned {
  opacity: 1;
  border-color: var(--gold);
  background: var(--gold-lt);
}
.cell-emoji { font-size: 40rpx; }
.cell-label { font-size: 18rpx; color: var(--ink-md); text-align: center; }
.cell-label.earned { color: var(--ink); font-weight: 600; }

.empty { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48px; display: block; margin-bottom: 16rpx; }
.empty-title { display: block; font-family: var(--font-journal); font-size: var(--font-card); color: var(--ink); }
.empty-desc { font-size: var(--font-body); color: var(--ink-md); margin-top: 8rpx; }
</style>
