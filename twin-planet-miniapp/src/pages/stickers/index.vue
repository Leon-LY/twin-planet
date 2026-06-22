<!-- 贴纸收集册 v2.0 — 按收藏册分组 + 稀有度系统 -->
<template>
  <view class="stickers-page journal-paper page-enter">
    <view class="page-header">
      <text class="page-title">贴纸收集册</text>
      <text class="page-subtitle">{{ store.collectionCount }} / {{ store.totalStickers }} 已收集 · {{ store.completionRate }}%</text>
    </view>

    <!-- 总进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: store.completionRate + '%' }" />
    </view>

    <!-- 分享成就 -->
    <view class="share-row" v-if="store.collectionCount > 0">
      <button class="share-btn" open-type="share">
        <text><text class="iconfont icon-share"></text> 分享我的贴纸成就</text>
        <text class="share-sub">{{ store.completionRate }}% · {{ store.collectionCount }}/{{ store.totalStickers }}</text>
      </button>
      <view class="save-card-btn" @click="saveShareCard">
        <text>📸 保存收集卡到相册</text>
      </view>
    </view>

    <!-- Canvas 分享卡片（隐藏） -->
    <canvas canvas-id="stickerShareCanvas"
      style="position:fixed;left:-9999px;top:-9999px;width:345px;height:500px">
    </canvas>

    <!-- 按收藏册分组展示 -->
    <view v-for="col in collections" :key="col.key" class="collection">
      <!-- 收藏册标题 -->
      <view class="col-header">
        <text class="col-icon">{{ col.icon }}</text>
        <view class="col-title-wrap">
          <text class="col-title">{{ col.title }}</text>
          <text class="col-subtitle">{{ col.subtitle }}</text>
        </view>
        <text class="col-count" :class="{ completed: col.completed }">
          {{ col.earned }}/{{ col.total }}
          <text v-if="col.completed" class="col-complete-badge">✓</text>
        </text>
      </view>

      <!-- 收藏册进度条 -->
      <view class="col-progress">
        <view class="col-progress-fill" :class="{ completed: col.completed }" :style="{ width: (col.total > 0 ? col.earned / col.total * 100 : 0) + '%' }" />
      </view>

      <!-- 贴纸网格 -->
      <view class="col-grid">
        <view
          v-for="s in col.stickers"
          :key="s.label"
          class="sticker-cell"
          :class="[
            `rarity-${s.rarity}`,
            { earned: s.earned, locked: !s.earned }
          ]"
        >
          <!-- 已解锁 -->
          <template v-if="s.earned">
            <!-- 插画优先渲染，加载失败自动降级到 emoji -->
            <image v-if="s.illustration && !brokenImages.has(s.label)" :src="s.illustration" mode="aspectFit" class="cell-illustration" @error="handleImageError(s.label)" />
            <text v-else-if="s.iconClass" class="cell-emoji iconfont" :class="s.iconClass"></text>
            <text v-else class="cell-emoji">{{ s.emoji }}</text>
            <text class="cell-label">{{ s.label }}</text>
            <text class="cell-rarity-icon">{{ rarityIcon(s.rarity) }}</text>
          </template>
          <!-- 未解锁：隐藏册显示神秘?，其他册显示幽灵预览 -->
          <template v-else>
            <template v-if="col.key === 'hidden'">
              <text class="cell-silhouette">?</text>
              <text class="cell-hint">???</text>
            </template>
            <template v-else>
              <!-- 幽灵预览 — 展示贴纸实际图片但高度降透明 + 锁标 -->
              <image v-if="s.illustration" :src="s.illustration" mode="aspectFit" class="cell-ghost-img" />
              <text v-else-if="s.iconClass" class="cell-ghost iconfont" :class="s.iconClass"></text>
              <text v-else class="cell-ghost">{{ s.emoji }}</text>
              <text class="cell-lock">🔒</text>
              <text class="cell-hint">{{ s.hint || s.label }}</text>
            </template>
          </template>
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
import { computed, ref, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useStickersStore, STICKER_COLLECTIONS, RARITY_CONFIG, type StickerRarity } from '@/stores/stickers'
import { trackPageView } from '@/utils/analytics'
import { drawStickerShareCard } from '@/utils/stickerShareCard'
import { saveToAlbum } from '@/utils/media'

const store = useStickersStore()

/** 记录加载失败的贴纸图片（label → true），用于降级到 emoji 显示 */
const brokenImages = ref<Set<string>>(new Set())

/** 图片加载失败时标记并触发降级 */
function handleImageError(label: string) {
  brokenImages.value = new Set([...brokenImages.value, label])
  console.warn('[sticker] image load failed, fallback to emoji:', label)
}

function rarityIcon(rarity: StickerRarity): string {
  return RARITY_CONFIG[rarity]?.icon || ''
}

const _saving = ref(false)

/** 生成并保存贴纸收集分享卡片 */
async function saveShareCard() {
  if (_saving.value) return
  _saving.value = true
  try {
    uni.showLoading({ title: '生成中...' })
    const progress = store.collectionProgress
    const data = {
      earned: store.collectionCount,
      total: store.totalStickers,
      rate: store.completionRate,
      collections: progress.map(c => ({
        icon: c.icon,
        title: c.title,
        earned: c.earned,
        total: c.total,
        completed: c.completed,
      })),
    }
    const path = await drawStickerShareCard('stickerShareCanvas', data)
    uni.hideLoading()
    await saveToAlbum(path)
    uni.showToast({ title: '已保存到相册，去分享吧 📸', icon: 'success', duration: 2000 })
  } catch (err) {
    uni.hideLoading()
    console.error('[stickerShareCard]', err)
    uni.showToast({ title: '生成失败，稍后再试', icon: 'none' })
  } finally {
    _saving.value = false
  }
}

/** 按收藏册分组，合并规则与已解锁状态 */
const collections = computed(() => {
  const earned = store.earnedLabels
  return STICKER_COLLECTIONS.map(col => {
    const rules = store.rulesByCollection[col.key] || []
    const stickers = rules.map(r => ({
      ...r,
      earned: earned.has(r.label),
    }))
    const progress = store.collectionProgress.find(p => p.collection === col.key)
    return {
      key: col.key,
      icon: col.icon,
      title: col.title,
      subtitle: col.subtitle,
      stickers,
      earned: progress?.earned ?? 0,
      total: progress?.total ?? 0,
      completed: progress?.completed ?? false,
    }
  })
})

onMounted(() => {
  uni.setNavigationBarTitle({ title: '贴纸收集册' })
  trackPageView('stickers')
})



onShareAppMessage(() => ({
  title: '🦊 双宝记 · 我的贴纸收集册',
  path: '/pages/index/index',
  imageUrl: '/static/share-brand.png',
}))
</script>

<style scoped>
.stickers-page {
  min-height: 100vh;
  background: var(--paper);
  padding: 40rpx 28rpx calc(100rpx + env(safe-area-inset-bottom));
}
.page-header { margin-bottom: 24rpx; }
.page-title { display: block; font-family: var(--font-journal); font-size: var(--font-title); color: var(--ink); }
.page-subtitle { font-size: var(--font-body); color: var(--ink-md); margin-top: 4rpx; }

/* === 总进度条 === */
.progress-bar {
  height: 8rpx;
  background: var(--dot);
  border-radius: 4rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--gold);
  border-radius: 4rpx;
  transition: width .5s var(--ease-soft);
}

/* === 分享按钮 === */
.share-row { margin-bottom: 36rpx; }
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
.share-sub { font-size: 22rpx; font-weight: 400; color: var(--ink-md); }

/* 保存收集卡按钮 */
.save-card-btn {
  width: 100%;
  padding: 16rpx 0;
  margin-top: 12rpx;
  background: var(--cream);
  border: 1.5px dashed var(--dot);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 24rpx;
  color: var(--ink-md);
  font-family: var(--font-journal);
  transition: all .15s var(--ease-stamp);
}
.save-card-btn:active {
  border-color: var(--mint);
  color: var(--mint);
  background: rgba(79,174,110,0.06);
}

/* === 收藏册区块 === */
.collection { margin-bottom: 40rpx; }
.col-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 10rpx;
}
.col-icon { font-size: 36rpx; }
.col-title-wrap { flex: 1; display: flex; flex-direction: column; }
.col-title {
  font-family: var(--font-journal);
  font-size: var(--font-body);
  font-weight: 700;
  color: var(--ink);
}
.col-subtitle { font-size: 20rpx; color: var(--ink-md); }
.col-count {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--ink-md);
  font-family: var(--font-journal);
}
.col-count.completed { color: var(--gold); }
.col-complete-badge { color: var(--mint); margin-left: 4rpx; }

/* === 收藏册进度条 === */
.col-progress {
  height: 4rpx;
  background: var(--dot);
  border-radius: 2rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}
.col-progress-fill {
  height: 100%;
  background: var(--terracotta);
  border-radius: 2rpx;
  transition: width .5s var(--ease-soft);
}
.col-progress-fill.completed { background: var(--gold); }

/* === 贴纸网格 === */
.col-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

/* === 贴纸格子基础 === */
.sticker-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  height: 220rpx;
  padding: 12rpx 8rpx;
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}

/* === 未解锁态 === */
.sticker-cell.locked {
  border: 2rpx dashed var(--dot);
  background: rgba(0,0,0,0.02);
}
/* 幽灵预览 — PNG图片版：透明度降到极低 + 覆盖灰色遮罩 */
.cell-ghost-img {
  width: 130rpx;
  height: 130rpx;
  opacity: 0.12;
  position: relative;
  z-index: 0;
}
/* 幽灵预览 — emoji/icon文本版 */
.cell-ghost {
  font-size: 64rpx;
  opacity: 0.15;
  position: relative;
  z-index: 0;
}
.cell-lock {
  font-size: 20rpx;
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  z-index: 1;
  opacity: 0.5;
}
.cell-silhouette {
  font-size: 50rpx;
  color: var(--ink-lt);
  font-weight: 700;
  font-family: var(--font-journal);
}
.cell-hint {
  font-size: 18rpx;
  color: var(--ink-lt);
  text-align: center;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* === 已解锁通用 === */
.sticker-cell.earned { opacity: 1; }
.cell-illustration {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
}
.cell-emoji {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  border-radius: 50%;
}
.cell-label {
  font-size: 22rpx;
  color: var(--ink);
  font-weight: 600;
  text-align: center;
  max-width: 150rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-rarity-icon {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  font-size: 18rpx;
}

/* === C 日常 — 虚线边框 === */
.sticker-cell.earned.rarity-common {
  border: 2rpx solid var(--dot);
  background: linear-gradient(160deg, var(--paper) 0%, rgba(254,249,240,0.5) 100%);
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
}
.sticker-cell.earned.rarity-common .cell-emoji {
  background: var(--paper);
  border: 2rpx solid var(--dot);
  color: var(--ink);
}

/* === R 稀有 — 实线边框 + 光晕 === */
.sticker-cell.earned.rarity-rare {
  border: 2rpx solid var(--terracotta);
  background: linear-gradient(160deg, rgba(192,133,82,0.08) 0%, rgba(192,133,82,0.02) 100%);
  box-shadow: 0 0 16rpx rgba(192,133,82,0.2), 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.sticker-cell.earned.rarity-rare .cell-emoji {
  background: rgba(192,133,82,0.12);
  border: 2rpx solid var(--terracotta);
  color: var(--terracotta);
}

/* === E 史诗 — 金色双层 + 粒子 === */
.sticker-cell.earned.rarity-epic {
  border: 3rpx solid var(--gold);
  background: linear-gradient(160deg, rgba(200,153,62,0.12) 0%, rgba(200,153,62,0.03) 100%);
  box-shadow:
    0 0 0 1rpx var(--gold),
    0 0 20rpx rgba(200,153,62,0.3),
    0 4rpx 12rpx rgba(0,0,0,0.08);
}
.sticker-cell.earned.rarity-epic .cell-emoji {
  background: rgba(200,153,62,0.15);
  border: 2rpx solid var(--gold);
  color: var(--gold);
}
.sticker-cell.earned.rarity-epic::before {
  content: '';
  position: absolute;
  top: 6rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 20%;
  background: radial-gradient(ellipse at 50% 0%, rgba(200,153,62,0.25) 0%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
}

/* === L 传说 — 虹彩 + 强光晕 + 烫金底 === */
.sticker-cell.earned.rarity-legendary {
  border: 3rpx solid var(--amber);
  background:
    radial-gradient(circle at 30% 30%, rgba(224,123,62,0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(200,153,62,0.15) 0%, transparent 50%),
    linear-gradient(135deg, rgba(192,133,82,0.08) 0%, rgba(224,123,62,0.08) 100%);
  box-shadow:
    0 0 0 1rpx var(--gold),
    0 0 24rpx rgba(224,123,62,0.35),
    0 0 12rpx rgba(200,153,62,0.2),
    0 4rpx 16rpx rgba(0,0,0,0.1);
}
.sticker-cell.earned.rarity-legendary .cell-emoji {
  background: linear-gradient(135deg, rgba(224,123,62,0.15) 0%, rgba(200,153,62,0.15) 100%);
  border: 2rpx solid var(--amber);
  color: var(--amber);
}
.sticker-cell.earned.rarity-legendary::before {
  content: '';
  position: absolute;
  top: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 25%;
  background: radial-gradient(ellipse at 50% 0%, rgba(255,220,150,0.35) 0%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
}
.sticker-cell.earned.rarity-legendary::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(to top, rgba(200,153,62,0.08) 0%, transparent 100%);
  pointer-events: none;
}

/* === 空状态 === */
.empty { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48rpx; display: block; margin-bottom: 16rpx; }
.empty-title { display: block; font-family: var(--font-journal); font-size: var(--font-card); color: var(--ink); }
.empty-desc { font-size: var(--font-body); color: var(--ink-md); margin-top: 8rpx; }
</style>
