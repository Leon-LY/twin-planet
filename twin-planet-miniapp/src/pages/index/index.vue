<!-- 宇宙苗圃 · Cosmic Nursery v2 -->
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
      <view class="page-shell cosmic-nursery">
        <!-- 星场 -->
        <CosmicStarfield />

        <!-- 星云光晕 — 深度感 -->
        <view class="nebula-glow" />

        <!-- 顶栏 -->
        <view class="top-bar anim-orbit-in anim-d1">
          <view>
            <text class="greeting-main">{{ greeting }}</text>
            <text class="greeting-sub">并蒂而生，同步成长</text>
            <text class="caption" v-if="streakDays > 0" style="color:var(--cosmic-gold);margin-top:6rpx">
              ✦ 轨道连续 {{ streakDays }} 天
            </text>
          </view>
          <view class="brand-mark brand-mark-sm converge" />
        </view>

        <!-- 双星系统 -->
        <view class="twin-system">
          <!-- 大宝 -->
          <view class="planet-stage anim-orbit-in anim-d2" @click="goRecord">
            <PlanetOrb
              :size="140" color="#FF6B35"
              :initial-text="(babyA?.nickname || babyA?.name || '大宝').charAt(0)"
              :label="babyA?.nickname || babyA?.name || '大宝'"
              :running="babyA ? recordsStore.isBabyRunning(babyA.id) : false"
              :atmosphere="babyA ? recordsStore.isBabyRunning(babyA.id) : false"
              :glowing="true" twin="a" biome="ocean"
            />
            <text class="planet-status" v-if="babyStatus(babyA)">{{ babyStatus(babyA) }}</text>
            <text class="planet-status muted" v-else>轻触记录 ✦</text>
          </view>

          <!-- 光桥 -->
          <view class="bridge-stage anim-orbit-in anim-d3">
            <LightBridge :state="bridgeState" :height="72" :animated="true" />
          </view>

          <!-- 二宝 -->
          <view class="planet-stage anim-orbit-in anim-d4" @click="goRecord">
            <PlanetOrb
              :size="140" color="#A855F7"
              :initial-text="(babyB?.nickname || babyB?.name || '二宝').charAt(0)"
              :label="babyB?.nickname || babyB?.name || '二宝'"
              :running="babyB ? recordsStore.isBabyRunning(babyB.id) : false"
              :atmosphere="babyB ? recordsStore.isBabyRunning(babyB.id) : false"
              :glowing="true" twin="b" biome="cloud"
            />
            <text class="planet-status" v-if="babyStatus(babyB)">{{ babyStatus(babyB) }}</text>
            <text class="planet-status muted" v-else>轻触记录 ✦</text>
          </view>
        </view>

        <!-- 轨道连胜 -->
        <view class="streak-bar anim-orbit-in anim-d5" v-if="streakDays > 0">
          <view class="streak-dots">
            <view v-for="i in 7" :key="i" class="streak-dot" :class="{ lit: i <= Math.min(streakDays, 7) }" />
          </view>
          <text class="caption" style="color:var(--cosmic-gold);margin-top:8rpx">
            {{ streakDays >= 7 ? '轨道坚如磐石 · ' + streakDays + ' 天' : '轨道环 ' + streakDays + '/7' }}
          </text>
        </view>

        <!-- 宇宙记录 按钮 -->
        <view class="primary-action-zone anim-orbit-in anim-d5">
          <button class="cosmic-main-btn" @click="goRecord">
            <text class="cosmic-btn-icon">⚡</text>
            <text class="cosmic-btn-text">宇宙记录</text>
          </button>
        </view>

        <!-- 快捷双宝 -->
        <view class="quick-dual anim-orbit-in anim-d6" v-if="babyA && babyB">
          <view class="quick-chip" @click="dualRecord('feeding')"><text>🍼 两个都喂了</text></view>
          <view class="quick-chip" @click="dualRecord('sleep')"><text>😴 都睡了</text></view>
          <view class="quick-chip" @click="dualRecord('diaper')"><text>🧷 都换了</text></view>
        </view>

        <!-- 底部 -->
        <view class="nav-zone anim-orbit-in anim-d7">
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
import CosmicStarfield from '@/components/cosmic/CosmicStarfield.vue'
import PlanetOrb from '@/components/cosmic/PlanetOrb.vue'
import LightBridge from '@/components/cosmic/LightBridge.vue'

const loading = ref(true)
const userStore = useUserStore()

const themeClass = computed(() => {
  const classes = ['page-root']
  const h = new Date().getHours()
  if (h >= 22 || h < 6) classes.push('theme-dark')
  if (userStore.isGrandmaMode) classes.push('font-large')
  return classes.join(' ')
})

onMounted(() => { setTimeout(() => { loading.value = false }, 500) })

const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const isGrandma = computed(() => userStore.isGrandmaMode)
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好，宇宙守护者'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了，星星很亮'
})

function babyStatus(baby: any): string {
  if (!baby) return ''
  const logs = recordsStore.recentLogsByBaby[baby.id]
  if (!logs?.length) return ''
  const last = logs[logs.length - 1]
  if (recordsStore.isBabyRunning(baby.id)) return '计时中…'
  const mins = Math.floor((Date.now() - last.createdAt) / 60000)
  const action = last.type === 'feeding' ? '喂奶' : last.type === 'sleep' ? '睡觉' : last.type === 'diaper' ? '换尿布' : '记录'
  if (mins < 1) return `刚刚${action}`
  if (mins < 60) return `${mins}分钟前${action}`
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
  const labels: Record<string, string> = { feeding: '两个都喂了 ✦', sleep: '两个都睡了 ✦', diaper: '两个都换了 ✦' }
  uni.showToast({ title: labels[type], icon: 'success' })
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
.cosmic-nursery { position: relative; padding-top: 40rpx; padding-bottom: 100rpx; }

/* 星云光晕 */
.nebula-glow {
  position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
  width: 500rpx; height: 500rpx; border-radius: 50%;
  background: radial-gradient(circle,
    rgba(168,85,247,0.06) 0%,
    rgba(255,107,53,0.04) 40%,
    transparent 70%
  );
  pointer-events: none; z-index: 0;
}

/* 顶栏 */
.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48rpx; position: relative; z-index: 1; }
.greeting-main { font-size: var(--font-hero); font-weight: 800; color: var(--text-starlight); display: block; letter-spacing: 1rpx; }
.greeting-sub { font-size: var(--font-caption); color: var(--text-whisper); display: block; margin-top: 4rpx; letter-spacing: 4rpx; }

/* 双星系统 */
.twin-system { display: flex; flex-direction: column; align-items: center; gap: 0; margin-bottom: 24rpx; position: relative; z-index: 1; }
.planet-stage { display: flex; flex-direction: column; align-items: center; gap: 16rpx; padding: 12rpx 0; }
.planet-status { font-size: var(--font-body); color: var(--text-dust); text-align: center; }
.planet-status.muted { color: var(--text-whisper); font-style: italic; }
.bridge-stage { display: flex; justify-content: center; padding: 4rpx 0; }

/* 轨道连胜 */
.streak-bar { text-align: center; padding: 12rpx 0 24rpx; position: relative; z-index: 1; }
.streak-dots { display: flex; justify-content: center; gap: 12rpx; }
.streak-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: var(--border-void); transition: all 0.3s ease; }
.streak-dot.lit { background: var(--cosmic-gold); box-shadow: 0 0 8rpx rgba(255,210,63,0.4); }

/* 主按钮 */
.primary-action-zone { margin-bottom: 28rpx; position: relative; z-index: 1; }
.cosmic-main-btn {
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  width: 100%; min-height: 104rpx; padding: 32rpx;
  background: var(--surface-card); border: 3rpx solid rgba(0,229,255,0.25);
  border-radius: var(--radius-full);
  box-shadow: 0 0 32rpx rgba(0,229,255,0.1), 0 0 64rpx rgba(0,229,255,0.04);
  transition: transform 0.15s, box-shadow 0.3s;
}
.cosmic-main-btn:active { transform: scale(0.96); box-shadow: 0 0 48rpx rgba(0,229,255,0.2); }
.cosmic-btn-icon { font-size: 36rpx; }
.cosmic-btn-text { font-size: var(--font-subtitle); font-weight: 800; color: var(--text-starlight); letter-spacing: 3rpx; }

/* 快捷 */
.quick-dual { display: flex; gap: var(--space-sm); margin-bottom: 40rpx; position: relative; z-index: 1; }
.quick-chip {
  flex: 1; text-align: center; padding: 24rpx 8rpx;
  background: var(--surface-card); border: 1rpx solid var(--border-void);
  border-radius: var(--radius-lg); font-size: var(--font-caption); color: var(--text-dust);
}
.quick-chip:active { transform: scale(0.94); background: rgba(255,255,255,0.06); }

/* 底部 */
.nav-zone { display: flex; justify-content: space-around; padding-top: 28rpx; border-top: 1rpx solid var(--border-void); position: relative; z-index: 1; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; padding: 14rpx 28rpx; }
.nav-item:active { transform: scale(0.92); opacity: 0.7; }
.nav-icon { font-size: 36rpx; }
.nav-label { font-size: var(--font-caption); color: var(--text-dust); }

/* 奶奶模式 */
.granny-shell { display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 80rpx 48rpx !important; }
.granny-actions { display: flex; flex-direction: column; gap: var(--space-md); }
.granny-btn { text-align: center; padding: 56rpx; background: var(--surface-card); border-radius: var(--radius-xl); border: 4rpx solid var(--border-void); display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }
.granny-btn:active { border-color: var(--cosmic-cyan); transform: scale(0.97); }
.granny-help { border-color: rgba(255,210,63,0.25); }
.granny-emoji { font-size: 72rpx; }
.granny-label { font-size: 48rpx; font-weight: 700; color: var(--text-starlight); }
</style>
