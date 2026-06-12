<template>
  <view class="contrib-page">
    <!-- 头部 -->
    <view class="section-header">
      <text class="section-icon">💪</text>
      <text class="section-title">今天我做了什么</text>
      <text class="section-desc">看见每一位家人的付出</text>
    </view>

    <!-- 今日统计 -->
    <view class="today-stats" v-if="store.todayContributions.length">
      <view class="stat-circle">
        <text class="stat-num">{{ store.todayContributions.length }}</text>
        <text class="stat-unit">件</text>
      </view>
      <text class="stat-text">今天已经为这个家做了 {{ store.todayContributions.length }} 件事</text>
    </view>

    <!-- 快速记录 -->
    <view class="add-section">
      <text class="section-label">快速记录</text>
      <view class="category-grid">
        <view
          v-for="(info, cat) in CONTRIBUTION_TYPES"
          :key="cat"
          class="cat-card"
          :class="{ active: selectedCat === cat }"
          @click="selectCategory(cat as ContributionCategory)"
        >
          <text class="cat-emoji">{{ info.emoji }}</text>
          <text class="cat-label">{{ info.label }}</text>
        </view>
      </view>
      <view class="note-input-row">
        <input
          class="note-input"
          v-model="noteText"
          placeholder="一句话记录（如：凌晨3点起来喂了两次奶）"
          placeholder-style="color: #CBD5E0"
          maxlength="100"
          confirm-type="done"
          @confirm="addEntry"
        />
      </view>
      <button class="btn-record" @click="addEntry">
        💚 记录这件小事
      </button>
    </view>

    <!-- 今日列表 -->
    <view class="today-list" v-if="store.todayContributions.length">
      <text class="section-label">今天</text>
      <view
        v-for="entry in store.todayContributions"
        :key="entry.id"
        class="contrib-item"
      >
        <text class="contrib-emoji">{{ CONTRIBUTION_TYPES[entry.category].emoji }}</text>
        <view class="contrib-body">
          <text class="contrib-note">{{ entry.note }}</text>
          <text class="contrib-time">{{ timeStr(entry.recordedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-list" v-if="store.recentContributions.length">
      <text class="section-label">最近</text>
      <view
        v-for="entry in store.recentContributions.slice(0, 10)"
        :key="entry.id"
        class="contrib-item faded"
      >
        <text class="contrib-emoji">{{ CONTRIBUTION_TYPES[entry.category].emoji }}</text>
        <view class="contrib-body">
          <text class="contrib-note">{{ entry.note }}</text>
          <text class="contrib-time">{{ dateStr(entry.recordedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!store.recentContributions.length">
      <text class="empty-emoji">📝</text>
      <text class="empty-title">还没有记录</text>
      <text class="empty-desc">记录一下你为宝宝做的事吧，每件小事都值得被看见</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useInteractionsStore, CONTRIBUTION_TYPES, type ContributionCategory } from '@/stores/interactions'

const store = useInteractionsStore()
const selectedCat = ref<ContributionCategory>('other')
const noteText = ref('')

function selectCategory(cat: ContributionCategory) {
  selectedCat.value = cat
}

function addEntry() {
  if (!noteText.value.trim()) {
    uni.showToast({ title: '写一句吧，哪怕就几个字', icon: 'none' })
    return
  }
  store.addContribution({
    userId: 'mock-user-001',
    userName: '我',
    category: selectedCat.value,
    note: noteText.value.trim(),
  })
  noteText.value = ''
  uni.showToast({ title: '💪 已记录', icon: 'success', duration: 1000 })
}

function timeStr(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function dateStr(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '今天我做了什么' })
})
</script>

<style scoped>
.contrib-page { min-height: 100vh; background: #FFFBF5; padding: 32rpx 32rpx 80rpx; }

.section-header { text-align: center; margin-bottom: 32rpx; }
.section-icon { font-size: 40px; }
.section-title { display: block; font-size: 44rpx; font-weight: 700; color: #2D3748; margin: 12rpx 0; }
.section-desc { font-size: 26rpx; color: #A0AEC0; }

/* 今日统计 */
.today-stats {
  display: flex; align-items: center; gap: 20rpx;
  padding: 24rpx; background: #FFFFFF; border-radius: 20rpx;
  margin-bottom: 32rpx; border: 4rpx solid #48BB78;
}
.stat-circle {
  width: 96rpx; height: 96rpx; border-radius: 50%; background: #F0FFF4;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.stat-num { font-size: 44rpx; font-weight: 700; color: #48BB78; line-height: 1; }
.stat-unit { font-size: 20rpx; color: #48BB78; }
.stat-text { flex: 1; font-size: 26rpx; color: #4A5568; line-height: 1.5; }

/* 快速记录 */
.add-section { margin-bottom: 40rpx; }
.section-label { display: block; font-size: 26rpx; font-weight: 600; color: #2D3748; margin-bottom: 20rpx; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12rpx; margin-bottom: 20rpx; }
.cat-card {
  text-align: center; padding: 20rpx 8rpx; background: #FFFFFF;
  border: 4rpx solid #E2E8F0; border-radius: 16rpx;
  display: flex; flex-direction: column; align-items: center; gap: 6rpx;
}
.cat-card.active { border-color: #48BB78; background: #F0FFF4; }
.cat-emoji { font-size: 36rpx; }
.cat-label { font-size: 22rpx; color: #718096; }
.cat-card.active .cat-label { color: #2D3748; font-weight: 600; }

.note-input-row { margin-bottom: 16rpx; }
.note-input {
  width: 100%; padding: 24rpx 28rpx; background: #FFFFFF;
  border: 4rpx solid #E2E8F0; border-radius: 24rpx;
  font-size: 28rpx; color: #2D3748; box-sizing: border-box;
}
.btn-record {
  width: 100%; padding: 24rpx 0; background: #48BB78;
  color: #FFFFFF; border: none; border-radius: 24rpx;
  font-size: 30rpx; font-weight: 600;
}

/* 列表 */
.today-list { margin-bottom: 32rpx; }
.recent-list { margin-bottom: 32rpx; }
.contrib-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx; background: #FFFFFF; border-radius: 16rpx;
  margin-bottom: 8rpx; border-left: 6rpx solid #48BB78;
}
.contrib-item.faded { border-left-color: #E2E8F0; opacity: 0.7; }
.contrib-emoji { font-size: 32rpx; flex-shrink: 0; }
.contrib-body { flex: 1; }
.contrib-note { display: block; font-size: 26rpx; color: #2D3748; }
.contrib-time { display: block; font-size: 20rpx; color: #A0AEC0; margin-top: 4rpx; }

.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48px; }
.empty-title { display: block; font-size: 32rpx; font-weight: 600; color: #2D3748; margin: 16rpx 0 8rpx; }
.empty-desc { font-size: 26rpx; color: #A0AEC0; }
</style>
