<template>
  <view class="school-page">
    <view class="section-header">
      <text class="section-icon">🏫</text>
      <text class="section-title">入园助手</text>
      <text class="section-desc">分班决策，不需要 3 岁就定终身</text>
    </view>

    <!-- 耦合度雷达图 -->
    <view class="radar-card">
      <text class="card-title">🌐 双生耦合度</text>
      <text class="card-sub">分数越高 = 两个宝宝越依赖彼此</text>
      <view class="radar-chart">
        <view class="radar-axis">
          <text class="axis-label top">情绪依赖</text>
          <text class="axis-label right">社交重叠</text>
          <text class="axis-label bottom">身份认同</text>
        </view>
        <view class="radar-center">
          <view v-for="dim in dims" :key="dim.key" class="radar-bar-wrap">
            <text class="bar-label">{{ dim.label }}</text>
            <view class="bar-track"><view class="bar-fill" :style="{ width: dim.score + '%', background: dim.color }" /></view>
            <text class="bar-val">{{ dim.score }}</text>
          </view>
        </view>
      </view>
      <view class="coupling-verdict" :style="{ background: verdictBg }">
        <text class="verdict-text">{{ verdictText }}</text>
      </view>
    </view>

    <!-- 同班 vs 分班 -->
    <view class="compare-section">
      <text class="card-title">⚖️ 同班 vs 分班</text>
      <view class="compare-cols">
        <view class="compare-col blue">
          <text class="col-title">同班</text>
          <text class="col-item">✅ 接送方便，只去一个教室</text>
          <text class="col-item">✅ 家长会、作业同步</text>
          <text class="col-item">✅ 双宝互相提供安全感</text>
          <text class="col-item risk">⚠️ 老师不自觉会比较</text>
          <text class="col-item risk">⚠️ 可能与对方"绑定"影响社交</text>
        </view>
        <view class="compare-col pink">
          <text class="col-title">分班</text>
          <text class="col-item">✅ 各自独立空间，不被标签化</text>
          <text class="col-item">✅ 发展独立朋友圈</text>
          <text class="col-item">✅ 减少"谁更好"的比较</text>
          <text class="col-item risk">⚠️ 接送/作业不同步，家长负担翻倍</text>
          <text class="col-item risk">⚠️ 刚分班时可能分离焦虑</text>
        </view>
      </view>
    </view>

    <!-- 学期评估 -->
    <view class="assess-section">
      <text class="card-title">📅 学期评估记录</text>
      <view class="assess-list" v-if="store.schoolDecisions.length">
        <view v-for="d in store.schoolDecisions.slice().reverse()" :key="d.id" class="assess-card">
          <view class="assess-header">
            <text class="assess-term">{{ d.term }}</text>
            <text class="assess-choice">{{ d.sameClass ? '👫 同班' : '👤👤 分班' }}</text>
          </view>
          <text class="assess-note">{{ d.note || '没有备注' }}</text>
        </view>
      </view>
      <view v-else class="empty-mini">还没有评估记录</view>
    </view>

    <!-- 新建评估 -->
    <view class="new-assess">
      <text class="card-title">新建评估</text>
      <picker mode="selector" :range="terms" @change="(e: any) => selectedTerm = terms[e.detail.value]">
        <view class="picker-row"><text>学期：{{ selectedTerm }}</text><text>▼</text></view>
      </picker>
      <view class="toggle-row">
        <view class="toggle-btn" :class="{ active: sameClass }" @click="sameClass = true">👫 同班</view>
        <view class="toggle-btn" :class="{ active: !sameClass }" @click="sameClass = false">👤👤 分班</view>
      </view>
      <input class="note-input" v-model="noteText" placeholder="记录决策原因..." placeholder-style="color: var(--twin-text-muted)" />
      <button class="btn-save" @click="saveDecision">💾 保存评估</button>
    </view>

    <text class="disclaimer">以上分析基于宝宝互动数据，仅供参考，不构成教育建议。分班决定请与老师共同判断。</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMilestonesStore, calcCouplingScores } from '@/stores/milestones'
import { useInteractionsStore } from '@/stores/interactions'
import { useBabiesStore } from '@/stores/babies'

const store = useMilestonesStore()
const interactionsStore = useInteractionsStore()
const babiesStore = useBabiesStore()

const selectedTerm = ref('2026-秋季')
const sameClass = ref(true)
const noteText = ref('')

// 动态生成学期列表（当前年份前后各1年）
const nowYear = new Date().getFullYear()
const terms = [`${nowYear}-春季`, `${nowYear}-秋季`, `${nowYear+1}-春季`, `${nowYear+1}-秋季`]

// 计算宝宝实际月龄
const babyAgeMonths = computed(() => {
  const baby = babiesStore.babyA || babiesStore.babyB
  if (!baby?.birthDate) return 36
  const b = new Date(baby.birthDate); const n = new Date()
  return (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth())
})

const dims = computed(() => {
  const scores = store.getLatestCoupling() ?? calcCouplingScores(interactionsStore.sproutEntries.map(e => e.type), babyAgeMonths.value)
  return [
    { key: 'emotional', label: '情绪依赖', score: scores.emotional, color: 'var(--twin-baby-b)' },
    { key: 'social', label: '社交重叠', score: scores.social, color: 'var(--twin-baby-a)' },
    { key: 'identity', label: '身份认同', score: scores.identity, color: 'var(--twin-accent)' },
  ]
})

const avgCoupling = computed(() => Math.round(dims.value.reduce((s, d) => s + d.score, 0) / 3))

const verdictText = computed(() => {
  if (avgCoupling.value >= 70) return '两个宝宝当前耦合度较高，建议本学期待在同一班级，下学期再评估'
  if (avgCoupling.value >= 40) return '耦合度适中，同班或分班皆可，以你的接送便利为准'
  return '两个宝宝已自然分化，各自独立性强，分班是值得考虑的选择'
})

const verdictBg = computed(() => {
  if (avgCoupling.value >= 70) return 'var(--twin-warning-light)'
  if (avgCoupling.value >= 40) return 'var(--twin-accent-light)'
  return 'var(--twin-baby-a-light)'
})

function saveDecision() {
  const scores = store.getLatestCoupling() ?? calcCouplingScores(interactionsStore.sproutEntries.map(e => e.type), babyAgeMonths.value)
  store.addSchoolDecision({ term: selectedTerm.value, sameClass: sameClass.value, couplingScore: scores, note: noteText.value })
  noteText.value = ''
  uni.showToast({ title: '✅ 评估已保存', icon: 'success' })
}

onMounted(() => { uni.setNavigationBarTitle({ title: '入园助手' }) })
</script>

<style scoped>
.school-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 100rpx; }
.section-header { text-align: center; margin-bottom: 28rpx; }
.section-icon { font-size: 80rpx; }
.section-title { display: block; font-size: 44rpx; font-weight: 700; color: var(--twin-text); margin: 12rpx 0; }
.section-desc { font-size: 26rpx; color: var(--twin-text-secondary); }

.card-title { display: block; font-size: 28rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 12rpx; }
.card-sub { display: block; font-size: 22rpx; color: var(--twin-text-secondary); margin-bottom: 16rpx; margin-top: -8rpx; }

/* 雷达图模拟 */
.radar-card { background: var(--twin-card-bg); border-radius: 20rpx; padding: 24rpx; margin-bottom: 20rpx; }
.radar-axis { display: flex; justify-content: space-between; font-size: 20rpx; color: var(--twin-text-secondary); margin-bottom: 12rpx; }
.radar-bar-wrap { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; }
.bar-label { font-size: 24rpx; width: 120rpx; color: var(--ink); }
.bar-track { flex: 1; height: 16rpx; background: var(--twin-border); border-radius: 8rpx; }
.bar-fill { height: 16rpx; border-radius: 8rpx; }
.bar-val { font-size: 24rpx; font-weight: 700; width: 48rpx; text-align: right; color: var(--twin-text); }

.coupling-verdict { padding: 16rpx 20rpx; border-radius: 12rpx; margin-top: 12rpx; }
.verdict-text { font-size: 24rpx; color: var(--ink); line-height: 1.5; }

/* 同班/分班对比 */
.compare-section { margin-bottom: 20rpx; }
.compare-cols { display: flex; gap: 12rpx; }
.compare-col { flex: 1; background: var(--twin-card-bg); border-radius: 16rpx; padding: 16rpx 14rpx; }
.compare-col.blue { border-top: 6rpx solid var(--twin-baby-a); }
.compare-col.pink { border-top: 6rpx solid var(--twin-baby-b); }
.col-title { display: block; font-size: 28rpx; font-weight: 700; margin-bottom: 10rpx; }
.compare-col.blue .col-title { color: var(--twin-baby-a); }
.compare-col.pink .col-title { color: var(--twin-baby-b); }
.col-item { display: block; font-size: 22rpx; color: var(--ink); line-height: 1.8; }
.col-item.risk { color: var(--twin-text-secondary); }

/* 评估记录 */
.assess-section { margin-bottom: 20rpx; }
.assess-list { display: flex; flex-direction: column; gap: 8rpx; }
.assess-card { background: var(--twin-card-bg); border-radius: 14rpx; padding: 16rpx 20rpx; }
.assess-header { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.assess-term { font-size: 26rpx; font-weight: 600; color: var(--twin-text); }
.assess-choice { font-size: 24rpx; color: var(--twin-baby-a); }
.assess-note { font-size: 24rpx; color: var(--twin-text-tertiary); }
.empty-mini { font-size: 24rpx; color: var(--twin-text-secondary); padding: 24rpx; text-align: center; }

/* 新建评估 */
.new-assess { background: var(--twin-card-bg); border-radius: 20rpx; padding: 24rpx; }
.picker-row { display: flex; justify-content: space-between; padding: 16rpx 0; font-size: 28rpx; color: var(--twin-text); border-bottom: 2rpx solid var(--twin-border); margin-bottom: 16rpx; }
.toggle-row { display: flex; gap: 12rpx; margin-bottom: 16rpx; }
.toggle-btn { flex: 1; text-align: center; padding: 20rpx 0; background: var(--twin-card-bg); border: 4rpx solid var(--twin-border); border-radius: 16rpx; font-size: 26rpx; color: var(--twin-text-tertiary); }
.toggle-btn.active { border-color: var(--twin-baby-a); background: var(--twin-baby-a-light); color: var(--twin-text); font-weight: 600; }
.note-input { width: 100%; padding: 20rpx 24rpx; background: var(--twin-hover); border-radius: 14rpx; font-size: 26rpx; margin-bottom: 16rpx; box-sizing: border-box; }
.btn-save { width: 100%; padding: 24rpx 0; background: var(--twin-accent); color: var(--twin-card-bg); border: none; border-radius: 16rpx; font-size: 28rpx; font-weight: 600; }
.disclaimer { display:block; text-align:center; font-size:20rpx; color:var(--ink-lt); margin-top:24rpx; line-height:1.5; }
</style>
