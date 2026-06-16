<!-- 发现页 — 整合"更多"菜单中的6个功能入口 -->
<template>
  <view class="discover-page journal-paper page-enter">
    <view class="page-header">
      <text class="page-icon">🧭</text>
      <text class="page-title">发现</text>
      <text class="page-subtitle">双宝手帳的更多玩法</text>
    </view>

    <view class="feature-grid">
      <view
        v-for="f in features"
        :key="f.key"
        class="feature-card"
        @click="goPage(f.path)"
      >
        <text class="feature-emoji">{{ f.emoji }}</text>
        <text class="feature-label">{{ f.label }}</text>
        <text class="feature-desc">{{ f.desc }}</text>
      </view>
    </view>

    <!-- 底部工具 -->
    <view class="discover-tools">
      <view class="tool-card" @click="goPage('/pages/stickers/index')">
        <text class="tool-emoji iconfont icon-share"></text>
        <text class="tool-label">导出数据备份</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getDiscoverFeatures } from '@/config/roles'

const userStore = useUserStore()

interface FeatureItem {
  key: string
  label: string
  path: string
  emoji: string
  desc: string
}

const featureMeta: Record<string, { emoji: string; desc: string }> = {
  sprout: { emoji: '🌱', desc: '记录双宝的第一次互动' },
  contribution: { emoji: '💝', desc: '看见每一位家人的付出' },
  duty: { emoji: '📋', desc: '爸爸独自带娃的SOP清单' },
  guardian: { emoji: '🛡️', desc: '照顾者的精力与状态管理' },
  handover: { emoji: '🎙️', desc: '语音便签无缝交接' },
  stickers: { emoji: '⭐', desc: '收集成长路上的可爱贴纸' },
}

const features = computed<FeatureItem[]>(() => {
  const raw = getDiscoverFeatures(userStore.profile?.role)
  return raw.map(f => ({
    ...f,
    emoji: featureMeta[f.key]?.emoji || '📌',
    desc: featureMeta[f.key]?.desc || '',
  }))
})

function goPage(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style scoped>
.discover-page {
  min-height: 100vh;
  padding: 32rpx 32rpx 120rpx;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.feature-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, var(--cream) 100%);
  border-radius: var(--radius-md);
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  border: 2rpx solid var(--dot);
  box-shadow: 0 1rpx 0 rgba(0,0,0,.03), 0 2rpx 8rpx rgba(0,0,0,.04);
  transition: all .15s cubic-bezier(.25,.1,.1,1);
}
.feature-card:active {
  transform: scale(.97);
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,.04), 0 1rpx 0 rgba(0,0,0,.02);
}

.feature-emoji { font-size: 48rpx; }
.feature-label {
  font-family: var(--font-journal);
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink);
}
.feature-desc {
  font-size: 22rpx;
  color: var(--ink-md);
  text-align: center;
  line-height: 1.4;
}

.discover-tools { margin-top: 8rpx; }
.tool-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, var(--cream) 100%);
  border-radius: var(--radius-md);
  padding: 24rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 1.5px dashed var(--dot);
  box-shadow: 0 1rpx 0 rgba(0,0,0,.03);
}
.tool-card:active { background: var(--amber-lt); border-color: var(--amber); }
.tool-emoji { font-size: 36rpx; }
.tool-label { font-size: 26rpx; font-weight: 600; color: var(--ink); }
</style>
