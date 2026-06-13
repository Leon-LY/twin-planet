<!-- 双宝手帐 · 首页 -->
<template>
  <view :class="[themeClass, { 'font-large': isGrandma }]">
    <template v-if="loading">
      <view class="page-shell"><TwinSkeleton type="brand" /><TwinSkeleton type="twins" /></view>
    </template>

    <template v-else-if="isGrandma">
      <view class="page-shell granny-shell">
        <text class="heading-xl" style="text-align:center;display:block;margin-bottom:8rpx">并蒂星球</text>
        <text class="body-text" style="text-align:center;display:block;margin-bottom:64rpx">{{ greeting }}</text>
        <view class="granny-actions">
          <view class="granny-btn" @click="goRecord"><text class="granny-emoji">✋</text><text class="granny-label">记一笔</text></view>
          <view class="granny-btn" @click="goGrowth"><text class="granny-emoji">🌱</text><text class="granny-label">看看长多大了</text></view>
          <view class="granny-btn granny-help" @click="goHelp"><text class="granny-emoji">📞</text><text class="granny-label">问家里人</text></view>
        </view>
      </view>
    </template>

    <template v-else-if="!loading">
      <view class="page-shell journal">

        <!-- 页眉 -->
        <view class="j-header">
          <text class="j-date">{{ dateStr }}</text>
          <view class="j-badge" v-if="streakDays > 0">
            <text>✦ 连续 {{ streakDays }} 天</text>
          </view>
        </view>

        <!-- 问候 -->
        <view class="greeting-zone">
          <text class="greeting-main">{{ greeting }}</text>
          <text class="greeting-sub">今天的两个小怪兽</text>
          <text class="greeting-mood">{{ moodEmoji }}</text>
        </view>

        <!-- 双宝贴纸 -->
        <view class="sticker-row">
          <view class="sticker-card card-amber" :class="{ selected: selectedBaby === 'a', running: isRunningA }" @click="selectedBaby = 'a'">
            <view class="sticker-tear" />
            <view class="sticker-face face-a">
              <text class="face-emoji">{{ isRunningA ? '😋' : '😊' }}</text>
            </view>
            <text class="sticker-name">{{ babyA?.nickname || babyA?.name || '大宝' }}</text>
            <view class="sticker-status">
              <text v-if="isRunningA" class="tag running">● 计时中</text>
              <text v-else-if="babyStatus(babyA)" class="tag idle">{{ babyStatus(babyA) }}</text>
              <text v-else class="tag idle">轻触记录</text>
            </view>
          </view>

          <view class="sticker-card card-rose" :class="{ selected: selectedBaby === 'b', running: isRunningB }" @click="selectedBaby = 'b'">
            <view class="sticker-tear" />
            <view class="sticker-face face-b">
              <text class="face-emoji">{{ isRunningB ? '😴' : '😊' }}</text>
            </view>
            <text class="sticker-name">{{ babyB?.nickname || babyB?.name || '二宝' }}</text>
            <view class="sticker-status">
              <text v-if="isRunningB" class="tag running">● 计时中</text>
              <text v-else-if="babyStatus(babyB)" class="tag idle">{{ babyStatus(babyB) }}</text>
              <text v-else class="tag idle">轻触记录</text>
            </view>
          </view>
        </view>

        <!-- 连接 -->
        <view class="connect-row">
          <view class="connect-dots">
            <view class="c-dot" v-for="i in 5" :key="i" :style="{ animationDelay: (i*0.12) + 's' }" />
          </view>
          <text class="connect-heart">💛</text>
          <view class="connect-dots">
            <view class="c-dot" v-for="i in 5" :key="i+10" :style="{ animationDelay: (i*0.12) + 's' }" />
          </view>
        </view>

        <!-- 中央玩具按钮 -->
        <view class="toy-zone">
          <button class="toy-btn" @click="goRecord">
            <text class="toy-icon">✋</text>
            <text class="toy-label">记 一 笔</text>
          </button>
        </view>

        <!-- 快捷 -->
        <view class="quick-row" v-if="babyA && babyB">
          <view class="quick-chip" @click="dualRecord('feeding')"><text>🍼 都喂了</text></view>
          <view class="quick-chip" @click="dualRecord('sleep')"><text>😴 都睡了</text></view>
          <view class="quick-chip" @click="dualRecord('diaper')"><text>🧷 都换了</text></view>
        </view>

        <!-- 彩蛋 -->
        <text class="easter-egg" v-if="streakDays > 0">1+1=11 · 端水失败的第 {{ streakDays }} 天</text>

        <!-- 底部 -->
        <view class="bottom-row">
          <text class="b-item now" @click="goRecord">记录</text>
          <text class="b-item" @click="goGrowth">生长</text>
          <text class="b-item" @click="goSnapshot">快照</text>
          <text class="b-item" @click="goMore">发现</text>
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

const loading = ref(true); const userStore = useUserStore()
const themeClass = computed(() => {
  const c = ['page-root']; const h = new Date().getHours()
  if (h >= 22 || h < 6) c.push('theme-dark')
  if (userStore.isGrandmaMode) c.push('font-large')
  return c.join(' ')
})
onMounted(() => { setTimeout(() => { loading.value = false }, 400) })

const babiesStore = useBabiesStore(); const recordsStore = useRecordsStore()
const isGrandma = computed(() => userStore.isGrandmaMode)
const babyA = computed(() => babiesStore.babyA); const babyB = computed(() => babiesStore.babyB)
const streakDays = computed(() => recordsStore.streakDays)
const selectedBaby = ref('a')
const isRunningA = computed(() => babyA.value ? recordsStore.isBabyRunning(babyA.value.id) : false)
const isRunningB = computed(() => babyB.value ? recordsStore.isBabyRunning(babyB.value.id) : false)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'; if (h < 9) return '早上好'; if (h < 12) return '上午好'
  if (h < 14) return '中午好'; if (h < 18) return '下午好'; if (h < 22) return '晚上好'
  return '夜深了'
})
const moodEmoji = computed(() => {
  const h = new Date().getHours()
  if (h >= 2 && h < 6) return '😵'; if (h >= 22 || h < 2) return '🌙'
  return '👾'
})
const dateStr = computed(() => {
  const d = new Date(); const days = ['日','一','二','三','四','五','六']
  return `${d.getMonth()+1}月${d.getDate()}日 · 星期${days[d.getDay()]}`
})

function babyStatus(b: any): string {
  if (!b) return ''; const logs = recordsStore.recentLogsByBaby[b.id]
  if (!logs?.length) return ''; const last = logs[logs.length-1]
  const m = Math.floor((Date.now()-last.createdAt)/60000)
  const a = last.type==='feeding'?'喂奶':last.type==='sleep'?'睡觉':'记录'
  if (m<1) return `刚刚${a}`; if (m<60) return `${m}分钟前${a}`
  return `${Math.floor(m/60)}小时前${a}`
}

function dualRecord(t: 'feeding'|'sleep'|'diaper') {
  if (babyA.value) recordsStore.quickLog(babyA.value.id,t)
  if (babyB.value) recordsStore.quickLog(babyB.value.id,t)
  uni.showToast({ title: t==='feeding'?'都喂了 ✦':t==='sleep'?'都睡了 ✦':'都换了 ✦', icon:'success' })
}

const navigate = (url:string) => uni.navigateTo({url})
const goRecord = () => navigate('/pages/record/index')
const goGrowth = () => navigate('/pages/growth/index')
const goSnapshot = () => navigate('/pages/snapshot/index')
const goMore = () => uni.showActionSheet({
  itemList: ['萌芽日记','星尘日志','指挥官控制台','星光监测站','星际通讯','轨道决策','星座日志'],
  success: (res) => uni.navigateTo({ url: ['/pages/sprout/index','/pages/contribution/index','/pages/duty/index','/pages/guardian/index','/pages/handover/index','/pages/school/index','/pages/milestones/index'][res.tapIndex] })
})
const goHelp = () => uni.showModal({ title:'需要帮忙？', content:'打电话给家里人，或者打开记录页点最大的按钮就行。', confirmText:'我知道了', showCancel:false })
</script>

<style scoped>
.journal { padding-top: 44rpx; }

/* 页眉 */
.j-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24rpx; padding-bottom:16rpx; border-bottom:1.5px dashed var(--dot-line); }
.j-date { font-family:var(--font-journal); font-size:var(--font-caption); color:var(--ink-md); }
.j-badge { background:var(--gold-lt); padding:6rpx 16rpx; border-radius:16rpx; font-size:var(--font-caption); color:var(--gold); font-weight:700; }

/* 问候 */
.greeting-zone { margin-bottom:32rpx; }
.greeting-main { font-family:var(--font-journal); font-size:var(--font-hero); color:var(--ink); font-weight:400; display:block; letter-spacing:-0.5px; }
.greeting-sub { font-size:var(--font-body); color:var(--ink-md); margin-top:4rpx; display:block; }
.greeting-mood { font-size:36rpx; margin-top:8rpx; display:block; animation: moodFloat 2s ease-in-out infinite; }
@keyframes moodFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5rpx)} }

/* 贴纸卡片 */
.sticker-row { display:flex; gap:var(--space-sm); margin-bottom:20rpx; }
.sticker-card { flex:1; background:var(--paper-warm); border-radius:var(--radius-lg); padding:24rpx 16rpx 20rpx; position:relative; box-shadow:var(--twin-shadow-sm); border:2rpx solid transparent; transition:transform var(--dur-fast) var(--ease-bounce),border-color var(--dur-fast); }
.sticker-card:active { transform:scale(0.96); }
.sticker-card.selected { border-color:var(--amber); }
.sticker-card.card-amber { background:var(--amber-lt); }
.sticker-card.card-rose { background:var(--rose-lt); }

/* 撕边 */
.sticker-tear { position:absolute; top:0; left:20rpx; right:20rpx; height:4rpx; background:repeating-linear-gradient(90deg,transparent,transparent 4rpx,var(--paper) 4rpx,var(--paper) 6rpx); opacity:0.5; }

.sticker-face { width:64rpx;height:64rpx;border-radius:50%; display:flex;align-items:center;justify-content:center; margin-bottom:14rpx; transition:transform var(--dur-normal) var(--ease-bounce); }
.sticker-card:active .sticker-face { transform:scale(1.2); }
.face-a { background:var(--amber-lt); }
.face-b { background:var(--rose-lt); }
.face-emoji { font-size:36rpx; }
.sticker-card.running .face-emoji { animation: faceWiggle 0.6s ease-in-out infinite; }
@keyframes faceWiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }

.sticker-name { font-family:var(--font-journal); font-size:var(--font-card); font-weight:700; color:var(--ink); display:block; margin-bottom:4rpx; }
.sticker-status { font-size:var(--font-caption); color:var(--ink-md); }
.tag { display:inline; }
.tag.running { color:var(--mint); font-weight:600; }

/* 连接 */
.connect-row { display:flex; align-items:center; justify-content:center; margin-bottom:36rpx; }
.connect-dots { display:flex; gap:8rpx; }
.c-dot { width:5rpx;height:5rpx;border-radius:50%;background:var(--dot-line); animation:connPulse 1.2s ease-in-out infinite; }
@keyframes connPulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.8);background:var(--amber)} }
.connect-heart { margin:0 16rpx;font-size:24rpx; animation:heartBeat 1s ease-in-out infinite; }
@keyframes heartBeat { 0%,100%{transform:scale(1)} 15%{transform:scale(1.3)} 30%{transform:scale(1)} }

/* 玩具按钮 */
.toy-zone { flex:1; display:flex; align-items:center; justify-content:center; margin-bottom:20rpx; }
.toy-btn {
  width:320rpx;height:320rpx;border-radius:50%; background:var(--amber); border:none;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8rpx;
  box-shadow:0 16rpx 48rpx rgba(232,130,74,0.25),0 6rpx 12rpx rgba(232,130,74,0.12);
  transition:transform var(--dur-fast) var(--ease-bounce),box-shadow var(--dur-fast);
  transform:rotate(-2deg);
}
.toy-btn:active { transform:rotate(-2deg) scale(0.9); box-shadow:0 4rpx 12rpx rgba(232,130,74,0.15); }
.toy-icon { font-size:60rpx; }
.toy-label { font-family:var(--font-journal); font-size:var(--font-card); color:#FFF; font-weight:700; letter-spacing:4rpx; }

/* 快捷 */
.quick-row { display:flex; gap:var(--space-sm); justify-content:center; margin-bottom:24rpx; }
.quick-chip { padding:16rpx 24rpx; border-radius:var(--radius-full); font-size:var(--font-caption); font-weight:600; background:var(--paper-warm); border:1.5px solid var(--dot-line); color:var(--ink-md); transition:transform var(--dur-fast) var(--ease-bounce); }
.quick-chip:active { transform:scale(0.9); background:var(--amber-lt); border-color:var(--amber); }

/* 彩蛋 */
.easter-egg { text-align:center; font-size:20rpx; color:var(--ink-lt); font-style:italic; margin-bottom:16rpx; }

/* 底部 */
.bottom-row { display:flex; justify-content:center; gap:48rpx; padding-top:20rpx; border-top:1px solid var(--dot-line); }
.b-item { font-family:var(--font-journal); font-size:var(--font-body); color:var(--ink-lt); letter-spacing:2rpx; }
.b-item.now { color:var(--amber); font-weight:700; }

/* 奶奶模式 */
.granny-shell { display:flex; flex-direction:column; justify-content:center; min-height:100vh; padding:80rpx 48rpx !important; }
.granny-actions { display:flex; flex-direction:column; gap:var(--space-md); }
.granny-btn { text-align:center; padding:56rpx; background:var(--paper-warm); border-radius:var(--radius-lg); border:4rpx solid var(--dot-line); display:flex; flex-direction:column; align-items:center; gap:var(--space-sm); }
.granny-btn:active { border-color:var(--amber); transform:scale(0.97); }
.granny-help { border-color:var(--gold); }
.granny-emoji { font-size:72rpx; }
.granny-label { font-size:48rpx; font-weight:700; color:var(--ink); }
</style>
