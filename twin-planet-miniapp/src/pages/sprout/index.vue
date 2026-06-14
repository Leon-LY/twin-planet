<template>
  <view class="sprout-page">
    <view class="bg-spot spot-a" /><view class="bg-spot spot-b" />
    <!-- 头部 -->
    <view class="page-header">
      <text class="page-icon">🌱</text>
      <text class="page-title">萌芽日记</text>
      <text class="page-subtitle">记录两个宝宝之间的互动瞬间</text>
    </view>

    <!-- 添加按钮 -->
    <view class="add-section">
      <scroll-view scroll-x class="type-scroll">
        <view class="type-chips">
          <view
            v-for="(info, type) in INTERACTION_TYPES"
            :key="type"
            class="type-chip"
            :class="{ selected: selectedType === type }"
            @click="selectedType = type as InteractionType"
          >
            <text class="chip-emoji">{{ info.emoji }}</text>
            <text class="chip-label">{{ info.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="note-input-row">
        <input
          class="note-input"
          v-model="noteText"
          placeholder="简单写一句发生了什么..."
          placeholder-style="color: var(--twin-text-muted)"
          maxlength="200"
          confirm-type="done"
          @confirm="addEntry"
        />
        <view class="btn-send" @click="addEntry">
          <text>记录</text>
        </view>
      </view>
      <text class="input-hint" v-if="noteText.length > 0">{{ noteText.length }}/200</text>
    </view>

    <!-- 时间线 -->
    <view class="timeline-section" v-if="store.recentSprouts.length">
      <text class="section-label">互动时间线</text>
      <view class="timeline">
        <view
          v-for="(entry, idx) in store.recentSprouts"
          :key="entry.id"
          class="timeline-item"
        >
          <view class="timeline-line">
            <view class="timeline-dot" :class="{ first: idx === 0 }" />
            <view class="timeline-bar" v-if="idx < store.recentSprouts.length - 1" />
          </view>
          <view class="timeline-card">
            <view class="timeline-header">
              <text class="timeline-emoji">{{ INTERACTION_TYPES[entry.type].emoji }}</text>
              <text class="timeline-type">{{ INTERACTION_TYPES[entry.type].label }}</text>
              <text class="timeline-time">{{ timeStr(entry.recordedAt) }}</text>
            </view>
            <text class="timeline-note">{{ entry.note }}</text>
            <view class="timeline-twins">
              <text class="twin-tag amber">{{ entry.babyAName }}</text>
              <text class="tag-arrow">↔</text>
              <text class="twin-tag rose">{{ entry.babyBName }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-emoji">📖</text>
      <text class="empty-title">等待第一颗小萌芽</text>
      <text class="empty-desc">记录双胞胎之间的互动瞬间：第一次分享、争抢玩具、互相模仿...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useInteractionsStore, INTERACTION_TYPES, type InteractionType } from '@/stores/interactions'
import { timeStr } from '@/utils/format'
import { useStickerSync } from '@/composables/useStickerSync'

const babiesStore = useBabiesStore()
const store = useInteractionsStore()
const { syncStickers } = useStickerSync()

const selectedType = ref<InteractionType>('share')
const noteText = ref('')

function addEntry() {
  if (!noteText.value.trim()) return
  const babyA = babiesStore.babyA
  const babyB = babiesStore.babyB
  if (!babyA || !babyB) {
    uni.showToast({ title: '请先添加双胞胎宝宝', icon: 'none' })
    return
  }

  store.addSprout({
    twinGroupId: '',
    type: selectedType.value,
    babyAName: babyA.nickname || babyA.name,
    babyBName: babyB.nickname || babyB.name,
    note: noteText.value.trim(),
  })

  noteText.value = ''
  // 同步贴纸
  syncStickers({ sproutCount: store.sproutEntries.length })
  uni.showToast({ title: '🌱 已记录', icon: 'success', duration: 1000 })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '萌芽日记' })
})
</script>

<style scoped>
.sprout-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 80rpx; }

/* 添加区 */
.add-section { margin-bottom: 40rpx; }
.type-scroll { white-space: nowrap; margin-bottom: 20rpx; }
.type-chips { display: flex; gap: 12rpx; }
.type-chip {
  display: inline-flex; align-items: center; gap: 8rpx;
  padding: 16rpx 24rpx; background: var(--twin-card-bg);
  border: 4rpx solid var(--twin-border); border-radius: 40rpx;
  font-size: 24rpx; color: var(--twin-text-tertiary); white-space: nowrap;
}
.type-chip.selected { border-color: var(--twin-accent); background: var(--twin-accent-light); color: var(--twin-text); }
.chip-emoji { font-size: 28rpx; }
.chip-label { font-size: 24rpx; }

.note-input-row { display: flex; gap: 12rpx; }
.note-input {
  flex: 1; padding: 24rpx 28rpx; background: var(--twin-card-bg);
  border: 4rpx solid var(--twin-border); border-radius: 24rpx;
  font-size: 28rpx; color: var(--twin-text);
}
.btn-send {
  padding: 0 32rpx; background: var(--twin-accent); border-radius: 24rpx;
  display: flex; align-items: center; justify-content: center;
  color: #FFF; font-size: 28rpx; font-weight: 600;
}
.input-hint { display: block; text-align: right; font-size: 20rpx; color: var(--twin-text-muted); margin-top: 8rpx; }

/* 时间线 */
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 20rpx; }
.timeline { padding-left: 32rpx; }
.timeline-item { display: flex; gap: 20rpx; padding-bottom: 28rpx; }
.timeline-line { display: flex; flex-direction: column; align-items: center; width: 24rpx; flex-shrink: 0; }
.timeline-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: var(--twin-text-muted); margin-top: 8rpx; }
.timeline-dot.first { background: var(--twin-accent); width: 20rpx; height: 20rpx; }
.timeline-bar { flex: 1; width: 2rpx; background: var(--twin-border); margin-top: 4rpx; }
.timeline-card {
  flex: 1; background: var(--twin-card-bg); border-radius: 16rpx; padding: 20rpx 24rpx;
  border-left: 6rpx solid var(--twin-accent);
}
.timeline-header { display: flex; align-items: center; gap: 8rpx; margin-bottom: 8rpx; }
.timeline-emoji { font-size: 24rpx; }
.timeline-type { font-size: 24rpx; font-weight: 600; color: var(--twin-text); }
.timeline-time { font-size: 20rpx; color: var(--twin-text-secondary); margin-left: auto; }
.timeline-note { font-size: 26rpx; color: var(--ink); line-height: 1.6; }
.timeline-twins { display: flex; align-items: center; gap: 8rpx; margin-top: 12rpx; }
.twin-tag { font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx; }
.twin-tag.amber { background: var(--twin-baby-a-light); color: var(--twin-baby-a); }
.twin-tag.rose { background: var(--twin-baby-b-light); color: var(--twin-baby-b); }
.tag-arrow { font-size: 18rpx; color: var(--twin-text-muted); }

.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 96rpx; }
.empty-title { display: block; font-size: 32rpx; font-weight: 600; color: var(--twin-text); margin: 16rpx 0 8rpx; }
.empty-desc { font-size: 26rpx; color: var(--twin-text-secondary); line-height: 1.6; }
</style>
