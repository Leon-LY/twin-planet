<template>
  <view class="home-page" :class="{ 'granny-mode': isGrandma }">
    <!-- ================================================================ -->
    <!-- 奶奶模式：极简 3 大按钮 -->
    <!-- ================================================================ -->
    <template v-if="isGrandma">
      <view class="brand-section grandpa-brand">
        <text class="brand-name grandpa-name">并蒂星球</text>
        <text class="brand-slogan grandpa-slogan">并蒂而生，同步成长</text>
      </view>

      <view class="grandpa-grid">
        <view class="grandpa-btn" @click="goRecord">
          <text class="grandpa-emoji">📝</text>
          <text class="grandpa-label">记录</text>
        </view>
        <view class="grandpa-btn" @click="goGrowth">
          <text class="grandpa-emoji">📈</text>
          <text class="grandpa-label">看对比</text>
        </view>
        <view class="grandpa-btn help-btn" @click="goHelp">
          <text class="grandpa-emoji">📞</text>
          <text class="grandpa-label">找帮助</text>
        </view>
      </view>

      <view class="grandpa-footer">
        <text class="grandpa-footer-text">点上面的按钮就行，别怕按错</text>
      </view>
    </template>

    <!-- ================================================================ -->
    <!-- 爸爸模式：简化快照 + 核心入口 -->
    <!-- ================================================================ -->
    <template v-else-if="isDad">
      <view class="brand-section compact">
        <text class="brand-name compact-name">并蒂星球</text>
      </view>

      <!-- 三明治快照卡片 -->
      <view class="twins-cards">
        <view class="baby-card card-aning" v-if="babyA">
          <view class="card-accent" />
          <text class="card-emoji">{{ babyA.gender === 'male' ? '👦' : '👧' }}</text>
          <text class="card-name">{{ babyA.nickname || babyA.name }}</text>
          <text class="card-status" v-if="babyStatus(babyA.id)">{{ babyStatus(babyA.id) }}</text>
          <text class="card-status muted" v-else>📝 开始记录吧</text>
        </view>
        <view class="card-divider" />
        <view class="baby-card card-anran" v-if="babyB">
          <view class="card-accent pink" />
          <text class="card-emoji">{{ babyB.gender === 'male' ? '👦' : '👧' }}</text>
          <text class="card-name">{{ babyB.nickname || babyB.name }}</text>
          <text class="card-status" v-if="babyStatus(babyB.id)">{{ babyStatus(babyB.id) }}</text>
          <text class="card-status muted" v-else>📝 开始记录吧</text>
        </view>
      </view>

      <!-- 今天关键数字 -->
      <view class="dad-metrics" v-if="todayLogCount > 0">
        <text class="metric-num">{{ todayLogCount }}</text>
        <text class="metric-label">次记录</text>
        <text class="metric-divider">·</text>
        <text class="metric-num">{{ todayFeedingCount }}</text>
        <text class="metric-label">次喂奶</text>
        <text class="metric-divider">·</text>
        <text class="metric-num">{{ todayDiaperCount }}</text>
        <text class="metric-label">次换尿布</text>
      </view>
      <view class="dad-metrics empty" v-else>
        <text class="metric-label">今天还没记录，去记录第一条吧</text>
      </view>

      <!-- 爸爸专属入口 -->
      <view class="dad-actions">
        <view class="dad-action-card" @click="goRecord">
          <text class="dad-action-emoji">🍼</text>
          <text class="dad-action-label">双轨记录</text>
        </view>
        <view class="dad-action-card" @click="goDuty">
          <text class="dad-action-emoji">🦸</text>
          <text class="dad-action-label">值班模式</text>
        </view>
        <view class="dad-action-card" @click="goSnapshot">
          <text class="dad-action-emoji">📊</text>
          <text class="dad-action-label">爸爸快照</text>
        </view>
        <view class="dad-action-card" @click="goGrowth">
          <text class="dad-action-emoji">📈</text>
          <text class="dad-action-label">生长曲线</text>
        </view>
        <view class="dad-action-card" @click="goSchool">
          <text class="dad-action-emoji">🏫</text>
          <text class="dad-action-label">入园助手</text>
        </view>
      </view>
    </template>

    <!-- ================================================================ -->
    <!-- 妈妈 / 默认模式：完整版首页 -->
    <!-- ================================================================ -->
    <template v-else>
      <view class="brand-section">
        <view class="brand-icon">🌺🌺</view>
        <text class="brand-name">并蒂星球</text>
        <text class="brand-slogan">并蒂而生，同步成长</text>
      </view>

      <!-- 双宝动态卡片 -->
      <view class="twins-cards">
        <view class="baby-card card-aning" v-if="babyA">
          <view class="card-accent" />
          <text class="card-emoji">{{ babyA.gender === 'male' ? '👦' : '👧' }}</text>
          <text class="card-name">{{ babyA.nickname || babyA.name }}</text>
          <text class="card-status" v-if="babyStatus(babyA.id)">{{ babyStatus(babyA.id) }}</text>
          <text class="card-status muted" v-else>📝 开始记录吧</text>
        </view>
        <view class="card-divider" />
        <view class="baby-card card-anran" v-if="babyB">
          <view class="card-accent pink" />
          <text class="card-emoji">{{ babyB.gender === 'male' ? '👦' : '👧' }}</text>
          <text class="card-name">{{ babyB.nickname || babyB.name }}</text>
          <text class="card-status" v-if="babyStatus(babyB.id)">{{ babyStatus(babyB.id) }}</text>
          <text class="card-status muted" v-else>📝 开始记录吧</text>
        </view>
        <!-- 无宝宝时显示引导 -->
        <view class="baby-card empty-card" v-if="!babyA && !babyB" @click="goOnboarding">
          <text class="card-emoji">👶</text>
          <text class="card-name">添加宝宝</text>
          <text class="card-status muted">开始记录双胞胎的成长</text>
        </view>
      </view>

      <!-- 核心功能入口（6 卡片） -->
      <view class="feature-section">
        <text class="section-title">核心功能</text>

        <view class="feature-card" @click="goGrowth">
          <view class="feature-icon">📈</view>
          <view class="feature-body">
            <text class="feature-name">对比生长曲线</text>
            <text class="feature-desc">WHO 标准 + 双宝实测对比 · 一个页面看两个娃</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goRecord">
          <view class="feature-icon">🍼</view>
          <view class="feature-body">
            <text class="feature-name">极简双轨记录</text>
            <text class="feature-desc">1 点开始 · 2 点结束 · 两个宝宝一起记</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goSprout">
          <view class="feature-icon">🌱</view>
          <view class="feature-body">
            <text class="feature-name">萌芽日记</text>
            <text class="feature-desc">记录双胞胎之间的互动瞬间</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goContribution">
          <view class="feature-icon">💪</view>
          <view class="feature-body">
            <text class="feature-name">今天我做了什么</text>
            <text class="feature-desc">看见每一位家人的付出</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goDuty">
          <view class="feature-icon">🦸</view>
          <view class="feature-body">
            <text class="feature-name">爸爸值班模式</text>
            <text class="feature-desc">SOP 清单引擎 · 照着做就能搞定</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goGuardian">
          <view class="feature-icon">🛡️</view>
          <view class="feature-body">
            <text class="feature-name">守护中心</text>
            <text class="feature-desc">电量表 + 一人时光守护</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goSchool">
          <view class="feature-icon">🏫</view>
          <view class="feature-body">
            <text class="feature-name">入园助手</text>
            <text class="feature-desc">分班决策 · 双生耦合度雷达图</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-card" @click="goMilestones">
          <view class="feature-icon">🌟</view>
          <view class="feature-body">
            <text class="feature-name">双宝能力观察</text>
            <text class="feature-desc">独立成长时间线 · 欣赏各自独特</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>
      </view>

      <!-- 底部信息 -->
      <view class="footer-info">
        <text class="footer-text">并蒂星球 · 中国首款双胞胎育儿伴侣</text>
        <text class="footer-version">v0.2.0 · Phase 0</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'

const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const isGrandma = computed(() => userStore.isGrandmaMode)
const isDad = computed(() => userStore.isDad)
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)

// 今天的统计
const todayStart = new Date().setHours(0, 0, 0, 0)
const todayLogs = computed(() =>
  recordsStore.logs.filter(l => l.createdAt >= todayStart)
)
const todayLogCount = computed(() => todayLogs.value.length)
const todayFeedingCount = computed(() => todayLogs.value.filter(l => l.type === 'feeding').length)
const todayDiaperCount = computed(() => todayLogs.value.filter(l => l.type === 'diaper').length)

/** 获取某个宝宝的最新状态文本 */
function babyStatus(babyId: string): string {
  const logs = recordsStore.recentLogsByBaby[babyId]
  if (!logs || logs.length === 0) return ''
  const last = logs[logs.length - 1]
  const now = Date.now()
  const minutesAgo = Math.floor((now - last.createdAt) / 60000)

  if (recordsStore.isBabyRunning(babyId)) {
    const timer = recordsStore.getTimer(babyId)
    const emoji = timer?.type === 'feeding' ? '🍼' : timer?.type === 'sleep' ? '😴' : '🧷'
    return `${emoji} 进行中`
  }

  const emoji = last.type === 'feeding' ? '🍼' : last.type === 'sleep' ? '😴' : '🧷'
  if (minutesAgo < 1) return `${emoji} 刚刚`
  if (minutesAgo < 60) return `${emoji} ${minutesAgo}分钟前`
  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) return `${emoji} ${hoursAgo}小时前`
  const daysAgo = Math.floor(hoursAgo / 24)
  return `${emoji} ${daysAgo}天前`
}

// 导航
const goGrowth = () => uni.navigateTo({ url: '/pages/growth/index' })
const goRecord = () => uni.navigateTo({ url: '/pages/record/index' })
const goSprout = () => uni.navigateTo({ url: '/pages/sprout/index' })
const goContribution = () => uni.navigateTo({ url: '/pages/contribution/index' })
const goDuty = () => uni.navigateTo({ url: '/pages/duty/index' })
const goGuardian = () => uni.navigateTo({ url: '/pages/guardian/index' })
const goSnapshot = () => uni.navigateTo({ url: '/pages/snapshot/index' })
const goSchool = () => uni.navigateTo({ url: '/pages/school/index' })
const goMilestones = () => uni.navigateTo({ url: '/pages/milestones/index' })
const goHandover = () => uni.navigateTo({ url: '/pages/handover/index' })
const goOnboarding = () => uni.navigateTo({ url: '/pages/onboarding/babies' })
const goHelp = () => {
  // 奶奶模式求助：弹出一个提示
  uni.showModal({
    title: '需要帮助？',
    content: '打电话给家人，或者打开记录页点最大的按钮就行。',
    confirmText: '我知道了',
    showCancel: false,
  })
}
</script>

<style scoped>
/* =========================================================== */
/* 通用 */
/* =========================================================== */
.home-page {
  min-height: 100vh;
  background: var(--twin-bg);
  padding: 48rpx 30rpx 80rpx;
}

/* =========================================================== */
/* 奶奶模式 */
/* =========================================================== */
.granny-mode {
  padding: 80rpx 40rpx 80rpx;
}
.grandpa-brand {
  text-align: center;
  padding: 40rpx 0;
}
.grandpa-name {
  font-size: 52rpx !important;
}
.grandpa-slogan {
  font-size: 32rpx !important;
}
.grandpa-grid {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-top: 60rpx;
}
.grandpa-btn {
  text-align: center;
  padding: 56rpx 32rpx;
  background: var(--twin-card-bg);
  border-radius: 28rpx;
  border: 6rpx solid var(--twin-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.grandpa-btn:active {
  background: var(--twin-hover);
}
.grandpa-btn.help-btn {
  border-color: var(--twin-warning);
}
.grandpa-emoji {
  font-size: 64rpx;
}
.grandpa-label {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--twin-text);
}
.grandpa-footer {
  margin-top: 80rpx;
  text-align: center;
}
.grandpa-footer-text {
  font-size: 32rpx;
  color: var(--twin-text-secondary);
}

/* =========================================================== */
/* 品牌区 */
/* =========================================================== */
.brand-section {
  text-align: center;
  padding: 40rpx 0 24rpx;
}
.brand-section.compact {
  padding: 24rpx 0 16rpx;
}
.brand-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}
.brand-name {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: var(--twin-text);
  letter-spacing: 4rpx;
}
.compact-name {
  font-size: 36rpx;
  text-align: left;
}
.brand-slogan {
  display: block;
  font-size: 26rpx;
  color: var(--twin-text-secondary);
  margin-top: 12rpx;
  letter-spacing: 8rpx;
}

/* =========================================================== */
/* 双宝卡片（动态） */
/* =========================================================== */
.twins-cards {
  display: flex;
  margin-top: 40rpx;
  background: var(--twin-card-bg);
  border-radius: 28rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.baby-card {
  flex: 1;
  position: relative;
  padding-left: 24rpx;
}
.baby-card.empty-card {
  text-align: center;
  padding-left: 0;
}
.card-accent {
  position: absolute;
  left: 0;
  top: 8rpx;
  bottom: 8rpx;
  width: 8rpx;
  border-radius: 4rpx;
  background: var(--twin-baby-a);
}
.card-accent.pink {
  background: var(--twin-baby-b);
}
.card-divider {
  width: 2rpx;
  background: var(--twin-border);
  margin: 0 12rpx;
}
.card-emoji {
  font-size: 56rpx;
}
.card-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--twin-text);
  margin-top: 8rpx;
}
.card-status {
  display: block;
  font-size: 24rpx;
  color: var(--twin-text-tertiary);
  margin-top: 8rpx;
}
.card-status.muted {
  color: var(--twin-text-muted);
}

/* =========================================================== */
/* 爸爸模式 · 关键数字 */
/* =========================================================== */
.dad-metrics {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 32rpx;
  background: var(--twin-card-bg);
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
}
.dad-metrics.empty {
  padding: 24rpx 32rpx;
}
.metric-num {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--twin-accent);
}
.metric-label {
  font-size: 26rpx;
  color: var(--twin-text-tertiary);
}
.metric-divider {
  font-size: 26rpx;
  color: var(--twin-text-muted);
  margin: 0 8rpx;
}

/* 爸爸专属操作 */
.dad-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 32rpx;
}
.dad-action-card {
  text-align: center;
  padding: 36rpx 16rpx;
  background: var(--twin-card-bg);
  border-radius: 24rpx;
  border: 4rpx solid var(--twin-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}
.dad-action-card:active {
  background: var(--twin-hover);
}
.dad-action-emoji {
  font-size: 48rpx;
}
.dad-action-label {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--twin-text);
}

/* =========================================================== */
/* 功能入口（妈妈/默认模式） */
/* =========================================================== */
.feature-section {
  margin-top: 48rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--twin-text);
  margin-bottom: 20rpx;
}
.feature-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  background: var(--twin-card-bg);
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}
.feature-card:active {
  background: var(--twin-hover);
}
.feature-icon {
  font-size: 56rpx;
  flex-shrink: 0;
}
.feature-body {
  flex: 1;
}
.feature-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--twin-text);
}
.feature-desc {
  display: block;
  font-size: 22rpx;
  color: var(--twin-text-secondary);
  margin-top: 6rpx;
}
.feature-arrow {
  font-size: 44rpx;
  color: var(--twin-text-muted);
}

/* =========================================================== */
/* 底部 */
/* =========================================================== */
.footer-info {
  margin-top: 64rpx;
  text-align: center;
}
.footer-text {
  display: block;
  font-size: 22rpx;
  color: var(--twin-text-muted);
}
.footer-version {
  display: block;
  font-size: 20rpx;
  color: var(--twin-border);
  margin-top: 8rpx;
}
</style>
