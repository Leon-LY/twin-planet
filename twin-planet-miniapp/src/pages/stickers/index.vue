<!-- 贴纸收集册 -->
<template>
  <view class="stickers-page journal-paper page-enter">
    <view class="page-header">
      <text class="page-title">贴纸收集册</text>
      <text class="page-subtitle">{{ store.collectionCount }} / {{ store.totalStickers }} 已收集</text>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
    </view>

    <!-- 分享成就 -->
    <view class="share-row" v-if="store.collectionCount > 0">
      <button class="share-btn" open-type="share">
        <text><text class="iconfont icon-share"></text> 分享我的贴纸成就</text>
        <text class="share-sub">{{ progressPercent }}% · {{ store.collectionCount }}/{{ store.totalStickers }}</text>
      </button>
    </view>

    <!-- 分类展示 — 空分类隐藏 -->
    <view v-for="cat in visibleCategories" :key="cat.key" class="category">
      <text class="cat-label"><text v-if="cat.iconClass" class="iconfont" :class="cat.iconClass"></text> {{ cat.label }} · {{ cat.earnedCount }}/{{ cat.total }}</text>
      <view class="cat-grid">
        <view v-for="s in cat.stickers" :key="s.label" class="sticker-cell" :class="{ earned: s.earned }">
          <!-- 优先使用 iconfont 类名，回退到 emoji -->
          <text v-if="s.iconClass" class="cell-emoji iconfont" :class="[s.iconClass, { earned: s.earned }]"></text>
          <text v-else class="cell-emoji" :class="{ earned: s.earned }">{{ s.emoji }}</text>
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
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useStickersStore, STICKER_RULES } from '@/stores/stickers'
import { trackPageView } from '@/utils/analytics'

const store = useStickersStore()

const progressPercent = computed(() =>
  store.totalStickers > 0 ? Math.round((store.collectionCount / store.totalStickers) * 100) : 0
)

// 从 store 规则推导贴纸目录
const ALL_STICKERS = STICKER_RULES.map(r => ({
  emoji: r.emoji, iconClass: r.iconClass, label: r.label, category: r.category,
}))

const earnedSet = computed(() => new Set(store.stickers.map(s => s.label)))

const categories = computed(() => [
  { key: 'record', iconClass: 'icon-clipboard', label: '日常守护', stickers: enrich('record') },
  { key: 'streak', label: '连续记录', stickers: enrich('streak') },
  { key: 'sync', label: '双宝同步', stickers: enrich('sync') },
  { key: 'milestone', iconClass: 'icon-sprout', label: '里程碑', stickers: enrich('milestone') },
  { key: 'special', iconClass: 'icon-crown', label: '特殊成就', stickers: enrich('special') },
])

// 🔧 只显示有贴纸的分类
const visibleCategories = computed(() =>
  categories.value.filter(c => c.stickers.length > 0)
)

function enrich(cat: string) {
  return ALL_STICKERS
    .filter(s => s.category === cat)
    .map(s => ({ ...s, earned: earnedSet.value.has(s.label) }))
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '贴纸收集册' }); trackPageView('stickers')
})

onShareAppMessage(() => ({
  title: '🪐 双宝记 · 我的贴纸收集册',
  path: '/pages/index/index',
  imageUrl: '/static/share-brand.png',
}))
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

.share-row { margin-bottom: 32rpx; }
.share-btn {
  width: 100%;
  padding: 20rpx 0;
  background: var(--amber-lt);
  border: 2rpx solid var(--amber);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--amber);
  line-height: 1.4;
}
.share-btn::after { border: none; }
.share-sub {
  font-size: 22rpx;
  font-weight: 400;
  color: var(--ink-md);
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
  justify-content: center;
  gap: 4rpx;
  aspect-ratio: 1;
  padding: 8rpx;
  border-radius: var(--radius-sm);
  border: 2rpx dashed var(--dot);
  background: transparent;
  opacity: 0.55;
}
.sticker-cell.earned {
  opacity: 1;
  border: 3rpx solid #FFF;
  border-radius: 14rpx 4rpx 14rpx 4rpx;
  background: linear-gradient(160deg, var(--gold-lt) 0%, rgba(200,153,62,0.04) 100%);
  box-shadow:
    0 0 0 1rpx rgba(0,0,0,0.03),
    0 3rpx 8rpx rgba(0,0,0,0.08),
    0 6rpx 16rpx rgba(0,0,0,0.04);
  transform: rotate(-1.2deg);
}
.sticker-cell.earned:nth-child(2n) { transform: rotate(0.8deg); border-radius: 6rpx 16rpx 6rpx 16rpx; }
.sticker-cell.earned:nth-child(3n) { transform: rotate(-1.8deg); border-radius: 16rpx 6rpx 16rpx 6rpx; }
.sticker-cell.earned::after {
  content: '';
  position: absolute;
  top: 6rpx; left: 20%; right: 20%; height: 30%;
  background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
}
.cell-emoji {
  width:64rpx;height:64rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:26rpx;
  background:transparent;color:var(--ink-lt);
  border:2rpx dashed var(--dot);
  opacity: 0.5;
}
.cell-emoji.earned {
  width:56rpx;height:56rpx;
  font-size:32rpx;
  background:var(--gold-lt);color:var(--gold);
  border:2rpx solid var(--gold);
  opacity:1;
}
.cell-label { font-size: 16rpx; color: var(--ink-lt); text-align: center; max-width: 100rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-label.earned { color: var(--ink); font-weight: 600; }

.empty { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48rpx; display: block; margin-bottom: 16rpx; }
.empty-title { display: block; font-family: var(--font-journal); font-size: var(--font-card); color: var(--ink); }
.empty-desc { font-size: var(--font-body); color: var(--ink-md); margin-top: 8rpx; }
</style>
