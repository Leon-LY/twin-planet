<!-- 贴纸条 · 横向滑动展示今日贴纸 -->
<template>
  <view class="sticker-strip" v-if="stickers.length">
    <view class="strip-label">今日贴纸</view>
    <scroll-view scroll-x class="strip-scroll">
      <view class="strip-row">
        <view v-for="(s, i) in stickers" :key="s.id"
          class="sticker-item" :class="[shapeClass(i), { new: isNew(s) }]">
          <!-- 贴纸光泽层 -->
          <view class="sticker-shine" />
          <!-- 贴纸图案 — 插画优先，降级 emoji -->
          <image v-if="s.illustration && !brokenIds.has(s.id)" :src="s.illustration" mode="aspectFit" class="sticker-image" @error="handleImageError(s.id)" />
          <text v-else class="sticker-emoji">{{ s.emoji }}</text>
          <!-- 贴纸标签 -->
          <text class="sticker-label">{{ s.label }}</text>
        </view>
      </view>
    </scroll-view>
    <view class="strip-more" v-if="showMore" @click="$emit('viewAll')">查看全部 →</view>
  </view>
  <view class="sticker-strip empty" v-else>
    <text class="strip-empty-text">今天还没有贴纸，去记录吧~</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Sticker } from '@/stores/stickers'

const props = defineProps<{
  stickers: Sticker[]
  showMore?: boolean
}>()

defineEmits<{ viewAll: [] }>()

/** 记录加载失败的贴纸 ID → 降级到 emoji */
const brokenIds = ref<Set<string>>(new Set())

function handleImageError(id: string) {
  brokenIds.value = new Set([...brokenIds.value, id])
  console.warn('[StickerStrip] image load failed, fallback to emoji:', id)
}

function isNew(s: Sticker): boolean {
  return Date.now() - s.earnedAt < 5000
}

const shapes = ['shape-a','shape-b','shape-c','shape-d','shape-e','shape-f']
function shapeClass(i: number): string {
  return shapes[i % shapes.length]
}
</script>

<style scoped>
.sticker-strip {
  padding: 20rpx 0 24rpx;
  position: relative;
  z-index: 1;
}
.sticker-strip.empty {
  text-align: center;
}
.strip-empty-text {
  font-size: 22rpx;
  color: var(--ink-lt);
  font-family: var(--font-journal);
}
.strip-label {
  font-family: var(--font-journal);
  font-size: 20rpx;
  color: var(--ink-md);
  margin-bottom: 14rpx;
  padding-left: 4rpx;
}
.strip-scroll {
  white-space: nowrap;
}
.strip-row {
  display: inline-flex;
  gap: 20rpx;
  padding: 4rpx 2rpx 8rpx;
}

/* ===== 贴纸本体 ===== */
.sticker-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  width: 96rpx;
  height: 96rpx;
  /* 贴纸白边 — 贴纸纸基 */
  background: var(--paper);
  border: 3rpx solid #FFF;
  box-shadow:
    0 0 0 1rpx rgba(0,0,0,0.04),
    0 2rpx 6rpx rgba(0,0,0,0.07),
    0 4rpx 12rpx rgba(0,0,0,0.04);
  flex-shrink: 0;
  transition: transform .2s var(--ease-bounce);
  overflow: hidden;
}
/* 6种形状变体 */
.sticker-item.shape-a { border-radius: 50%; }
.sticker-item.shape-b { border-radius: 40% 60% 55% 45%; }
.sticker-item.shape-c { border-radius: 14rpx 4rpx 14rpx 4rpx; }
.sticker-item.shape-d { border-radius: 6rpx 16rpx 6rpx 16rpx; }
.sticker-item.shape-e { border-radius: 50% 50% 45% 45%; }
.sticker-item.shape-f { border-radius: 8rpx; }

/* 每张贴纸不同旋转 */
.sticker-item.shape-a { transform: rotate(-2deg); }
.sticker-item.shape-b { transform: rotate(1.5deg); }
.sticker-item.shape-c { transform: rotate(-1deg); }
.sticker-item.shape-d { transform: rotate(2.5deg); }
.sticker-item.shape-e { transform: rotate(-2.8deg); }
.sticker-item.shape-f { transform: rotate(0.5deg); }

.sticker-item.new {
  animation: stickerUnlock .7s var(--ease-stamp) both;
}

/* 贴纸光泽 — 顶部高光模拟塑料膜 */
.sticker-shine {
  position: absolute;
  top: 4rpx;
  left: 20%;
  right: 20%;
  height: 30%;
  background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* 贴纸图案 — 插画优先 */
.sticker-image {
  width: 64rpx;
  height: 64rpx;
  position: relative;
  z-index: 0;
}

/* 贴纸图案 — emoji 为主体 */
.sticker-emoji {
  font-size: 40rpx;
  position: relative;
  z-index: 0;
  text-shadow: 0 1rpx 1rpx rgba(0,0,0,0.1);
}

/* 贴纸标签 — 极小文字 */
.sticker-label {
  font-size: 16rpx;
  color: var(--ink-lt);
  white-space: nowrap;
  font-family: var(--font-journal);
  position: relative;
  z-index: 0;
  max-width: 80rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.strip-more {
  text-align: right;
  font-size: 20rpx;
  color: var(--amber);
  margin-top: 10rpx;
}
</style>
