<template>
  <view class="guard-page page-enter">
    <view class="page-header">
      <text class="page-title">守护中心</text>
      <text class="page-subtitle">照顾好自己，才能照顾好两个小怪兽</text>
    </view>

    <view class="energy-section">
      <text class="section-label">🔋 电量表</text>
      <view class="energy-cards">
        <view class="energy-card">
          <text class="energy-who"><text class="iconfont icon-role-mom"></text> 妈妈</text>
          <view class="energy-bar-wrap">
            <view class="energy-bar" :style="{ width: store.momEnergy.level * 10 + '%', '--bar-bg': energyColor(store.momEnergy.level) }" />
          </view>
          <text class="energy-text">{{ energyLabel(store.momEnergy.level) }}</text>
          <text class="energy-reason">{{ store.momEnergy.reason }}</text>
        </view>
        <view class="energy-card">
          <text class="energy-who"><text class="iconfont icon-role-dad"></text> 爸爸</text>
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
      <view class="time-warning" v-if="store.timeGapWarning"><text><text class="iconfont icon-warn"></text> {{ store.timeGapWarning.msg }}</text></view>

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
        <text class="timer-running">一人时光中...</text>
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
  if (lv >= 8) return '元气满满'; if (lv >= 6) return '状态平稳'; if (lv >= 4) return '需要充电'; if (lv >= 2) return '电量告急'; return '需要休息'
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

.page-header { margin-bottom: 32rpx; position: relative; z-index: 1; }
.page-title { display: block; font-family: var(--font-journal); font-size: var(--font-title); color: var(--ink); }
.page-subtitle { font-size: var(--font-body); color: var(--ink-md); margin-top: 4rpx; }

.section-label { display: block; font-size: 28rpx; font-weight: 600; color: var(--ink); margin-bottom: 16rpx; }
.mini-label { display: block; font-size: 24rpx; color: var(--ink-md); margin-bottom: 8rpx; }

.energy-section { margin-bottom: 40rpx; position: relative; z-index: 1; }
.energy-cards { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.energy-card {
  flex: 1;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 35%, rgba(45,35,24,0.012) 100%),
    var(--cream);
  border-radius: var(--radius-md); padding: 20rpx 24rpx; border: 2rpx solid var(--dot);
  box-shadow:
    0 1rpx 0 rgba(45,35,24,0.02),
    0 2rpx 8rpx rgba(45,35,24,0.03);
}
.energy-who { font-size: 26rpx; font-weight: 600; color: var(--ink); }
.energy-bar-wrap {
  height: 12rpx; background: var(--dot); border-radius: 6rpx; margin: 12rpx 0;
  box-shadow:
    inset 0 2rpx 4rpx rgba(45,35,24,0.06),
    inset 0 1rpx 0 rgba(45,35,24,0.03);
}
.energy-bar {
  height: 12rpx; border-radius: 6rpx; transition: width 0.5s var(--ease-soft); min-width: 10%;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(0,0,0,0.08) 100%),
    var(--bar-bg, var(--mint));
  box-shadow:
    inset 0 1rpx 0 rgba(255,255,255,0.2),
    0 1rpx 2rpx rgba(0,0,0,0.06);
}
.energy-text { font-size: 32rpx; font-weight: 700; color: var(--ink); }
.energy-reason { display: block; font-size: 22rpx; color: var(--ink-md); margin-top: 4rpx; }
.energy-adjust { display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.adjust-btn {
  font-size: 22rpx; padding: 8rpx 16rpx;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(45,35,24,0.02) 100%),
    var(--cream);
  border: 1rpx solid var(--dot); border-radius: 20rpx; color: var(--ink-md);
  box-shadow:
    0 1rpx 0 rgba(45,35,24,0.03),
    0 2rpx 4rpx rgba(45,35,24,0.02);
  transition: all .15s var(--ease-stamp);
}
.adjust-btn:active {
  transform: translateY(1rpx);
  box-shadow:
    0 0 0 rgba(45,35,24,0.03),
    0 1rpx 2rpx rgba(45,35,24,0.02);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(45,35,24,0.04) 100%),
    var(--cream);
}

.onetime-section { position: relative; z-index: 1; }
.time-compare { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.time-slot { flex: 1; text-align: center; padding: 20rpx; border-radius: var(--radius-md); }
.time-slot.amber {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(224,123,62,0.03) 100%),
    var(--amber-lt);
  box-shadow:
    0 1rpx 0 rgba(224,123,62,0.03),
    0 2rpx 8rpx rgba(224,123,62,0.04);
}
.time-slot.rose {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(212,128,104,0.03) 100%),
    var(--rose-lt);
  box-shadow:
    0 1rpx 0 rgba(212,128,104,0.03),
    0 2rpx 8rpx rgba(212,128,104,0.04);
}
.time-baby { display: block; font-size: 24rpx; color: var(--ink-md); }
.time-val { font-family: var(--font-journal); font-size: 44rpx; font-weight: 700; color: var(--ink); }
.time-vs { font-size: 24rpx; color: var(--ink-lt); font-weight: 600; }
.time-warning { text-align: center; padding: 12rpx; background: var(--gold-lt); border-radius: 12rpx; margin-bottom: 16rpx; font-size: 22rpx; color: var(--gold); }

.timer-label { display: block; font-size: 26rpx; color: var(--ink); font-weight: 600; margin-bottom: 12rpx; }
.timer-btns { display: flex; gap: 16rpx; }
.timer-btn {
  flex: 1; text-align: center; padding: 32rpx; border-radius: var(--radius-md); font-size: 28rpx; font-weight: 600;
  transition: all .15s var(--ease-stamp);
}
.timer-btn.amber {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(224,123,62,0.04) 100%),
    var(--amber-lt);
  color: var(--amber); border: 2rpx solid var(--amber);
  box-shadow:
    0 1rpx 0 rgba(224,123,62,0.06),
    0 3rpx 10rpx rgba(224,123,62,0.08),
    0 1rpx 0 rgba(255,255,255,0.3) inset;
}
.timer-btn.amber:active {
  transform: scale(.96) translateY(1rpx);
  box-shadow:
    0 1rpx 0 rgba(224,123,62,0.03),
    0 1rpx 3rpx rgba(224,123,62,0.06);
}
.timer-btn.rose {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 50%, rgba(212,128,104,0.04) 100%),
    var(--rose-lt);
  color: var(--rose); border: 2rpx solid var(--rose);
  box-shadow:
    0 1rpx 0 rgba(212,128,104,0.06),
    0 3rpx 10rpx rgba(212,128,104,0.08),
    0 1rpx 0 rgba(255,255,255,0.3) inset;
}
.timer-btn.rose:active {
  transform: scale(.96) translateY(1rpx);
  box-shadow:
    0 1rpx 0 rgba(212,128,104,0.03),
    0 1rpx 3rpx rgba(212,128,104,0.06);
}

.active-timer {
  text-align: center; padding: 32rpx;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 35%, rgba(45,35,24,0.012) 100%),
    var(--cream);
  border-radius: var(--radius-md); border: 2rpx solid var(--mint); margin-bottom: 16rpx;
  box-shadow:
    0 1rpx 0 rgba(92,154,110,0.03),
    0 2rpx 8rpx rgba(45,35,24,0.04),
    0 4rpx 20rpx rgba(92,154,110,0.06);
}
.timer-baby-name { display: block; font-size: 36rpx; font-weight: 700; color: var(--ink); }
.timer-elapsed { display: block; font-family: var(--font-journal); font-size: 56rpx; color: var(--ink); margin: 8rpx 0; letter-spacing: 3rpx; }
.timer-running { display: block; font-size: 24rpx; color: var(--mint); margin: 0 0 16rpx; }
.btn-end {
  width: 100%; padding: 20rpx 0;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 55%, rgba(0,0,0,0.05) 100%),
    var(--twin-danger);
  color: #FFF; border: none; border-radius: var(--radius-md); font-size: 28rpx;
  box-shadow:
    0 2rpx 0 #B85A5A,
    0 4rpx 12rpx rgba(212,112,107,0.2),
    0 1rpx 0 rgba(255,255,255,0.1) inset;
  transition: all .15s var(--ease-stamp);
}
.btn-end:active {
  transform: scale(.97) translateY(1rpx);
  box-shadow:
    0 1rpx 0 #B85A5A,
    0 1rpx 4rpx rgba(212,112,107,0.1);
}

.session-item { display: flex; justify-content: space-between; padding: 10rpx 0; font-size: 24rpx; }
.s-baby { font-weight: 600; }
.s-dur { color: var(--ink-md); }
</style>
