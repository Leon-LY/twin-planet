<template>
  <view class="guard-page">
    <view class="bg-spot spot-a" /><view class="bg-spot spot-b" />
    <view class="page-header">
      <text class="page-title">守护中心</text>
      <text class="page-subtitle">照顾好自己，才能照顾好两个小星球</text>
    </view>

    <view class="energy-section">
      <text class="section-label">🔋 电量表</text>
      <view class="energy-cards">
        <view class="energy-card">
          <text class="energy-who">👩 妈妈</text>
          <view class="energy-bar-wrap">
            <view class="energy-bar" :style="{ width: store.momEnergy.level * 10 + '%', background: energyColor(store.momEnergy.level) }" />
          </view>
          <text class="energy-text">{{ energyLabel(store.momEnergy.level) }}</text>
          <text class="energy-reason">{{ store.momEnergy.reason }}</text>
        </view>
        <view class="energy-card">
          <text class="energy-who">👨 爸爸</text>
          <view class="energy-bar-wrap">
            <view class="energy-bar" :style="{ width: store.dadEnergy.level * 10 + '%', background: energyColor(store.dadEnergy.level) }" />
          </view>
          <text class="energy-text">{{ energyLabel(store.dadEnergy.level) }}</text>
          <text class="energy-reason">{{ store.dadEnergy.reason }}</text>
        </view>
      </view>
      <view class="energy-adjust">
        <view v-for="n in 10" :key="n" class="adjust-btn" @click="setMom(n)">👩{{ n }}</view>
        <view v-for="n in 10" :key="'d'+n" class="adjust-btn" @click="setDad(n)">👨{{ n }}</view>
      </view>
    </view>

    <view class="onetime-section">
      <text class="section-label">⏳ 专属时光</text>
      <view class="time-compare" v-if="babiesStore.isTwinsComplete">
        <view class="time-slot amber">
          <text class="time-baby">{{ babiesStore.babyA?.nickname }}</text>
          <text class="time-val">{{ store.timeWithBaby(babiesStore.babyA?.id ?? '') }}min</text>
        </view>
        <view class="time-vs">VS</view>
        <view class="time-slot rose">
          <text class="time-baby">{{ babiesStore.babyB?.nickname }}</text>
          <text class="time-val">{{ store.timeWithBaby(babiesStore.babyB?.id ?? '') }}min</text>
        </view>
      </view>
      <view class="time-warning" v-if="store.timeGapWarning"><text>⚠️ {{ store.timeGapWarning.msg }}</text></view>

      <view class="quick-timer" v-if="!store.activeSession && babiesStore.isTwinsComplete">
        <text class="timer-label">现在照亮谁？</text>
        <view class="timer-btns">
          <view class="timer-btn amber" @click="startTime(babiesStore.babyA?.id??'', babiesStore.babyA?.nickname??'大宝', 'var(--amber)')">
            <text>{{ babiesStore.babyA?.nickname }}</text>
          </view>
          <view class="timer-btn rose" @click="startTime(babiesStore.babyB?.id??'', babiesStore.babyB?.nickname??'二宝', 'var(--rose)')">
            <text>{{ babiesStore.babyB?.nickname }}</text>
          </view>
        </view>
      </view>

      <view class="active-timer" v-if="store.activeSession">
        <text class="timer-baby-name">{{ store.activeSession.babyName }}</text>
        <text class="timer-elapsed">{{ formatSessionTime(sessionElapsed) }}</text>
        <text class="timer-running">星尘降临中...</text>
        <button class="btn-end" @click="endTime">结束</button>
      </view>

      <view v-if="store.sessions.length">
        <text class="mini-label">今日记录</text>
        <view v-for="s in store.sessions.slice().reverse().slice(0,5)" :key="s.id" class="session-item">
          <text class="s-baby" :style="{color:s.babyColor}">{{ s.babyName }}</text>
          <text class="s-dur">{{ s.durationMin }}分钟</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGuardianStore } from '@/stores/guardian'
import { useBabiesStore } from '@/stores/babies'

const store = useGuardianStore()
const babiesStore = useBabiesStore()

const sessionElapsed = ref(0)
let sessionTimer: ReturnType<typeof setInterval> | null = null
watch(() => store.activeSession, (s) => {
  if (s) { sessionElapsed.value = 0; sessionTimer = setInterval(() => sessionElapsed.value++, 1000) }
  else { if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null } }
}, { immediate: true })
onUnmounted(() => { if (sessionTimer) clearInterval(sessionTimer) })

function formatSessionTime(s: number): string {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
function energyColor(lv: number) {
  if (lv >= 7) return 'var(--mint)'; if (lv >= 4) return 'var(--gold)'; return 'var(--rose)'
}
function energyLabel(lv: number) {
  if (lv >= 8) return '星光满盈'; if (lv >= 6) return '星光稳定'; if (lv >= 4) return '星光微弱'; if (lv >= 2) return '星光黯淡'; return '几乎熄灭'
}
function setMom(n: number) { store.setEnergy('mom', n, '手动设置') }
function setDad(n: number) { store.setEnergy('dad', n, '手动设置') }
function startTime(id: string, name: string, color: string) { store.startSession(id, name, color) }
function endTime() {
  const s = store.endSession()
  if (s) uni.showToast({ title: `${s.babyName} · ${s.durationMin}分钟 ✦`, icon: 'success' })
  else uni.showToast({ title: '不足1分钟', icon: 'none' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '守护中心' })
  store.autoCalcEnergy('mom'); store.autoCalcEnergy('dad')
})
</script>

<style scoped>
.guard-page { min-height: 100vh; background: var(--paper); position: relative; padding: 40rpx 28rpx calc(64rpx + env(safe-area-inset-bottom)); }
.bg-spot { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; }
.spot-a { width: 300rpx; height: 300rpx; top: 120rpx; right: -100rpx; background: radial-gradient(circle, rgba(212,128,104,0.03) 0%, transparent 60%); }
.spot-b { width: 260rpx; height: 260rpx; bottom: 300rpx; left: -100rpx; background: radial-gradient(circle, rgba(224,123,62,0.03) 0%, transparent 60%); }

.page-header { margin-bottom: 32rpx; position: relative; z-index: 1; }
.page-title { display: block; font-family: var(--font-journal); font-size: var(--font-title); color: var(--ink); }
.page-subtitle { font-size: var(--font-body); color: var(--ink-md); margin-top: 4rpx; }

.section-label { display: block; font-size: 28rpx; font-weight: 600; color: var(--ink); margin-bottom: 16rpx; }
.mini-label { display: block; font-size: 24rpx; color: var(--ink-md); margin-bottom: 8rpx; }

.energy-section { margin-bottom: 40rpx; position: relative; z-index: 1; }
.energy-cards { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.energy-card { flex: 1; background: var(--cream); border-radius: var(--radius-md); padding: 20rpx 24rpx; border: 2rpx solid var(--dot); }
.energy-who { font-size: 26rpx; font-weight: 600; color: var(--ink); }
.energy-bar-wrap { height: 12rpx; background: var(--dot); border-radius: 6rpx; margin: 12rpx 0; }
.energy-bar { height: 12rpx; border-radius: 6rpx; transition: width 0.5s; min-width: 10%; }
.energy-text { font-size: 32rpx; font-weight: 700; color: var(--ink); }
.energy-reason { display: block; font-size: 22rpx; color: var(--ink-md); margin-top: 4rpx; }
.energy-adjust { display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.adjust-btn { font-size: 22rpx; padding: 8rpx 16rpx; background: var(--cream); border: 1px solid var(--dot); border-radius: 20rpx; color: var(--ink-md); }

.onetime-section { position: relative; z-index: 1; }
.time-compare { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.time-slot { flex: 1; text-align: center; padding: 20rpx; border-radius: var(--radius-md); }
.time-slot.amber { background: var(--amber-lt); }
.time-slot.rose { background: var(--rose-lt); }
.time-baby { display: block; font-size: 24rpx; color: var(--ink-md); }
.time-val { font-family: var(--font-journal); font-size: 44rpx; font-weight: 700; color: var(--ink); }
.time-vs { font-size: 24rpx; color: var(--ink-lt); font-weight: 600; }
.time-warning { text-align: center; padding: 12rpx; background: var(--gold-lt); border-radius: 12rpx; margin-bottom: 16rpx; font-size: 22rpx; color: var(--gold); }

.timer-label { display: block; font-size: 26rpx; color: var(--ink); font-weight: 600; margin-bottom: 12rpx; }
.timer-btns { display: flex; gap: 16rpx; }
.timer-btn { flex: 1; text-align: center; padding: 32rpx; border-radius: var(--radius-md); font-size: 28rpx; font-weight: 600; }
.timer-btn.amber { background: var(--amber-lt); color: var(--amber); border: 2rpx solid var(--amber); }
.timer-btn.rose { background: var(--rose-lt); color: var(--rose); border: 2rpx solid var(--rose); }

.active-timer { text-align: center; padding: 32rpx; background: var(--cream); border-radius: var(--radius-md); border: 2rpx solid var(--mint); margin-bottom: 16rpx; }
.timer-baby-name { display: block; font-size: 36rpx; font-weight: 700; color: var(--ink); }
.timer-elapsed { display: block; font-family: var(--font-journal); font-size: 56rpx; color: var(--ink); margin: 8rpx 0; letter-spacing: 3rpx; }
.timer-running { display: block; font-size: 24rpx; color: var(--mint); margin: 0 0 16rpx; }
.btn-end { width: 100%; padding: 20rpx 0; background: var(--twin-danger); color: #FFF; border: none; border-radius: var(--radius-md); font-size: 28rpx; }

.session-item { display: flex; justify-content: space-between; padding: 10rpx 0; font-size: 24rpx; }
.s-baby { font-weight: 600; }
.s-dur { color: var(--ink-md); }
</style>
