<!-- 宇宙苗圃 · Cosmic Nursery — 双星系统 + 并蒂光桥 + 一个核心按钮 -->
<template>
  <view :class="[themeClass, { 'font-large': isGrandma }]">
    <template v-if="loading">
      <view class="page-shell"><TwinSkeleton type="brand" /><TwinSkeleton type="twins" /></view>
    </template>

    <template v-else-if="isGrandma">
      <view class="page-shell granny-shell">
        <view class="brand-mark brand-mark-lg" style="margin:0 auto 48rpx" />
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
      <view class="page-shell cosmic-nursery">
        <view class="top-bar">
          <view>
            <text class="heading-lg">{{ greeting }}</text>
            <text class="caption" v-if="streakDays > 0" style="color:var(--cosmic-gold);margin-top:4rpx">✦ 轨道连续 {{ streakDays }} 天</text>
          </view>
          <view class="brand-mark brand-mark-sm" />
        </view>

        <view class="twin-system">
          <view class="planet-stage" @click="goRecord">
            <PlanetOrb :size="110" color="#FF6B35" :initial-text="(babyA?.nickname || babyA?.name || 'A').charAt(0)"
              :label="babyA?.nickname || babyA?.name || '大宝'"
              :running="babyA ? recordsStore.isBabyRunning(babyA.id) : false" :glowing="true" twin="a" />
            <text class="planet-status">{{ babyStatus(babyA) }}</text>
          </view>
          <view class="bridge-stage"><LightBridge :state="bridgeState" :height="64" :animated="true" /></view>
          <view class="planet-stage" @click="goRecord">
            <PlanetOrb :size="110" color="#A855F7" :initial-text="(babyB?.nickname || babyB?.name || 'B').charAt(0)"
              :label="babyB?.nickname || babyB?.name || '二宝'"
              :running="babyB ? recordsStore.isBabyRunning(babyB.id) : false" :glowing="true" twin="b" />
            <text class="planet-status">{{ babyStatus(babyB) }}</text>
          </view>
        </view>

        <view class="streak-bar" v-if="streakDays > 0">
          <text class="caption" style="color:var(--cosmic-gold)">{{ streakDays >= 7 ? '✦ 轨道坚如磐石 ' + streakDays + ' 天 ✦' : '✦ 轨道环 ' + streakDays + '/7 ✦' }}</text>
        </view>

        <view class="primary-action-zone">
          <button class="cosmic-main-btn" @click="goRecord"><text class="cosmic-btn-text">⚡ 宇宙记录</text></button>
        </view>

        <view class="quick-dual" v-if="babyA && babyB">
          <view class="quick-chip" @click="dualRecord('feeding')"><text>🍼 两个都喂了</text></view>
          <view class="quick-chip" @click="dualRecord('sleep')"><text>😴 都睡了</text></view>
          <view class="quick-chip" @click="dualRecord('diaper')"><text>🧷 都换了</text></view>
        </view>

        <view class="nav-zone">
          <view class="nav-item" @click="goGrowth"><text class="nav-icon">🌱</text><text class="nav-label">生长</text></view>
          <view class="nav-item" @click="goSnapshot"><text class="nav-icon">📊</text><text class="nav-label">快照</text></view>
          <view class="nav-item" @click="goMore"><text class="nav-icon">✦</text><text class="nav-label">探索</text></view>
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
import PlanetOrb from '@/components/cosmic/PlanetOrb.vue'
import LightBridge from '@/components/cosmic/LightBridge.vue'

// Inline useTheme to avoid lazy-load module issue
const themeClass = computed(() => {
  const classes = ['page-root']
  const h = new Date().getHours()
  if (h >= 22 || h < 6) classes.push('theme-dark')
  if (userStore.isGrandmaMode) classes.push('font-large')
  return classes.join(' ')
})
const loading = ref(true)
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })

const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const isGrandma = computed(() => userStore.isGrandmaMode)
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好，宇宙守护者'; if (h < 9) return '早上好'
  if (h < 12) return '上午好'; if (h < 14) return '中午好'
  if (h < 18) return '下午好'; if (h < 22) return '晚上好'
  return '夜深了，星星很亮'
})

function babyStatus(baby: any): string {
  if (!baby) return ''
  const logs = recordsStore.recentLogsByBaby[baby.id]
  if (!logs?.length) return '轻触记录'
  const last = logs[logs.length - 1]
  if (recordsStore.isBabyRunning(baby.id)) return '计时中…'
  const mins = Math.floor((Date.now() - last.createdAt) / 60000)
  const action = last.type === 'feeding' ? '喂奶' : last.type === 'sleep' ? '睡觉' : last.type === 'diaper' ? '换尿布' : '记录'
  if (mins < 1) return `刚刚${action}`; if (mins < 60) return `${mins}分钟前${action}`
  return `${Math.floor(mins / 60)}小时前${action}`
}

const bridgeState = computed(() => {
  const aR = babyA.value && recordsStore.isBabyRunning(babyA.value.id)
  const bR = babyB.value && recordsStore.isBabyRunning(babyB.value.id)
  if (aR && bR) return 'bright'
  if (aR || bR) return 'steady'
  const aL = babyA.value ? (recordsStore.recentLogsByBaby[babyA.value.id]?.length || 0) : 0
  const bL = babyB.value ? (recordsStore.recentLogsByBaby[babyB.value.id]?.length || 0) : 0
  if (aL === 0 && bL === 0) return 'faint'
  return 'steady'
})

function dualRecord(type: 'feeding' | 'sleep' | 'diaper') {
  if (babyA.value) recordsStore.quickLog(babyA.value.id, type)
  if (babyB.value) recordsStore.quickLog(babyB.value.id, type)
  uni.showToast({ title: type === 'feeding' ? '两个都喂了 ✦' : type === 'sleep' ? '两个都睡了 ✦' : '两个都换了 ✦', icon: 'success' })
}

const navigate = (url: string) => uni.navigateTo({ url })
const goRecord = () => navigate('/pages/record/index')
const goGrowth = () => navigate('/pages/growth/index')
const goSnapshot = () => navigate('/pages/snapshot/index')
const goMore = () => {
  uni.showActionSheet({
    itemList: ['萌芽日记','今天我做了什么','爸爸值班','守护中心','交接班','入园助手','成长足迹'],
    success: (res) => {
      uni.navigateTo({ url: ['/pages/sprout/index','/pages/contribution/index','/pages/duty/index','/pages/guardian/index','/pages/handover/index','/pages/school/index','/pages/milestones/index'][res.tapIndex] })
    },
  })
}
const goHelp = () => uni.showModal({ title: '需要帮忙？', content: '打电话给家里人，或者打开记录页点最大的按钮就行。', confirmText: '我知道了', showCancel: false })
</script>

<style scoped>
.cosmic-nursery { position: relative; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-lg); }
.twin-system { display: flex; flex-direction: column; align-items: center; gap: 0; margin-bottom: var(--space-md); }
.planet-stage { display: flex; flex-direction: column; align-items: center; gap: 12rpx; padding: 8rpx 0; }
.planet-status { font-size: var(--font-caption); color: var(--text-dust); text-align: center; }
.bridge-stage { display: flex; justify-content: center; padding: 8rpx 0; }
.streak-bar { text-align: center; padding: 8rpx 0 16rpx; }
.primary-action-zone { margin-bottom: var(--space-md); }
.cosmic-main-btn { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 96rpx; padding: 28rpx; background: var(--surface-card); border: 3rpx solid rgba(0,229,255,0.2); border-radius: var(--radius-full); box-shadow: 0 0 20rpx rgba(0,229,255,0.08); }
.quick-dual { display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); }
.quick-chip { flex: 1; text-align: center; padding: 20rpx 8rpx; background: var(--surface-card); border: 1rpx solid var(--border-void); border-radius: var(--radius-lg); font-size: var(--font-caption); color: var(--text-dust); transition: transform 0.1s; }
.quick-chip:active { transform: scale(0.94); }
.nav-zone { display: flex; justify-content: space-around; padding-top: var(--space-md); border-top: 1rpx solid var(--border-void); }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; padding: 12rpx 24rpx; }
.nav-item:active { transform: scale(0.92); }
.nav-icon { font-size: 32rpx; }
.nav-label { font-size: var(--font-caption); color: var(--text-dust); }
.granny-shell { display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 80rpx 48rpx !important; }
.granny-actions { display: flex; flex-direction: column; gap: var(--space-md); }
.granny-btn { text-align: center; padding: 56rpx; background: var(--surface-card); border-radius: var(--radius-xl); border: 4rpx solid var(--border-void); display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }
.granny-btn:active { border-color: var(--cosmic-cyan); transform: scale(0.97); }
.granny-help { border-color: rgba(255,210,63,0.25); }
.granny-emoji { font-size: 72rpx; }
.granny-label { font-size: 48rpx; font-weight: 700; color: var(--text-starlight); }
</style>
