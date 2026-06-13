<template>
  <view class="guard-page">
    <view class="section-header">
      <text class="section-icon">🛡️</text>
      <text class="section-title">守护中心</text>
    </view>

    <!-- 电量表 -->
    <view class="energy-section">
      <text class="section-label">⚡ 电量表</text>
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
        <text class="adjust-label">手动调整：</text>
        <view v-for="n in 5" :key="n" class="adjust-btn" @click="setMom(n * 2)">👩{{ n * 2 }}</view>
        <text class="adjust-spacer">|</text>
        <view v-for="n in 5" :key="'d'+n" class="adjust-btn" @click="setDad(n * 2)">👨{{ n * 2 }}</view>
      </view>
    </view>

    <!-- 一人时光 -->
    <view class="onetime-section">
      <text class="section-label">⏳ 一人时光守护者</text>
      <text class="section-sub">确保每个宝宝都有专属的陪伴时间</text>

      <!-- 时间对比 -->
      <view class="time-compare" v-if="babiesStore.isTwinsComplete">
        <view class="time-slot blue">
          <text class="time-baby">{{ babiesStore.babyA?.nickname }}</text>
          <text class="time-val">{{ store.timeWithBaby(babiesStore.babyA?.id ?? '') }}min</text>
        </view>
        <view class="time-vs">VS</view>
        <view class="time-slot pink">
          <text class="time-baby">{{ babiesStore.babyB?.nickname }}</text>
          <text class="time-val">{{ store.timeWithBaby(babiesStore.babyB?.id ?? '') }}min</text>
        </view>
      </view>

      <!-- 差距警告 -->
      <view class="time-warning" v-if="store.timeGapWarning">
        <text>⚠️ {{ store.timeGapWarning.msg }}</text>
      </view>

      <!-- 快速计时 -->
      <view class="quick-timer" v-if="babiesStore.isTwinsComplete && !store.activeSession">
        <text class="timer-label">现在陪谁？</text>
        <view class="timer-btns">
          <view
            class="timer-btn blue"
            @click="startTime(babiesStore.babyA?.id ?? '', babiesStore.babyA?.nickname ?? '大宝', 'var(--twin-baby-a)')"
          >
            <text>👦 {{ babiesStore.babyA?.nickname }}</text>
          </view>
          <view
            class="timer-btn pink"
            @click="startTime(babiesStore.babyB?.id ?? '', babiesStore.babyB?.nickname ?? '二宝', 'var(--twin-baby-b)')"
          >
            <text>👧 {{ babiesStore.babyB?.nickname }}</text>
          </view>
        </view>
      </view>

      <!-- 计时中 -->
      <view class="active-timer" v-if="store.activeSession">
        <text class="timer-baby-name">{{ store.activeSession.babyName }}</text>
        <text class="timer-running">陪伴中...</text>
        <button class="btn-end" @click="endTime">结束陪伴</button>
      </view>

      <!-- 今日记录 -->
      <view class="today-sessions" v-if="store.sessions.length">
        <text class="mini-label">今日一人时光</text>
        <view v-for="s in store.sessions.slice().reverse().slice(0, 5)" :key="s.id" class="session-item">
          <text class="s-baby" :style="{ color: s.babyColor }">{{ s.babyName }}</text>
          <text class="s-dur">{{ s.durationMin }}分钟</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGuardianStore } from '@/stores/guardian'
import { useBabiesStore } from '@/stores/babies'

const store = useGuardianStore()
const babiesStore = useBabiesStore()

function energyColor(lv: number) {
  if (lv >= 7) return 'var(--twin-accent)'
  if (lv >= 4) return 'var(--twin-warning)'
  return 'var(--twin-baby-b)'
}
function energyLabel(lv: number) {
  if (lv >= 8) return '满电'
  if (lv >= 6) return '还行'
  if (lv >= 4) return '有点累'
  if (lv >= 2) return '很累了'
  return '快没电了'
}

function setMom(n: number) { store.setEnergy('mom', n, '手动设置') }
function setDad(n: number) { store.setEnergy('dad', n, '手动设置') }

function startTime(id: string, name: string, color: string) {
  store.startSession(id, name, color)
}
function endTime() {
  const s = store.endSession()
  if (s) uni.showToast({ title: `陪${s.babyName} ${s.durationMin}分钟 💚`, icon: 'success' })
  else uni.showToast({ title: '不足1分钟，未记录', icon: 'none' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '守护中心' })
  store.autoCalcEnergy('mom')
  store.autoCalcEnergy('dad')
})
</script>

<style scoped>
.guard-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 80rpx; }
.section-header { text-align: center; margin-bottom: 32rpx; }
.section-icon { font-size: 40px; }
.section-title { display: block; font-size: 44rpx; font-weight: 700; color: var(--twin-text); margin-top: 12rpx; }

.section-label { display: block; font-size: 28rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 16rpx; }
.section-sub { display: block; font-size: 24rpx; color: var(--twin-text-secondary); margin-bottom: 16rpx; margin-top: -12rpx; }

/* 电量表 */
.energy-section { margin-bottom: 40rpx; }
.energy-cards { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.energy-card {
  flex: 1; background: var(--twin-card-bg); border-radius: 16rpx; padding: 20rpx 24rpx;
}
.energy-who { font-size: 26rpx; font-weight: 600; color: var(--twin-text); }
.energy-bar-wrap {
  height: 12rpx; background: var(--twin-border); border-radius: 6rpx; margin: 12rpx 0;
}
.energy-bar { height: 12rpx; border-radius: 6rpx; transition: width 0.5s; min-width: 10%; }
.energy-text { font-size: 32rpx; font-weight: 700; color: var(--twin-text); }
.energy-reason { display: block; font-size: 22rpx; color: var(--twin-text-secondary); margin-top: 4rpx; }
.energy-adjust { display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.adjust-label { font-size: 22rpx; color: var(--twin-text-secondary); margin-right: 4rpx; }
.adjust-btn { font-size: 20rpx; padding: 6rpx 14rpx; background: var(--twin-card-bg); border-radius: 20rpx; color: var(--twin-text-tertiary); }
.adjust-spacer { color: var(--twin-border); }

/* 一人时光 */
.onetime-section { margin-bottom: 40rpx; }
.time-compare { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.time-slot {
  flex: 1; text-align: center; padding: 20rpx; background: var(--twin-card-bg); border-radius: 16rpx;
}
.time-slot.blue { border-top: 6rpx solid var(--twin-baby-a); }
.time-slot.pink { border-top: 6rpx solid var(--twin-baby-b); }
.time-baby { font-size: 24rpx; color: var(--twin-text-tertiary); }
.time-val { display: block; font-size: 44rpx; font-weight: 700; margin-top: 8rpx; }
.time-vs { font-size: 24rpx; color: var(--twin-text-muted); font-weight: 600; }
.time-warning {
  padding: 16rpx 20rpx; background: var(--twin-warning-light); border-radius: 12rpx;
  margin-bottom: 16rpx; font-size: 24rpx; color: var(--twin-warning);
}

.mini-label { display: block; font-size: 22rpx; color: var(--twin-text-secondary); margin: 16rpx 0 8rpx; }
.quick-timer { margin-bottom: 16rpx; }
.timer-label { display: block; font-size: 26rpx; color: var(--twin-text); margin-bottom: 12rpx; font-weight: 600; }
.timer-btns { display: flex; gap: 16rpx; }
.timer-btn {
  flex: 1; padding: 28rpx 0; text-align: center;
  border-radius: 20rpx; font-size: 28rpx; font-weight: 600;
}
.timer-btn.blue { background: var(--twin-baby-a-light); color: var(--twin-baby-a); }
.timer-btn.pink { background: var(--twin-baby-b-light); color: var(--twin-baby-b); }
.active-timer { text-align: center; padding: 32rpx; background: var(--twin-card-bg); border-radius: 20rpx; margin-bottom: 16rpx; }
.timer-baby-name { display: block; font-size: 36rpx; font-weight: 700; }
.timer-running { display: block; font-size: 24rpx; color: var(--twin-accent); margin: 8rpx 0 16rpx; }
.btn-end { width: 100%; padding: 20rpx 0; background: var(--twin-baby-b); color: var(--twin-card-bg); border: none; border-radius: 16rpx; font-size: 28rpx; }

.session-item { display: flex; justify-content: space-between; padding: 12rpx 16rpx; background: var(--twin-card-bg); border-radius: 10rpx; margin-bottom: 6rpx; }
.s-baby { font-size: 24rpx; font-weight: 600; }
.s-dur { font-size: 24rpx; color: var(--twin-text-tertiary); }
</style>
