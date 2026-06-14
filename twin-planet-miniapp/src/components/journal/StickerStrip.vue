<!-- 贴纸条 · 横向滑动展示今日贴纸 -->
<template>
  <view class="sticker-strip" v-if="stickers.length">
    <view class="strip-label">今日贴纸</view>
    <scroll-view scroll-x class="strip-scroll">
      <view class="strip-row">
        <view v-for="s in stickers" :key="s.id" class="sticker-item" :class="{ new: isNew(s) }">
          <text class="sticker-emoji">{{ s.emoji }}</text>
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
import { computed } from 'vue'
import type { Sticker } from '@/stores/stickers'

const props = defineProps<{
  stickers: Sticker[]
  showMore?: boolean
}>()

defineEmits<{ viewAll: [] }>()

const now = Date.now()
function isNew(s: Sticker): boolean {
  return now - s.earnedAt < 5000 // 5秒内算"新获得"
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
  font-size: var(--font-caption);
  color: var(--ink-lt);
  font-family: var(--font-journal);
}
.strip-label {
  font-family: var(--font-journal);
  font-size: var(--font-caption);
  color: var(--ink-md);
  margin-bottom: 12rpx;
  padding-left: 4rpx;
}
.strip-scroll {
  white-space: nowrap;
}
.strip-row {
  display: inline-flex;
  gap: 16rpx;
}
.sticker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx 16rpx;
  background: var(--cream);
  border-radius: var(--radius-sm);
  border: 2rpx solid var(--dot);
  min-width: 100rpx;
  transition: transform .3s var(--ease-bounce), border-color .3s;
}
.sticker-item.new {
  border-color: var(--gold);
  animation: stickerBounce .5s var(--ease-bounce);
}
.sticker-emoji {
  font-size: 36rpx;
}
.sticker-label {
  font-size: 18rpx;
  color: var(--ink-md);
  white-space: nowrap;
}
.strip-more {
  text-align: right;
  font-size: var(--font-caption);
  color: var(--amber);
  margin-top: 8rpx;
}
@keyframes stickerBounce {
  0% { transform: scale(.5); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
