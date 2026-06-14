<template>
  <view class="ms-page">
    <view class="page-header">
      <text class="page-icon">🌟</text>
      <text class="page-title">双宝能力观察</text>
      <text class="page-subtitle">不是比较，是欣赏每个孩子的独特轨迹</text>
    </view>

    <!-- 宝宝切换 -->
    <view class="baby-tabs">
      <view class="baby-tab" :class="{ active: activeBabyId === babyA?.id, blue: true }" @click="activeBabyId = babyA?.id ?? ''">
        <text>{{ babyA?.nickname || '大宝' }}</text>
      </view>
      <view class="baby-tab" :class="{ active: activeBabyId === babyB?.id, pink: true }" @click="activeBabyId = babyB?.id ?? ''">
        <text>{{ babyB?.nickname || '二宝' }}</text>
      </view>
    </view>

    <!-- 领域卡片 -->
    <view class="domain-cards" v-if="activeBaby">
      <view v-for="(info, domain) in MILESTONE_DOMAINS" :key="domain" class="domain-card" @click="toggleDomain(domain as MilestoneDomain)">
        <view class="domain-head">
          <text class="domain-emoji">{{ info.emoji }}</text>
          <view class="domain-body">
            <text class="domain-label">{{ info.label }}</text>
            <text class="domain-count">{{ getDomainCount(domain as MilestoneDomain) }} 项</text>
          </view>
          <text class="domain-arrow" :class="{ open: expandedDomain === domain }">▼</text>
        </view>
        <!-- 展开的里程碑列表 -->
        <view class="domain-detail" v-if="expandedDomain === domain">
          <text class="detail-examples">{{ info.examples }}</text>
          <view v-for="norm in getNorms(domain as MilestoneDomain)" :key="norm.ageMonths" class="norm-item" :class="{ achieved: isAchieved(activeBaby!.id, domain as MilestoneDomain, norm.title) }">
            <view class="norm-check" @click.stop="toggleMilestone(domain as MilestoneDomain, norm)">
              <text>{{ isAchieved(activeBaby!.id, domain as MilestoneDomain, norm.title) ? '✅' : '⬜' }}</text>
            </view>
            <text class="norm-title">{{ norm.title }}</text>
            <text class="norm-age">{{ norm.ageMonths }}月</text>
          </view>
          <view class="add-custom">
            <input class="custom-input" v-model="customNotes[domain]" placeholder="自己添加一个..." placeholder-style="color: var(--twin-text-muted)" @confirm="addCustom(domain as MilestoneDomain)" />
          </view>
        </view>
      </view>
    </view>

    <!-- 时间线 -->
    <view class="timeline-section" v-if="activeBaby && recentMilestones.length">
      <text class="section-label">📅 {{ activeBaby?.nickname }} 的成长时间线</text>
      <view class="timeline">
        <view v-for="(m, idx) in recentMilestones" :key="m.id" class="tl-item">
          <view class="tl-dot" :class="{ first: idx === 0 }" />
          <view class="tl-card">
            <text class="tl-emoji">{{ MILESTONE_DOMAINS[m.domain].emoji }}</text>
            <text class="tl-title">{{ m.title }}</text>
            <text class="tl-time">{{ dateStr(m.achievedAt) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!activeBaby" class="empty-state">
      <text class="empty-title">请先添加双胞胎宝宝</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useMilestonesStore, MILESTONE_DOMAINS, MILESTONE_NORMS, type MilestoneDomain } from '@/stores/milestones'
import { dateStr } from '@/utils/format'

const babiesStore = useBabiesStore()
const store = useMilestonesStore()

const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const activeBabyId = ref(babiesStore.babyA?.id ?? babiesStore.babyB?.id ?? '')
const activeBaby = computed(() => babiesStore.getBaby(activeBabyId.value))

const expandedDomain = ref<MilestoneDomain | null>(null)
const customNotes: Record<string, string> = reactive({})

const recentMilestones = computed(() => {
  if (!activeBabyId.value) return []
  return store.getMilestonesByBaby(activeBabyId.value).slice(0, 15)
})

function getDomainCount(domain: MilestoneDomain) {
  return store.getDomainProgress(activeBabyId.value, domain).length
}

function getNorms(domain: MilestoneDomain) {
  return MILESTONE_NORMS[domain]
}

function isAchieved(babyId: string, domain: MilestoneDomain, title: string) {
  return store.milestones.some(m => m.babyId === babyId && m.domain === domain && m.title === title)
}

function toggleDomain(domain: MilestoneDomain) {
  expandedDomain.value = expandedDomain.value === domain ? null : domain
}

function toggleMilestone(domain: MilestoneDomain, norm: { ageMonths: number; title: string; desc: string }) {
  if (isAchieved(activeBabyId.value, domain, norm.title)) return
  store.addMilestone({ babyId: activeBabyId.value, domain, title: norm.title, note: norm.desc, achievedAt: Date.now(), ageNorm: [norm.ageMonths - 6, norm.ageMonths + 6] })
  uni.showToast({ title: '🌟 ' + norm.title, icon: 'success', duration: 1000 })
}

function addCustom(domain: MilestoneDomain) {
  const text = customNotes[domain]?.trim()
  if (!text) return
  store.addMilestone({ babyId: activeBabyId.value, domain, title: text, note: '自定义', achievedAt: Date.now(), ageNorm: [0, 0] })
  customNotes[domain] = ''
  uni.showToast({ title: '已添加', icon: 'success' })
}

onMounted(() => { uni.setNavigationBarTitle({ title: '能力观察' }) })
</script>

<style scoped>
.ms-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 80rpx; }
.section-header { text-align: center; margin-bottom: 24rpx; }
.section-icon { font-size: 80rpx; }
.section-title { display: block; font-size: 44rpx; font-weight: 700; color: var(--twin-text); margin: 12rpx 0; }
.section-desc { font-size: 26rpx; color: var(--twin-text-secondary); }

.baby-tabs { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.baby-tab { flex: 1; text-align: center; padding: 18rpx 0; background: var(--twin-card-bg); border: 4rpx solid var(--twin-border); border-radius: 16rpx; font-size: 28rpx; color: var(--twin-text-tertiary); }
.baby-tab.active.blue { border-color: var(--twin-baby-a); background: var(--twin-baby-a-light); color: var(--twin-text); font-weight: 600; }
.baby-tab.active.pink { border-color: var(--twin-baby-b); background: var(--twin-baby-b-light); color: var(--twin-text); font-weight: 600; }

.domain-cards { display: flex; flex-direction: column; gap: 10rpx; margin-bottom: 28rpx; }
.domain-card { background: var(--twin-card-bg); border-radius: 16rpx; padding: 20rpx; }
.domain-head { display: flex; align-items: center; gap: 14rpx; }
.domain-emoji { font-size: 32rpx; }
.domain-body { flex: 1; }
.domain-label { display: block; font-size: 28rpx; font-weight: 600; color: var(--twin-text); }
.domain-count { font-size: 22rpx; color: var(--twin-text-secondary); }
.domain-arrow { font-size: 20rpx; color: var(--twin-text-muted); transition: transform 0.2s; }
.domain-arrow.open { transform: rotate(180deg); }

.domain-detail { margin-top: 16rpx; padding-top: 16rpx; border-top: 2rpx solid var(--twin-border); }
.detail-examples { display: block; font-size: 22rpx; color: var(--twin-text-secondary); margin-bottom: 12rpx; }
.norm-item { display: flex; align-items: center; gap: 12rpx; padding: 10rpx 0; }
.norm-item.achieved { opacity: 0.5; }
.norm-check { font-size: 28rpx; }
.norm-title { flex: 1; font-size: 26rpx; color: var(--ink); }
.norm-age { font-size: 22rpx; color: var(--twin-text-muted); }

.add-custom { margin-top: 8rpx; }
.custom-input { width: 100%; padding: 16rpx 20rpx; background: var(--twin-hover); border-radius: 10rpx; font-size: 24rpx; box-sizing: border-box; }

.timeline { padding-left: 24rpx; }
.tl-item { display: flex; gap: 16rpx; padding-bottom: 20rpx; }
.tl-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: var(--twin-text-muted); margin-top: 8rpx; flex-shrink: 0; }
.tl-dot.first { background: var(--twin-accent); width: 16rpx; height: 16rpx; }
.tl-card { flex: 1; background: var(--twin-card-bg); border-radius: 12rpx; padding: 14rpx 18rpx; display: flex; align-items: center; gap: 10rpx; }
.tl-emoji { font-size: 24rpx; }
.tl-title { flex: 1; font-size: 26rpx; color: var(--twin-text); }
.tl-time { font-size: 20rpx; color: var(--twin-text-secondary); }

.section-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 16rpx; }
.empty-state { text-align: center; padding: 80rpx; color: var(--twin-text-secondary); font-size: 28rpx; }
</style>
