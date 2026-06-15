<template>
  <view class="sprout-page page-enter">
    <!-- 头部 -->
    <view class="page-header">
      <view class="header-top">
        <view class="header-title-group">
          <text class="page-icon">🌱</text>
          <text class="page-title">萌芽日记</text>
        </view>
        <button class="btn-share" open-type="share">
          <text>📤 分享</text>
        </button>
      </view>
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

      <view class="mood-row">
        <text class="mood-label">情绪</text>
        <view class="mood-emojis">
          <text
            v-for="emoji in MOOD_EMOJIS"
            :key="emoji"
            class="mood-emoji"
            :class="{ active: selectedMood === emoji }"
            @click="toggleMood(emoji)"
          >{{ emoji }}</text>
        </view>
      </view>

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
            <text class="timeline-mood" v-if="entry.mood">{{ entry.mood }}</text>
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
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useBabiesStore } from '@/stores/babies'
import { useInteractionsStore, INTERACTION_TYPES, type InteractionType } from '@/stores/interactions'
import { timeStr } from '@/utils/format'
import { useStickerSync } from '@/composables/useStickerSync'

const babiesStore = useBabiesStore()
const store = useInteractionsStore()
const { syncStickers } = useStickerSync()

const selectedType = ref<InteractionType>('share')
const noteText = ref('')
const selectedMood = ref('')

const MOOD_EMOJIS = ['😊', '😐', '😢', '😡', '🤗', '😴']

function toggleMood(emoji: string) {
  selectedMood.value = selectedMood.value === emoji ? '' : emoji
}

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
    mood: selectedMood.value || undefined,
  })

  noteText.value = ''
  selectedMood.value = ''
  // 同步贴纸
  syncStickers({ sproutCount: store.sproutEntries.length })
  uni.showToast({ title: '🌱 已记录', icon: 'success', duration: 1000 })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '萌芽日记' })
})

onShareAppMessage(() => {
  const latest = store.recentSprouts[0]
  if (latest) {
    const typeLabel = INTERACTION_TYPES[latest.type].label
    return {
      title: `${latest.babyAName}今天${typeLabel}了！`,
    }
  }
  return {
    title: '记录双宝的每一个萌芽时刻',
  }
})
</script>

<style scoped>
.sprout-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 80rpx; }

/* 头部 */
.header-top { display: flex; align-items: center; justify-content: space-between; }
.header-title-group { display: flex; align-items: center; gap: 12rpx; }
.btn-share {
  display: flex; align-items: center; gap: 4rpx;
  padding: 8rpx 20rpx; border-radius: 32rpx;
  border: 2rpx solid var(--twin-baby-a);
  background: transparent;
  font-size: 22rpx; color: var(--twin-baby-a);
  line-height: 1.4; margin: 0;
}
.btn-share::after { border: none; }

/* 添加区 */
.add-section { margin-bottom: 40rpx; }
.type-scroll { white-space: nowrap; margin-bottom: 20rpx; }
.type-chips { display: flex; gap: 12rpx; }
.type-chip {
  display: inline-flex; align-items: center; gap: 8rpx;
  padding: 16rpx 24rpx; border-radius: 40rpx;
  font-size: 24rpx; color: var(--twin-text-tertiary); white-space: nowrap;
  /* 凸起表面 */
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(0,0,0,0.02) 100%), var(--twin-card-bg);
  border: 4rpx solid var(--twin-border);
  box-shadow: 0 1rpx 0 rgba(0,0,0,0.03), 0 1.5rpx 3px rgba(0,0,0,0.02);
}
.type-chip:active { box-shadow: 0 0.5rpx 0 rgba(0,0,0,0.03); transform: translateY(1rpx); }
.type-chip.selected {
  border-color: var(--twin-accent); color: var(--twin-text);
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.04) 100%), var(--twin-accent-light);
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.04), 0 0.5rpx 0 rgba(0,0,0,0.02);
}
.chip-emoji { font-size: 28rpx; }
.chip-label { font-size: 24rpx; }

.mood-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.mood-label { font-size: 24rpx; color: var(--twin-text-secondary); font-weight: 600; flex-shrink: 0; }
.mood-emojis { display: flex; gap: 12rpx; }
.mood-emoji {
  font-size: 40rpx; width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(0,0,0,0.02) 100%), var(--twin-card-bg);
  border: 2rpx solid var(--twin-border);
  box-shadow: 0 1rpx 0 rgba(0,0,0,0.03), 0 1.5rpx 3rpx rgba(0,0,0,0.02);
  transition: all .15s var(--ease-stamp);
  opacity: 0.55;
}
.mood-emoji:active { transform: scale(.88); }
.mood-emoji.active {
  opacity: 1;
  border-color: var(--twin-accent);
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.04) 100%), var(--twin-accent-light);
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.04), 0 0 0 2rpx rgba(92,154,110,0.08);
}

.note-input-row { display: flex; gap: 12rpx; }
.note-input {
  flex: 1; padding: 24rpx 28rpx; background: var(--twin-card-bg);
  border: 4rpx solid var(--twin-border); border-radius: 24rpx;
  font-size: 28rpx; color: var(--twin-text);
  /* 凹陷书写区 */
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.04), 0 1rpx 0 rgba(255,255,255,0.6);
}
.btn-send {
  padding: 0 32rpx; border-radius: 24rpx;
  display: flex; align-items: center; justify-content: center;
  color: #FFF; font-size: 28rpx; font-weight: 600;
  /* 凸起3D按钮 */
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.06) 100%), var(--twin-accent);
  box-shadow: 0 2rpx 0 rgba(0,0,0,0.06), 0 4rpx 12rpx rgba(0,0,0,0.08);
}
.btn-send:active {
  box-shadow: 0 0.5rpx 0 rgba(0,0,0,0.06), 0 1rpx 3rpx rgba(0,0,0,0.06);
  transform: translateY(1.5rpx);
}
.input-hint { display: block; text-align: right; font-size: 20rpx; color: var(--twin-text-muted); margin-top: 8rpx; }

/* 时间线 */
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 20rpx; }
.timeline { padding-left: 32rpx; }
.timeline-item { display: flex; gap: 20rpx; padding-bottom: 28rpx; }
.timeline-line { display: flex; flex-direction: column; align-items: center; width: 24rpx; flex-shrink: 0; }
.timeline-dot {
  width: 16rpx; height: 16rpx; border-radius: 50%; background: var(--twin-text-muted); margin-top: 8rpx;
  box-shadow: 0 1rpx 0 rgba(0,0,0,0.03), 0 2rpx 4rpx rgba(0,0,0,0.03);
}
.timeline-dot.first {
  background: var(--twin-accent); width: 20rpx; height: 20rpx;
  box-shadow: 0 2rpx 0 rgba(0,0,0,0.04), 0 3rpx 6rpx rgba(0,0,0,0.05);
}
.timeline-bar { flex: 1; width: 2rpx; background: var(--twin-border); margin-top: 4rpx; }
.timeline-card {
  flex: 1; border-radius: 16rpx; padding: 20rpx 24rpx;
  border-left: 6rpx solid var(--twin-accent);
  /* 纸质深度 */
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 30%, rgba(0,0,0,0.01) 100%), var(--twin-card-bg);
  box-shadow: 0 1rpx 0 rgba(0,0,0,0.03), 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.timeline-header { display: flex; align-items: center; gap: 8rpx; margin-bottom: 8rpx; }
.timeline-emoji { font-size: 24rpx; }
.timeline-type { font-size: 24rpx; font-weight: 600; color: var(--twin-text); }
.timeline-time { font-size: 20rpx; color: var(--twin-text-secondary); margin-left: auto; }
.timeline-note { font-size: 26rpx; color: var(--ink); line-height: 1.6; }
.timeline-mood { display: inline-block; font-size: 32rpx; margin-top: 8rpx; }
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
