<!--
  宇宙苗圃 · Cosmic Nursery v3
  设计原则：动效只用于状态变化。空间即信息。少即是多。
-->
<template>
  <view :class="[themeClass, { 'font-large': isGrandma }]">
    <template v-if="loading">
      <view class="page-shell"><TwinSkeleton type="brand" /><TwinSkeleton type="twins" /></view>
    </template>

    <template v-else-if="isGrandma">
      <view class="page-shell granny-shell">
        <view class="brand-mark brand-mark-lg converge" style="margin:0 auto 48rpx" />
        <text class="heading-xl" style="text-align:center;display:block;margin-bottom:8rpx">并蒂星球</text>
        <text class="body-text" style="text-align:center;display:block;margin-bottom:64rpx">{{ greeting }}</text>
        <view class="granny-actions">
          <view class="granny-btn" @click="goRecord"><view class="brand-mark brand-mark-sm" /><text class="granny-label">记一笔</text></view>
          <view class="granny-btn" @click="goGrowth"><text class="granny-emoji">🌱</text><text class="granny-label">看看长多大了</text></view>
          <view class="granny-btn granny-help" @click="goHelp"><text class="granny-emoji">📞</text><text class="granny-label">问家里人</text></view>
        </view>
      </view>
    </template>

    <template v-else-if="!loading">
      <view class="page-shell nursery">
        <CosmicStarfield />

        <!-- 问候 — 排版即设计 -->
        <view class="greeting-zone">
          <text class="greeting-main">{{ greeting }}</text>
        </view>

        <!-- 双星 — 留白即关系 -->
        <view class="twins-zone">
          <view class="twin-card" @click="goRecord">
            <PlanetOrb
              :size="120" color="#FF6B35"
              :initial-text="(babyA?.nickname || babyA?.name || '大宝').charAt(0)"
              :running="babyA ? recordsStore.isBabyRunning(babyA.id) : false"
              :atmosphere="babyA ? recordsStore.isBabyRunning(babyA.id) : false"
              :glowing="!!(babyA && recordsStore.isBabyRunning(babyA.id))"
              twin="a"
            />
            <view class="twin-info">
              <text class="twin-name">{{ babyA?.nickname || babyA?.name || '大宝' }}</text>
              <text class="twin-status" v-if="babyStatus(babyA)">{{ babyStatus(babyA) }}</text>
              <text class="twin-status muted" v-else>轻触记录</text>
            </view>
          </view>

          <!-- 空间即关系 — 不用线条 -->
          <view class="twins-space" />

          <view class="twin-card" @click="goRecord">
            <PlanetOrb
              :size="120" color="#A855F7"
              :initial-text="(babyB?.nickname || babyB?.name || '二宝').charAt(0)"
              :running="babyB ? recordsStore.isBabyRunning(babyB.id) : false"
              :atmosphere="babyB ? recordsStore.isBabyRunning(babyB.id) : false"
              :glowing="!!(babyB && recordsStore.isBabyRunning(babyB.id))"
              twin="b"
            />
            <view class="twin-info">
              <text class="twin-name">{{ babyB?.nickname || babyB?.name || '二宝' }}</text>
              <text class="twin-status" v-if="babyStatus(babyB)">{{ babyStatus(babyB) }}</text>
              <text class="twin-status muted" v-else>轻触记录</text>
            </view>
          </view>
        </view>

        <!-- 连胜 — 极简一行 -->
        <view class="streak-line" v-if="streakDays > 0">
          <text class="streak-text">✦ 连续 {{ streakDays }} 天</text>
        </view>

        <!-- 唯一核心操作 -->
        <view class="action-zone">
          <button class="record-btn" @click="goRecord">
            <text class="record-btn-text">宇宙记录</text>
          </button>
        </view>

        <!-- 导航 — 克制 -->
        <view class="nav-zone">
          <view class="nav-item" @click="goGrowth"><text class="nav-label">生长</text></view>
          <view class="nav-item" @click="goSnapshot"><text class="nav-label">快照</text></view>
          <view class="nav-item" @click="goMore"><text class="nav-label">探索</text></view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import TwinSkeleton from '@/components/twin-skeleton/twin-skeleton.vue'
import CosmicStarfield from '@/components/cosmic/CosmicStarfield.vue'
import PlanetOrb from '@/components/cosmic/PlanetOrb.vue'

const loading = ref(true)
const userStore = useUserStore()

const themeClass = computed(() => {
  const classes = ['page-root']
  const h = new Date().getHours()
  if (h >= 22 || h < 6) classes.push('theme-dark')
  if (userStore.isGrandmaMode) classes.push('font-large')
  return classes.join(' ')
})

onMounted(() => { setTimeout(() => { loading.value = false }, 400) })

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const isGrandma = computed(() => userStore.isGrandmaMode)
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 9) return '早上好'
  if (h < 14) return '下午好'
  if (h < 18) return '傍晚好'
  return '晚上好'
})

function babyStatus(baby: any): string {
  if (!baby) return ''
  if (recordsStore.isBabyRunning(baby.id)) return '计时中'
  const logs = recordsStore.recentLogsByBaby[baby.id]
  if (!logs?.length) return ''
  const last = logs[logs.length - 1]
  const mins = Math.floor((Date.now() - last.createdAt) / 60000)
  const a = last.type === 'feeding' ? '喂奶' : last.type === 'sleep' ? '睡觉' : '记录'
  if (mins < 1) return `刚刚${a}`
  if (mins < 60) return `${mins}分钟前`
  return `${Math.floor(mins / 60)}小时前`
}

const navigate = (url: string) => uni.navigateTo({ url })
const goRecord = () => navigate('/pages/record/index')
const goGrowth = () => navigate('/pages/growth/index')
const goSnapshot = () => navigate('/pages/snapshot/index')
const goMore = () => {
  uni.showActionSheet({
    itemList: ['萌芽日记','星尘日志','指挥官控制台','星光监测站','星际通讯','轨道决策','星座日志'],
    success: (res) => {
      uni.navigateTo({ url: ['/pages/sprout/index','/pages/contribution/index','/pages/duty/index','/pages/guardian/index','/pages/handover/index','/pages/school/index','/pages/milestones/index'][res.tapIndex] })
    },
  })
}
const goHelp = () => uni.showModal({ title: '需要帮忙？', content: '打电话给家里人，或者打开记录页点最大的按钮就行。', confirmText: '我知道了', showCancel: false })
</script>

<style scoped>
.nursery { position: relative; display: flex; flex-direction: column; min-height: 100vh; padding-top: 56rpx; }

/* 问候 */
.greeting-zone { margin-bottom: 64rpx; position: relative; z-index: 1; }
.greeting-main { font-size: var(--font-display); font-weight: 300; color: var(--text-starlight); letter-spacing: -1rpx; }

/* 双星 — 两侧分布 + 中间留白 */
.twins-zone { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 48rpx; position: relative; z-index: 1; padding: 0 16rpx; }
.twin-card { display: flex; flex-direction: column; align-items: center; gap: 20rpx; width: 200rpx; }
.twin-info { display: flex; flex-direction: column; align-items: center; gap: 4rpx; }
.twin-name { font-size: var(--font-body-lg); font-weight: 600; color: var(--text-starlight); }
.twin-status { font-size: var(--font-caption); color: var(--text-dust); }
.twin-status.muted { color: var(--text-whisper); }
.twins-space { width: 40rpx; flex-shrink: 0; }

/* 连胜 */
.streak-line { text-align: center; margin-bottom: 40rpx; position: relative; z-index: 1; }
.streak-text { font-size: var(--font-caption); color: var(--cosmic-gold); letter-spacing: 2rpx; }

/* 核心操作 */
.action-zone { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; margin-bottom: 24rpx; }
.record-btn {
  width: 240rpx; height: 240rpx; border-radius: 50%;
  background: var(--surface-card);
  border: 2rpx solid rgba(0,229,255,0.15);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s var(--ease-spring), box-shadow 0.3s;
  box-shadow: 0 0 48rpx rgba(0,229,255,0.06);
}
.record-btn:active { transform: scale(0.94); box-shadow: 0 0 64rpx rgba(0,229,255,0.15); }
.record-btn-text { font-size: var(--font-card); font-weight: 600; color: var(--text-starlight); letter-spacing: 2rpx; }

/* 导航 */
.nav-zone { display: flex; justify-content: center; gap: 64rpx; padding: 32rpx 0; border-top: 1rpx solid var(--border-void); position: relative; z-index: 1; }
.nav-item { padding: 8rpx 16rpx; }
.nav-label { font-size: var(--font-body); color: var(--text-whisper); letter-spacing: 2rpx; transition: color 0.2s; }
.nav-item:active .nav-label { color: var(--text-starlight); }

/* 奶奶模式 */
.granny-shell { display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 80rpx 48rpx !important; }
.granny-actions { display: flex; flex-direction: column; gap: var(--space-md); }
.granny-btn { text-align: center; padding: 56rpx; background: var(--surface-card); border-radius: var(--radius-xl); border: 4rpx solid var(--border-void); display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }
.granny-btn:active { border-color: var(--cosmic-cyan); transform: scale(0.97); }
.granny-help { border-color: rgba(255,210,63,0.25); }
.granny-emoji { font-size: 72rpx; }
.granny-label { font-size: 48rpx; font-weight: 700; color: var(--text-starlight); }
</style>
