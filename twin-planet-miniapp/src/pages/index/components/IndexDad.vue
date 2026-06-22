<!-- 爸爸模式 — 战术面板 -->
<template>
  <view class="page-shell dad-shell journal-paper page-enter">
    <view class="dad-header">
      <view class="masthead-left">
        <text class="date-line">{{ dateStr }}</text>
        <text class="dad-greeting">{{ greeting }} · {{ greetLine2 }}</text>
      </view>
      <view class="masthead-right">
        <view class="role-switch-btn" @click="switchRoleAction">
          <text>{{ roleEmoji }}</text>
        </view>
        <view class="streak-stamp journal-stamp stamp-gold" v-if="streakDays > 0"><text>连续 {{ streakDays }} 天</text></view>
      </view>
    </view>
    <view class="twins dad-twins">
      <view class="twin-card card-a journal-holes" @click="goRecord">
        <view class="card-surface">
          <view class="avatar-ring" :class="{ pulsing: isRunningA }">
            <image class="avatar-image" src="/static/avatars/baby-a-amber.png" mode="aspectFill" @error="handleImageError" />
            <text v-if="babyStatusIcon(babyA?.id, 0)" class="avatar-status iconfont" :class="babyStatusIcon(babyA?.id, 0)"></text>
          </view>
          <text class="twin-name">{{ babyA?.nickname || babyA?.name || '大宝' }}</text>
          <view class="twin-status-row">
            <text v-if="isRunningA" class="status-live">计时中</text>
            <text v-else-if="babyStatus(babyA)" :class="['status-recent', babyUrgency(babyA)==='urgent'?'status-urgent':babyUrgency(babyA)==='warn'?'status-warn':'']">{{ babyStatus(babyA) }}</text>
            <text v-else class="status-tap">轻触记录</text>
          </view>
        </view>
      </view>
      <view class="twin-card card-b journal-holes" @click="goRecord">
        <view class="card-surface">
          <view class="avatar-ring" :class="{ pulsing: isRunningB }">
            <image class="avatar-image" src="/static/avatars/baby-b-terracotta.png" mode="aspectFill" @error="handleImageError" />
            <text v-if="babyStatusIcon(babyB?.id, 1)" class="avatar-status iconfont" :class="babyStatusIcon(babyB?.id, 1)"></text>
          </view>
          <text class="twin-name">{{ babyB?.nickname || babyB?.name || '小宝' }}</text>
          <view class="twin-status-row">
            <text v-if="isRunningB" class="status-live">计时中</text>
            <text v-else-if="babyStatus(babyB)" :class="['status-recent', babyUrgency(babyB)==='urgent'?'status-urgent':babyUrgency(babyB)==='warn'?'status-warn':'']">{{ babyStatus(babyB) }}</text>
            <text v-else class="status-tap">轻触记录</text>
          </view>
        </view>
      </view>
    </view>
    <view class="dad-snapshot" v-if="todaySummary"><text class="ds-text">{{ todaySummary }}</text></view>
    <view class="dad-actions">
      <button class="dad-duty-btn" @click="goDuty"><text class="dd-icon iconfont icon-clipboard"></text><text class="dd-label">值班清单</text></button>
    </view>
    <view class="quick-bar" v-if="babyA && babyB">
      <view class="q-chip q-primary" @click="dualRecord('feeding')"><text class="iconfont icon-bottle icon-sm"></text> 都喂了</view>
      <view class="q-chip" @click="dualRecord('sleep')"><text class="iconfont icon-sleep icon-sm"></text> 都睡了</view>
      <view class="q-chip" @click="dualRecord('diaper')"><text class="iconfont icon-diaper icon-sm"></text> 都换了</view>
    </view>
    <view class="dad-footer">
      <text class="ft-link" @click="goSnapshot">📸 查看快照</text>
      <text class="ft-dot">·</text>
      <text class="ft-link" @click="goGrowth"><text class="iconfont icon-chart icon-sm"></text> 生长曲线</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import { useBabyStatus } from '@/composables/useBabyStatus'

const emit = defineEmits<{ navigate: [url: string] }>()
const userStore = useUserStore()
const babiesStore = useBabiesStore()
const recordsStore = useRecordsStore()

const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)
const isRunningA = computed(() => babyA.value ? recordsStore.isBabyRunning(babyA.value.id) : false)
const isRunningB = computed(() => babyB.value ? recordsStore.isBabyRunning(babyB.value.id) : false)

const roleEmoji = computed(() => userStore.roleEmoji)
function switchRoleAction() {
  uni.showActionSheet({
    itemList: ['👩 妈妈', '👨 爸爸', '👵 奶奶', '👴 爷爷', '👩‍🍼 育儿嫂'],
    success: (res) => {
      const roles = ['mom', 'dad', 'grandma', 'grandpa', 'nanny']
      const r = roles[res.tapIndex]
      if (r) userStore.setRole(r as any)
    },
  })
}

const nowTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { tickTimer = setInterval(() => { nowTick.value = Date.now() }, 30000) })
onUnmounted(() => { if (tickTimer) clearInterval(tickTimer) })

const dateStr = computed(() => {
  const d = new Date(); const days = ['日','一','二','三','四','五','六']
  return `${d.getMonth()+1}月${d.getDate()}日 星期${days[d.getDay()]}`
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h<6) return '凌晨好'; if (h<9) return '早上好'; if (h<12) return '上午好'
  if (h<14) return '中午好'; if (h<18) return '下午好'; if (h<22) return '晚上好'
  return '夜深了'
})

const greetLine2 = computed(() => {
  const h = new Date().getHours()
  if (h>=22||h<6) return '值班中，撑住 💪'
  if (h<9) return '早上好，今天你是超级奶爸'
  return '数据看板已就绪 📊'
})

function babyStatus(b: any): string {
  if (!b) return ''
  const logs = recordsStore.recentLogsByBaby[b.id]
  if (!logs?.length) return ''
  const last = logs[logs.length - 1]
  const m = Math.floor((nowTick.value - last.createdAt) / 60000)
  const a = last.type === 'feeding' ? '喂奶' : last.type === 'sleep' ? '睡觉' : '记录'
  if (m < 1) return `刚刚${a}`
  if (m < 60) return `${m}分钟前${a}`
  const hr = Math.floor(m / 60); const min = m % 60
  return `距上次${a} ${hr}小时${min}分`
}

function babyUrgency(b: any): string {
  if (!b) return ''
  const logs = recordsStore.recentLogsByBaby[b.id]
  if (!logs?.length) return ''
  const last = logs[logs.length - 1]
  if (last.type !== 'feeding') return ''
  const h = (nowTick.value - last.createdAt) / 3600000
  if (h > 4) return 'urgent'; if (h > 3) return 'warn'; return ''
}

const { babyStatusIcon, handleImageError } = useBabyStatus()

const todaySummary = computed(() => {
  const today = recordsStore.logs.filter(l => l.createdAt >= new Date().setHours(0,0,0,0))
  if (!today.length) return ''
  const feeds = today.filter(l => l.type === 'feeding').length
  const sleeps = today.filter(l => l.type === 'sleep').length
  const diapers = today.filter(l => l.type === 'diaper').length
  const parts: string[] = []
  if (feeds) parts.push(`${feeds}次喂奶`)
  if (sleeps) parts.push(`${sleeps}次睡眠`)
  if (diapers) parts.push(`${diapers}次换尿布`)
  return parts.length ? `今天 ${parts.join(' · ')}` : ''
})

function dualRecord(t: 'feeding' | 'sleep' | 'diaper') {
  if (babyA.value) recordsStore.quickLog(babyA.value.id, t)
  if (babyB.value) recordsStore.quickLog(babyB.value.id, t)
  uni.showToast({ title: t === 'feeding' ? '都喂了' : t === 'sleep' ? '都睡了' : '都换了', icon: 'success', duration: 800 })
}

const goRecord = () => emit('navigate', '/pages/record/index')
const goGrowth = () => emit('navigate', '/pages/growth/index')
const goSnapshot = () => emit('navigate', '/pages/snapshot/index')
const goDuty = () => emit('navigate', '/pages/duty/index')
</script>

<style scoped>
.dad-shell{padding:32rpx 28rpx calc(64rpx + env(safe-area-inset-bottom))}
.dad-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28rpx}
.masthead-left{display:flex;flex-direction:column;gap:8rpx}
.date-line{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md);letter-spacing:2rpx}
.dad-greeting{display:block;font-family:var(--font-journal);font-size:36rpx;color:var(--ink);font-weight:700;margin-top:4rpx}
.masthead-right{display:flex;align-items:flex-end}
.streak-stamp{background:var(--gold-lt);padding:6rpx 14rpx;border-radius:4rpx 12rpx 4rpx 12rpx;font-family:var(--font-journal);font-size:20rpx;color:var(--gold);font-weight:700;transform:rotate(2deg);box-shadow:0 2rpx 6rpx rgba(200,153,62,0.1);animation:stampDown .5s var(--ease-stamp) both}
.role-switch-btn{display:flex;align-items:center;justify-content:center;width:52rpx;height:52rpx;border-radius:50%;background:var(--cream);border:1.5px solid var(--dot);font-size:24rpx;margin-right:12rpx}
.role-switch-btn:active{background:var(--amber-lt)}
.dad-twins{margin-bottom:16rpx}
.dad-twins .card-surface{border-radius:20rpx;transform:none!important}
.dad-twins .twin-card.card-b{margin-left:0;margin-top:0}
.twins{display:flex;align-items:flex-start}
.twin-card{position:relative;flex:1}
.twin-card:active{transform:scale(.96);transition:transform .2s var(--ease-bounce)}
.card-surface{padding:28rpx 20rpx 22rpx;border-radius:20rpx;background:linear-gradient(175deg,var(--amber-lt),rgba(224,123,62,0.03));border:1.5px solid rgba(224,123,62,0.1);box-shadow:0 2rpx 12rpx rgba(45,35,24,0.04)}
.twin-card.card-b .card-surface{background:linear-gradient(185deg,var(--rose-lt),rgba(192,133,82,0.03));border-color:rgba(192,133,82,0.1)}
.avatar-ring{width:88rpx;height:88rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12rpx;background:var(--amber-md);position:relative;overflow:hidden}
.twin-card.card-b .avatar-ring{background:var(--rose-md)}
.avatar-ring.pulsing::before{content:'';position:absolute;top:-6rpx;right:-6rpx;bottom:-6rpx;left:-6rpx;border-radius:50%;border:2rpx solid var(--mint);opacity:.45;animation:ringPulse 2.5s ease-in-out infinite}

.avatar-image{width:84rpx;height:84rpx;border-radius:50%;object-fit:cover}
.avatar-status{position:absolute;bottom:2rpx;right:2rpx;width:32rpx;height:32rpx;border-radius:50%;background:var(--paper);border:2rpx solid var(--cream);font-size:20rpx;display:flex;align-items:center;justify-content:center;z-index:2;box-shadow:0 1rpx 4rpx rgba(0,0,0,0.1)}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.1);opacity:.8}}
.avatar-emoji{font-size:44rpx}
.twin-name{font-family:var(--font-journal);font-size:30rpx;font-weight:700;color:var(--ink);text-align:center;display:block;margin-bottom:4rpx}
.twin-status-row{text-align:center}
.status-live{font-size:22rpx;color:var(--mint);font-weight:600}
.status-recent{font-size:22rpx;color:var(--ink-md)}
.status-warn{color:var(--gold)!important;font-weight:600}
.status-urgent{color:var(--twin-danger)!important;font-weight:700}
.status-tap{font-size:22rpx;color:var(--ink-lt)}
.dad-snapshot{text-align:center;margin-bottom:20rpx;padding:16rpx;background:linear-gradient(180deg,rgba(255,255,255,0.3) 0%,transparent 50%,rgba(0,0,0,0.02) 100%),var(--cream);border-radius:var(--radius-sm);border:1.5px solid var(--dot);box-shadow:0 1rpx 0 rgba(0,0,0,0.03),0 2rpx 6rpx rgba(0,0,0,0.03)}
.ds-text{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md)}
.dad-actions{display:flex;justify-content:center;margin-bottom:20rpx}
.dad-duty-btn{display:flex;align-items:center;gap:16rpx;padding:28rpx 64rpx;background:linear-gradient(180deg,rgba(255,255,255,0.16) 0%,transparent 50%,rgba(0,0,0,0.05) 100%),var(--amber);border:none;border-radius:20rpx;color:#FFF;font-family:var(--font-journal);box-shadow:inset 0 1rpx 0 rgba(255,255,255,0.2),0 3rpx 0 rgba(192,104,52,0.5),0 4rpx 8rpx rgba(0,0,0,0.06),0 8rpx 24rpx rgba(224,123,62,0.2);transition:all .15s var(--ease-stamp)}
.dad-duty-btn::after{border:none}
.dad-duty-btn:active{transform:scale(.94);box-shadow:inset 0 2rpx 4rpx rgba(0,0,0,0.1),0 1rpx 0 rgba(192,104,52,0.4)}
.dd-icon{font-size:48rpx}
.dd-label{font-size:36rpx;font-weight:700;letter-spacing:2rpx}
.quick-bar{display:flex;gap:12rpx;justify-content:center;margin-bottom:20rpx}
.q-chip{padding:16rpx 24rpx;border-radius:var(--radius-md);font-size:24rpx;font-weight:600;background:linear-gradient(180deg,rgba(255,255,255,0.5) 0%,transparent 40%,rgba(0,0,0,0.02) 100%),var(--cream);border:1.5px solid var(--dot);color:var(--ink-md);box-shadow:0 1.5rpx 0 rgba(0,0,0,0.03),0 2rpx 4rpx rgba(0,0,0,0.02);transition:all .15s var(--ease-stamp)}
.q-chip:active{transform:scale(.9);background:var(--amber-lt);border-color:var(--amber);color:var(--amber);box-shadow:inset 0 1rpx 3rpx rgba(0,0,0,0.05)}
.q-chip.q-primary{padding:18rpx 32rpx;font-size:26rpx;background:linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 55%,rgba(0,0,0,0.03) 100%),var(--amber-lt);border-color:var(--amber);color:var(--amber);box-shadow:0 2rpx 0 rgba(224,123,62,0.2),0 3rpx 6rpx rgba(224,123,62,0.1)}
.q-chip.q-primary:active{box-shadow:inset 0 1rpx 3rpx rgba(224,123,62,0.1)}
.dad-footer{display:flex;justify-content:center;gap:16rpx;margin-top:28rpx}
.ft-link{font-size:20rpx;color:var(--ink-lt)}.ft-link:active{color:var(--amber)}.ft-dot{font-size:20rpx;color:var(--ink-lt)}
</style>
