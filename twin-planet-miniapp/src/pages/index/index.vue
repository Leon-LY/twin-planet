<!-- 双宝记 v5 · Editorial Journal -->
<template>
  <view :class="[themeClass, { 'font-large': isGrandma }]">
    <template v-if="loading">
      <view class="page-shell"><TwinSkeleton type="brand" /><TwinSkeleton type="twins" /></view>
    </template>

    <template v-else-if="isGrandma">
      <view class="page-shell granny-shell">
        <text class="heading-xl" style="text-align:center;display:block;margin-bottom:8rpx">双宝记</text>
        <text class="body-text" style="text-align:center;display:block;margin-bottom:64rpx">{{ greeting }}</text>
        <view class="granny-actions">
          <view class="granny-btn" @click="goRecord"><text class="granny-emoji">✋</text><text class="granny-label">记一笔</text></view>
          <view class="granny-btn" @click="goGrowth"><text class="granny-emoji">🌱</text><text class="granny-label">看看长多大了</text></view>
          <view class="granny-btn granny-help" @click="goHelp"><text class="granny-emoji">📞</text><text class="granny-label">问家里人</text></view>
        </view>
        <text class="last-update" v-if="lastUpdateText">最后更新 {{ lastUpdateText }}</text>
      </view>
    </template>

    <template v-else-if="!loading">
      <view class="page-shell journal">
        <!-- 暖色光斑 — 不对称位置 -->
        <view class="bg-spot spot-a" />
        <view class="bg-spot spot-b" />

        <!-- 页眉 — journal masthead -->
        <view class="masthead reveal-1">
          <view class="masthead-left">
            <text class="date-line">{{ dateStr }}</text>
            <view class="role-note" @click="switchRole">
              <text>{{ roleEmoji }} {{ roleLabel }}</text>
              <text v-if="alertCount" class="alert-badge">{{ alertCount }}</text>
            </view>
          </view>
          <view class="masthead-right">
            <view class="streak-stamp" v-if="streakDays > 0">
              <text>连续 {{ streakDays }} 天</text>
            </view>
            <text class="streak-start" v-else>今天开始</text>
          </view>
        </view>

        <!-- 品牌吉祥物 -->
        <view class="mascot-area reveal-2" v-if="userStore.roleConfig.homeLayout==='full'">
          <TwinMascot size="sm" :linked="true" />
        </view>

        <!-- 问候 — editorial, left-aligned, dramatic scale -->
        <view class="greeting reveal-2">
          <text class="greet-line1">{{ greeting }}</text>
          <text class="greet-line2">{{ greetLine2 }}</text>
          <text class="greet-sub">{{ insightText }}</text>
        </view>

        <!-- 🆕 新手引导 — 首次使用教学 -->
        <view class="welcome-guide reveal-2" v-if="showWelcome && userStore.roleConfig.homeLayout==='full'">
          <view class="welcome-card">
            <view class="welcome-top">
              <text class="welcome-wave">👋</text>
              <view class="welcome-text">
                <text class="welcome-title">欢迎来到双宝手帐</text>
                <text class="welcome-desc">一本可以玩的成长记录本，从今天开始吧</text>
              </view>
              <view class="welcome-close" @click="dismissWelcome"><text>✕</text></view>
            </view>
            <view class="welcome-steps">
              <view class="w-step">
                <text class="ws-num">1</text>
                <text class="ws-text">点击下方大按钮<br><text class="ws-hl">记录喂奶/睡觉</text></text>
              </view>
              <view class="ws-arrow">→</view>
              <view class="w-step">
                <text class="ws-num">2</text>
                <text class="ws-text">每天记录<br><text class="ws-hl">收集贴纸</text></text>
              </view>
              <view class="ws-arrow">→</view>
              <view class="w-step">
                <text class="ws-num">3</text>
                <text class="ws-text">7天后生成<br><text class="ws-hl">第一张双宝卡</text></text>
              </view>
            </view>
          </view>
        </view>

        <!-- 双宝卡片 — asymmetric, hand-rotated, overlapping -->
        <view class="twins reveal-3">
          <view class="twin-card card-a" :class="{ 'has-timer': isRunningA }" @click="goRecord">
            <view class="card-surface">
              <view class="avatar-ring" :class="{ pulsing: isRunningA }">
                <text class="avatar-emoji">{{ isRunningA ? '😋' : '😛' }}</text>
              </view>
              <text class="twin-name">{{ babyA?.nickname || babyA?.name || '大宝' }}</text>
              <view class="twin-status-row">
                <text v-if="isRunningA" class="status-live">计时中</text>
                <text v-else-if="babyStatus(babyA)" class="status-recent">{{ babyStatus(babyA) }}</text>
                <text v-else class="status-tap">轻触记录</text>
              </view>
            </view>
          </view>

          <view class="twin-card card-b" :class="{ 'has-timer': isRunningB }" @click="goRecord">
            <view class="card-surface">
              <view class="avatar-ring" :class="{ pulsing: isRunningB }">
                <text class="avatar-emoji">{{ isRunningB ? '😴' : '😪' }}</text>
              </view>
              <text class="twin-name">{{ babyB?.nickname || babyB?.name || '二宝' }}</text>
              <view class="twin-status-row">
                <text v-if="isRunningB" class="status-live">计时中</text>
                <text v-else-if="babyStatus(babyB)" class="status-recent">{{ babyStatus(babyB) }}</text>
                <text v-else class="status-tap">轻触记录</text>
              </view>
            </view>
          </view>
        </view>

        <!-- LightBridge connection -->
        <view class="bridge-wrap reveal-4">
          <LightBridge :state="bridgeState" :height="36" :animated="true" />
        </view>

        <!-- 贴纸条 — only for full layout (mom) -->
        <view class="sticker-zone reveal-4" v-if="userStore.roleConfig.homeLayout==='full'">
          <StickerStrip :stickers="stickersStore.todayStickers" :showMore="true" @viewAll="navigate('/pages/stickers/index')" />
        </view>

        <!-- 今日摘要 -->
        <view class="summary-line reveal-4" v-if="todaySummary && userStore.roleConfig.homeLayout==='full'">
          <text>{{ todaySummary }}</text>
        </view>

        <!-- 一切都好 -->
        <view class="all-good reveal-4" v-if="allGood && userStore.roleConfig.homeLayout==='full'">
          <text>🟢 两个小家伙今天都很好</text>
        </view>

        <!-- 快速参考：上次喂奶/睡觉 -->
        <view class="quick-ref reveal-4" v-if="quickRef.lastFeeding!=='—' || quickRef.activeTimer">
          <view class="qr-item" v-if="quickRef.activeTimer">
            <text class="qr-emoji">⏱️</text>
            <text class="qr-text">{{ quickRef.activeTimer }}</text>
          </view>
          <view class="qr-item" v-if="quickRef.lastFeeding!=='—'">
            <text class="qr-emoji">🍼</text>
            <text class="qr-text">上次喂奶 {{ quickRef.lastFeeding }}</text>
          </view>
          <view class="qr-item" v-if="quickRef.lastSleep!=='—'">
            <text class="qr-emoji">😴</text>
            <text class="qr-text">上次睡觉 {{ quickRef.lastSleep }}</text>
          </view>
        </view>

        <!-- 中央按钮 -->
        <view class="action-center reveal-5">
          <view class="btn-stage">
            <view class="orbit-ring" :class="{ pulsing: recordsStore.isRunning }" />
            <button class="main-btn" @click="goRecord">
              <text class="btn-icon">✋</text>
              <text class="btn-text">记一笔</text>
            </button>
          </view>
        </view>

        <!-- 快捷操作 — asymmetric sizes -->
        <view class="quick-bar reveal-6" v-if="babyA && babyB && userStore.roleConfig.homeLayout!=='compact'">
          <view class="q-chip q-primary" @click="dualRecord('feeding')">🍼 都喂了</view>
          <view class="q-chip" @click="dualRecord('sleep')">😴 都睡了</view>
          <view class="q-chip" @click="dualRecord('diaper')">🧷</view>
        </view>

        <!-- 爸爸模式：值班进度卡 -->
        <view class="duty-card reveal-6" v-if="userStore.roleConfig.homeLayout==='compact' && babyA && babyB">
          <view class="q-chip q-primary" @click="dualRecord('feeding')">🍼 都喂了</view>
          <view class="q-chip" @click="dualRecord('sleep')">😴 都睡了</view>
          <view class="q-chip" @click="dualRecord('diaper')">🧷 都换了</view>
        </view>

        <!-- 预测 -->
        <view class="forecast-line reveal-6" v-if="tomorrowForecast && streakDays >= 3">
          <text>🔮 {{ tomorrowForecast }}</text>
        </view>

        <!-- 底部工具行 -->
        <view class="footer-tools reveal-6" v-if="userStore.roleConfig.homeLayout==='full'">
          <button class="ft-invite" open-type="share">
            <text>👨‍👩‍👧‍👦 邀请另一半一起记录</text>
          </button>
          <view class="ft-row">
            <text class="ft-link" @click="goExport">📤 导出备份</text>
            <text class="ft-dot">·</text>
            <text class="ft-link" @click="navigate('/pages/privacy/index')">隐私政策</text>
          </view>
        </view>

        <!-- 免责声明 -->
        <text class="disclaimer-note reveal-6" v-if="userStore.roleConfig.homeLayout==='full'">本应用不提供医疗建议，所有数据仅供参考</text>

        <!-- 邀请接受弹窗 -->
        <view class="celebrate-overlay" v-if="showInvitePrompt" @click="showInvitePrompt=false">
          <view class="celebrate-card" @click.stop>
            <text class="celebrate-emoji">👨‍👩‍👧‍👦</text>
            <text class="celebrate-title">有人邀请你一起记录！</text>
            <text class="celebrate-desc">加入家庭后，你们可以一起记录双宝的日常</text>
            <view class="invite-actions">
              <button class="invite-accept" @click="acceptInvite">加入家庭</button>
              <button class="invite-decline" @click="showInvitePrompt=false">以后再说</button>
            </view>
          </view>
        </view>

        <!-- 里程碑庆祝弹窗 -->
        <view class="celebrate-overlay" v-if="showCelebrate" @click="showCelebrate=false">
          <view class="celebrate-card">
            <text class="celebrate-emoji">{{ celebrateEmoji }}</text>
            <text class="celebrate-title">{{ celebrateTitle }}</text>
            <text class="celebrate-desc">{{ celebrateDesc }}</text>
            <view class="celebrate-stars">
              <text class="cs">⭐</text><text class="cs">🌟</text><text class="cs">⭐</text>
            </view>
          </view>
        </view>

        <text class="journal-footer-text" v-if="streakDays > 0">连续记录第 {{ streakDays }} 天 ✦</text>

        <!-- 底部导航 — journal-style page tabs -->
        <view class="journal-nav">
          <text class="jnav-item active">手帐</text>
          <text class="jnav-item" @click="goGrowth">生长</text>
          <text class="jnav-item" @click="goSnapshot">快照</text>
          <text class="jnav-item" @click="showMoreSheet=true">更多</text>
        </view>

        <!-- 🆕 自定义「更多」底部弹出面板 (替代原生ActionSheet) -->
        <view class="more-overlay" v-if="showMoreSheet" @click="showMoreSheet=false">
          <view class="more-sheet" @click.stop>
            <view class="more-handle" />
            <text class="more-title">更多功能</text>
            <view class="more-grid">
              <view v-for="f in discoverFeatures" :key="f.path" class="more-item" @click="showMoreSheet=false;navigate(f.path)">
                <text class="more-item-icon">{{ f.icon }}</text>
                <text class="more-item-label">{{ f.label }}</text>
              </view>
            </view>
            <view class="more-divider" />
            <view class="more-actions">
              <view class="more-action" @click="showMoreSheet=false;goExport()">
                <text>📤 导出数据备份</text>
              </view>
              <view class="more-action" @click="showMoreSheet=false;navigate('/pages/privacy/index')">
                <text>🔒 隐私政策</text>
              </view>
            </view>
            <view class="more-cancel" @click="showMoreSheet=false">取消</view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed,ref,onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import { useAlertsStore } from '@/stores/alerts'
import { useStickersStore } from '@/stores/stickers'
import { useStickerSync } from '@/composables/useStickerSync'
import { useQuickRef } from '@/composables/useQuickRef'
import { getDiscoverFeatures } from '@/config/roles'
import { saveExportData, syncRecords, pullRecords } from '@/utils/syncService'
import { createInvite, joinFamily } from '@/api/family'
import TwinSkeleton from '@/components/twin-skeleton/twin-skeleton.vue'
import LightBridge from '@/components/cosmic/LightBridge.vue'
import StickerStrip from '@/components/journal/StickerStrip.vue'
import TwinMascot from '@/components/journal/TwinMascot.vue'

const loading=ref(true);const userStore=useUserStore()
const themeClass=computed(()=>{const c=['page-root'];const h=new Date().getHours();if(h>=22||h<6)c.push('theme-dark');if(userStore.isGrandmaMode)c.push('font-large','role-granny');else if(userStore.isDad)c.push('role-dad');return c.join(' ')})
async function initSync(){
  try {
    const server = await pullRecords()
    if (server.length) {
      const existingIds = new Set(recordsStore.logs.map(l => l.id))
      const newLogs = server.filter((r: any) => !existingIds.has(r.id))
      if (newLogs.length) {
        const merged = [...recordsStore.logs, ...newLogs.map((r: any) => ({
          id: r.id, babyId: r.baby_id, babyName: '', babyColor: '',
          type: r.type, startedAt: new Date(r.started_at).getTime(),
          endedAt: 0, durationMin: r.duration_min, detail: r.detail,
          createdAt: new Date(r.created_at).getTime()
        }))]
        recordsStore.logs = merged
      }
    }
    syncRecords(recordsStore.logs.slice(-20))
  } catch { /* 静默 */ }
}
// 邀请令牌 — 预生成用于分享，从 globalData 检测被邀请
const inviteToken = ref('')
const showInvitePrompt = ref(false)

async function checkInviteAndAccept() {
  // 检测是否有邀请令牌
  try {
    const app = getApp()
    const token = app?.globalData?.__inviteToken
    if (token && userStore.isLoggedIn) {
      showInvitePrompt.value = true
      inviteToken.value = token
      // 清除，避免重复弹窗
      app.globalData.__inviteToken = null
    }
  } catch {}
}
async function acceptInvite() {
  try {
    const res = await joinFamily(inviteToken.value)
    if (res.success) {
      uni.showToast({ title: '成功加入家庭！', icon: 'success' })
      showInvitePrompt.value = false
    } else {
      uni.showToast({ title: res.error?.message || '加入失败', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '网络问题，稍后再试吧', icon: 'none' })
  }
}

// 预生成邀请令牌用于分享
async function ensureInviteToken() {
  if (inviteToken.value) return inviteToken.value
  try {
    const res = await createInvite()
    if (res.success && res.data) {
      inviteToken.value = res.data.token
      return res.data.token
    }
  } catch { /* 离线或无家庭时静默失败 */ }
  return ''
}

onMounted(()=>{setTimeout(()=>{loading.value=false;syncStickers();initSync().catch(()=>{});checkCelebrate();checkInviteAndAccept();ensureInviteToken().catch(()=>{})},400)})
onShareAppMessage(() => {
  const aName=babyA.value?.nickname||'大宝';const bName=babyB.value?.nickname||'二宝'
  const token = inviteToken.value
  const path = token ? `/pages/index/index?invite=${token}` : '/pages/index/index'
  return {
    title:`${aName}和${bName}的成长手帐 · 一起来记录吧 🪐`,
    path,
    imageUrl:'/static/share-brand.png',
  }
})

const babiesStore=useBabiesStore();const recordsStore=useRecordsStore()
const alertsStore=useAlertsStore();const stickersStore=useStickersStore()
const { syncStickers } = useStickerSync()
const { quickRef } = useQuickRef()

// 新手引导：首次使用显示教学卡片，进行第一次记录后或手动关闭后消失
const WELCOME_KEY = 'tp_welcome_dismissed'
const showWelcome = ref(false)
try {
  const dismissed = uni.getStorageSync(WELCOME_KEY)
  const hasRecords = recordsStore.logs.length > 0
  showWelcome.value = !dismissed && !hasRecords
} catch { showWelcome.value = true }
function dismissWelcome() {
  showWelcome.value = false
  try { uni.setStorageSync(WELCOME_KEY, '1') } catch {}
}

// 里程碑庆祝 — 连续7/30/100天触发一次性弹窗
const CELEBRATE_KEY = 'tp_celebrated'
const showCelebrate = ref(false)
const celebrateEmoji = ref('🎉')
const celebrateTitle = ref('')
const celebrateDesc = ref('')
const MILESTONES: Record<number, { emoji: string; title: string; desc: string }> = {
  7: { emoji: '🌟', title: '一周全勤！', desc: '连续7天记录，你已经是个了不起的守护者了' },
  30: { emoji: '🏆', title: '月度之星！', desc: '连续30天记录，这份坚持太厉害了' },
  100: { emoji: '👑', title: '百天守护！', desc: '100天的陪伴，两个小怪兽有你真幸福' },
}
function checkCelebrate() {
  const days = streakDays.value
  if (!MILESTONES[days]) return
  try {
    const celebrated: number[] = JSON.parse(uni.getStorageSync(CELEBRATE_KEY) || '[]')
    if (celebrated.includes(days)) return
    const m = MILESTONES[days]
    celebrateEmoji.value = m.emoji; celebrateTitle.value = m.title; celebrateDesc.value = m.desc
    showCelebrate.value = true
    celebrated.push(days)
    uni.setStorageSync(CELEBRATE_KEY, JSON.stringify(celebrated))
  } catch {}
}

const isGrandma=computed(()=>userStore.isGrandmaMode)
const babyA=computed(()=>babiesStore.babyA);const babyB=computed(()=>babiesStore.babyB)
const streakDays=computed(()=>recordsStore.streakDays)
const isRunningA=computed(()=>babyA.value?recordsStore.isBabyRunning(babyA.value.id):false)
const isRunningB=computed(()=>babyB.value?recordsStore.isBabyRunning(babyB.value.id):false)
const alertCount=computed(()=>alertsStore.unreadCount)

const greeting=computed(()=>{const h=new Date().getHours();if(h<6)return'凌晨好';if(h<9)return'早上好';if(h<12)return'上午好';if(h<14)return'中午好';if(h<18)return'下午好';if(h<22)return'晚上好';return'夜深了'})
const greetLine2=computed(()=>{const h=new Date().getHours();const r=userStore.profile?.role;if(r==='dad'){if(h>=22||h<6)return'值班中，撑住 💪';if(h<9)return'早上好，今天你是超级奶爸';return'数据看板已就绪 📊'}if(r==='grandma'||r==='grandpa')return'';if(h>=22||h<6)return'夜深了，辛苦啦 🌙';if(h<9)return'新的一天，两个小怪兽醒了没';if(h<14)return'上午过半，奶茶续命时间 🧋';return'下午好，小怪兽们在干嘛呢'})
const roleEmoji=computed(()=>userStore.roleEmoji)
const roleLabel=computed(()=>userStore.roleLabel)
const dateStr=computed(()=>{const d=new Date();const days=['日','一','二','三','四','五','六'];return `${d.getMonth()+1}月${d.getDate()}日 星期${days[d.getDay()]}`})

function babyStatus(b:any):string{if(!b)return'';const logs=recordsStore.recentLogsByBaby[b.id];if(!logs?.length)return'';const last=logs[logs.length-1];const m=Math.floor((Date.now()-last.createdAt)/60000);const a=last.type==='feeding'?'喂奶':last.type==='sleep'?'睡觉':'记录';if(m<1)return`刚刚${a}`;if(m<60)return`${m}分钟前${a}`;return`${Math.floor(m/60)}小时前${a}`}

const syncRate=computed(()=>recordsStore.twinSyncRate)
const insightText=computed(()=>{const s=syncRate.value;if(s>70)return`同步率 ${s}% · 神同步！不愧是双胞胎`;if(s>30)return`同步率 ${s}% · 今天打架战绩：平局 🤼`;if(s>0)return'各有各的节奏，挺好的';return'两个小怪兽，今天会同步吗？'})
const bridgeState=computed(()=>{const aId=babyA.value?.id;const bId=babyB.value?.id;if(!aId||!bId)return'faint';const aLogs=recordsStore.recentLogsByBaby[aId]||[];const bLogs=recordsStore.recentLogsByBaby[bId]||[];const aRecent=aLogs.length&&(Date.now()-aLogs[aLogs.length-1].createdAt)<3600000;const bRecent=bLogs.length&&(Date.now()-bLogs[bLogs.length-1].createdAt)<3600000;if(aRecent&&bRecent)return'bright';if(aRecent)return'one-sided-a';if(bRecent)return'one-sided-b';if(aLogs.length||bLogs.length)return'steady';return'faint'})

const todaySummary=computed(()=>{
  const today=recordsStore.logs.filter(l=>l.createdAt>=new Date().setHours(0,0,0,0))
  if(!today.length)return''
  const feeds=today.filter(l=>l.type==='feeding').length
  const sleeps=today.filter(l=>l.type==='sleep').length
  const diapers=today.filter(l=>l.type==='diaper').length
  const parts:string[]=[]
  if(feeds)parts.push(`${feeds}次喂奶`)
  if(sleeps)parts.push(`${sleeps}次睡眠`)
  if(diapers)parts.push(`${diapers}次换尿布`)
  return parts.length?`今天 ${parts.join(' · ')}`:''
})
const tomorrowForecast=computed(()=>{
  const allLogs=recordsStore.logs.filter(l=>l.type==='feeding'||l.type==='sleep')
  if(allLogs.length<6)return''
  const morningLogs=allLogs.filter(l=>{const h=new Date(l.createdAt).getHours();return h>=5&&h<9})
  if(morningLogs.length<2)return''
  const avgMin=morningLogs.reduce((s,l)=>s+new Date(l.createdAt).getHours()*60+new Date(l.createdAt).getMinutes(),0)/morningLogs.length
  const h=Math.floor(avgMin/60);const m=Math.floor(avgMin%60)
  return `明早约 ${h}:${String(m).padStart(2,'0')} 第一次喂奶`
})
const allGood=computed(()=>{const today=recordsStore.logs.filter(l=>l.createdAt>=new Date().setHours(0,0,0,0));if(!today.length)return false;const aId=babyA.value?.id;const bId=babyB.value?.id;return today.some(l=>l.babyId===aId)&&today.some(l=>l.babyId===bId)})
const lastUpdateText=computed(()=>{
  const logs=recordsStore.logs;if(!logs.length)return''
  const m=Math.floor((Date.now()-logs[logs.length-1].createdAt)/60000)
  if(m<1)return'刚刚';if(m<60)return`${m}分钟前`;return`${Math.floor(m/60)}小时前`
})

function dualRecord(t:'feeding'|'sleep'|'diaper'){if(babyA.value)recordsStore.quickLog(babyA.value.id,t);if(babyB.value)recordsStore.quickLog(babyB.value.id,t);syncStickers();uni.showToast({title:t==='feeding'?'都喂了':t==='sleep'?'都睡了':'都换了',icon:'success',duration:800})}

const navigate=(url:string)=>uni.navigateTo({url})
const goRecord=()=>navigate('/pages/record/index')
const goGrowth=()=>navigate('/pages/growth/index')
const goSnapshot=()=>navigate('/pages/snapshot/index')
const showMoreSheet=ref(false)

// 发现页功能列表（带图标）
const FEATURE_ICONS: Record<string, string> = {
  sprout:'🌱', contribution:'⭐', duty:'🦸', guardian:'🔋',
  handover:'🎙️', stickers:'🏅', school:'🏫', milestones:'📊',
}
const discoverFeatures=computed(()=>{
  return getDiscoverFeatures(userStore.profile?.role).map(f=>({
    ...f, icon: FEATURE_ICONS[f.path.split('/').pop()||''] || '📋',
  }))
})

const goHelp = () => {
  uni.showActionSheet({
    itemList: ['📞 打电话给妈妈','💬 发消息到家庭群','📋 查看使用说明'],
    success: (res) => {
      if (res.tapIndex === 0) {
        const phone = userStore.profile?.phone
        if (phone) {
          uni.makePhoneCall({ phoneNumber: phone })
        } else {
          uni.showToast({ title: '请先在设置中添加电话号码', icon: 'none' })
        }
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: '需要帮忙',
          content: '宝宝需要帮忙照顾，你能过来一下吗？',
          confirmText: '分享给微信好友',
          success: () => {
            uni.showToast({ title: '请点击右上角分享', icon: 'none' })
          }
        })
      } else {
        uni.showModal({
          title: '使用说明',
          content: '1. 点"记一笔"记录喂奶/睡觉\n2. 点"看看长多大了"查看生长曲线\n3. 点"问家里人"联系家人\n\n记不住？没关系，点最大的那个按钮就行！',
          confirmText: '我知道了',
          showCancel: false
        })
      }
    }
  })
}
const goExport = async () => {
  try {
    const path = await saveExportData()
    uni.showModal({
      title: '数据已导出',
      content: '文件已保存，可通过微信发送到新手机导入。',
      confirmText: '知道了',
      showCancel: false
    })
  } catch {
    uni.showToast({ title: '导出遇到问题，稍后再试吧', icon: 'none' })
  }
}
const switchRole = () => {
  const roles = ['👩 妈妈','👨 爸爸','👵 奶奶','👴 爷爷','👩‍🍼 育儿嫂','📝 重新创建家庭','🚪 退出登录']
  uni.showActionSheet({
    itemList: roles,
    success: (res) => {
      if (res.tapIndex === 5) {
        uni.reLaunch({ url: '/pages/onboarding/family' })
      } else if (res.tapIndex === 6) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      } else {
        const r = ['mom','dad','grandma','grandpa','nanny'][res.tapIndex]
        userStore.setRole(r)
        uni.showToast({ title: '已切换为' + roles[res.tapIndex] + '模式', icon: 'success', duration: 1500 })
      }
    }
  })
}
</script>

<style scoped>
.journal{position:relative}

/* 暖色光斑 — 不对称位置 */
.bg-spot{position:absolute;pointer-events:none;z-index:0;border-radius:50%}
.spot-a{width:560rpx;height:560rpx;top:60rpx;left:-260rpx;background:radial-gradient(circle,rgba(224,123,62,0.04) 0%,transparent 55%)}
.spot-b{width:380rpx;height:380rpx;bottom:280rpx;right:-140rpx;background:radial-gradient(circle,rgba(92,154,110,0.03) 0%,transparent 55%)}

/* 页眉 masthead */
.masthead{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44rpx}
.masthead-left{display:flex;flex-direction:column;gap:8rpx}
.date-line{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md);letter-spacing:2rpx}
.role-note{font-size:20rpx;color:var(--ink-lt);display:inline-flex;align-items:center;gap:6rpx}
.role-note:active{color:var(--amber)}
.alert-badge{display:inline-flex;align-items:center;justify-content:center;min-width:28rpx;height:28rpx;border-radius:14rpx;background:var(--twin-danger);color:#FFF;font-size:16rpx;font-weight:700;padding:0 4rpx}
.masthead-right{display:flex;align-items:flex-end}
.streak-stamp{background:var(--gold-lt);padding:6rpx 14rpx;border-radius:4rpx 12rpx 4rpx 12rpx;font-family:var(--font-journal);font-size:20rpx;color:var(--gold);font-weight:700;transform:rotate(2deg);box-shadow:0 2rpx 6rpx rgba(200,153,62,0.1);animation:stampIn .4s var(--ease-bounce)}
@keyframes stampIn{0%{transform:rotate(2deg)scale(0);opacity:0}70%{transform:rotate(-1deg)scale(1.1)}100%{transform:rotate(2deg)scale(1);opacity:1}}
.streak-start{font-size:20rpx;color:var(--ink-lt);font-family:var(--font-journal)}

/* 吉祥物区域 */
.mascot-area {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

/* 新手引导卡片 */
.welcome-guide {
  position: relative;
  z-index: 1;
  margin-bottom: 32rpx;
}
.welcome-card {
  background: linear-gradient(135deg, var(--amber-lt) 0%, var(--cream) 50%, var(--rose-lt) 100%);
  border-radius: var(--radius-lg);
  border: 2rpx solid var(--dot);
  padding: 28rpx 24rpx 24rpx;
  animation: welcomeIn .6s var(--ease-soft);
}
@keyframes welcomeIn {
  from { opacity: 0; transform: translateY(-12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.welcome-top {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.welcome-wave { font-size: 48rpx; flex-shrink: 0; }
.welcome-text { flex: 1; }
.welcome-title {
  display: block;
  font-family: var(--font-journal);
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink);
}
.welcome-desc {
  display: block;
  font-size: 24rpx;
  color: var(--ink-md);
  margin-top: 4rpx;
}
.welcome-close {
  width: 48rpx; height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 24rpx;
  color: var(--ink-lt);
}
.welcome-close:active { background: var(--dot); }
.welcome-steps {
  display: flex;
  align-items: center;
  gap: 12rpx;
  justify-content: center;
}
.w-step {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.ws-num {
  width: 44rpx; height: 44rpx;
  border-radius: 50%;
  background: var(--amber);
  color: #FFF;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ws-text {
  font-size: 22rpx;
  color: var(--ink-md);
  line-height: 1.4;
}
.ws-hl {
  color: var(--amber);
  font-weight: 600;
}
.ws-arrow {
  font-size: 24rpx;
  color: var(--ink-lt);
}

/* 问候 — editorial left-aligned */
.greeting{position:relative;z-index:1;margin-bottom:44rpx}
.greet-line1{display:block;font-family:var(--font-journal);font-size:64rpx;font-weight:400;color:var(--ink);letter-spacing:-1rpx;line-height:1.1}
.greet-line2{display:block;font-family:var(--font-journal);font-size:36rpx;color:var(--ink-md);margin-top:4rpx}
.greet-sub{display:block;font-size:26rpx;color:var(--ink-lt);margin-top:16rpx;line-height:1.5;max-width:480rpx}

/* 双宝卡片 — asymmetric */
.twins{position:relative;z-index:1;display:flex;align-items:flex-start;margin-bottom:8rpx}
.twin-card{position:relative}
.twin-card:active{transform:scale(.96);transition:transform .2s var(--ease-bounce)}
.twin-card.card-a{flex:52;z-index:2;padding-right:0}
.twin-card.card-b{flex:48;z-index:1;margin-left:-24rpx;margin-top:8rpx}

.card-surface{
  padding:28rpx 20rpx 22rpx;
  border-radius:8rpx 24rpx 8rpx 24rpx;
  position:relative;
  box-shadow:0 2rpx 12rpx rgba(45,35,24,0.04),0 1rpx 0 rgba(45,35,24,0.02);
}
.card-a .card-surface{background:linear-gradient(175deg,var(--amber-lt) 0%,rgba(224,123,62,0.03) 100%);border:1.5px solid rgba(224,123,62,0.1);transform:rotate(-1.2deg)}
.card-b .card-surface{background:linear-gradient(185deg,var(--rose-lt) 0%,rgba(212,128,104,0.03) 100%);border:1.5px solid rgba(212,128,104,0.1);transform:rotate(1.5deg)}

/* 头像 */
.avatar-ring{width:88rpx;height:88rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12rpx;transition:transform .3s var(--ease-bounce)}
.twin-card:active .avatar-ring{transform:scale(1.08)}
.card-a .avatar-ring{background:var(--amber-md)}
.card-b .avatar-ring{background:var(--rose-md)}
.avatar-ring.pulsing::before{content:'';position:absolute;top:-6rpx;right:-6rpx;bottom:-6rpx;left:-6rpx;border-radius:50%;border:2rpx solid var(--mint);opacity:.45;animation:ringPulse 2.5s ease-in-out infinite}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.1);opacity:.8}}
.avatar-emoji{font-size:44rpx}

.twin-name{font-family:var(--font-journal);font-size:30rpx;font-weight:700;color:var(--ink);text-align:center;display:block;margin-bottom:4rpx}
.twin-status-row{text-align:center}
.status-live{font-size:22rpx;color:var(--mint);font-weight:600}
.status-recent{font-size:22rpx;color:var(--ink-md)}
.status-tap{font-size:22rpx;color:var(--ink-lt)}

/* LightBridge */
.bridge-wrap{display:flex;justify-content:center;position:relative;z-index:1;margin-bottom:16rpx}

/* 贴纸区域 */
.sticker-zone{position:relative;z-index:1;margin-bottom:12rpx}

/* 今日摘要 */
.summary-line{text-align:left;margin-bottom:24rpx;position:relative;z-index:1}
.summary-line text{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md)}

/* 中央按钮 */
.action-center{display:flex;align-items:center;justify-content:center;position:relative;z-index:1;margin-bottom:28rpx}
.btn-stage{position:relative;width:420rpx;height:420rpx;display:flex;align-items:center;justify-content:center}
.orbit-ring{position:absolute;top:0;right:0;bottom:0;left:0;border-radius:50%;border:2rpx dashed var(--dot);opacity:.35;transition:opacity .3s,border-color .3s}
.orbit-ring.pulsing{border-color:var(--mint);opacity:.6;animation:orbitGlow 3s ease-in-out infinite}
@keyframes orbitGlow{0%,100%{opacity:.35;border-color:var(--dot)}50%{opacity:.7;border-color:var(--mint)}}
.main-btn{
  width:300rpx;height:300rpx;border-radius:50%;
  position:relative;z-index:2;
  background:var(--amber);border:none;color:#FFF;font-family:var(--font-journal);
  box-shadow:0 20rpx 56rpx rgba(224,123,62,0.2),0 6rpx 12rpx rgba(224,123,62,0.1),
             inset 0 3rpx 0 rgba(255,255,255,.2),inset 0 -6rpx 12rpx rgba(0,0,0,.06);
  transform:rotate(-2deg);
  transition:transform .18s var(--ease-bounce),box-shadow .18s;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6rpx;
}
.main-btn::after{content:'';position:absolute;top:14rpx;left:22%;right:22%;height:32%;background:radial-gradient(ellipse at center,rgba(255,255,255,.25) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.main-btn:active{transform:rotate(-2deg)scale(.86);box-shadow:0 6rpx 20rpx rgba(224,123,62,.16),0 2rpx 4rpx rgba(224,123,62,.08)}
.btn-icon{font-size:56rpx;position:relative;z-index:1}
.btn-text{font-size:32rpx;font-weight:700;letter-spacing:6rpx;position:relative;z-index:1}

/* 快捷操作 — asymmetric sizes */
.quick-bar{display:flex;gap:12rpx;justify-content:center;position:relative;z-index:1;margin-bottom:20rpx;align-items:center}
.q-chip{padding:16rpx 24rpx;border-radius:20rpx;font-size:22rpx;font-weight:600;background:var(--cream);border:1.5px solid var(--dot);color:var(--ink-md);transition:transform .15s var(--ease-bounce),background .2s,border-color .2s}
.q-chip:active{transform:scale(.9);background:var(--amber-lt);border-color:var(--amber);color:var(--amber)}
.q-chip.q-primary{padding:18rpx 32rpx;font-size:26rpx;background:var(--amber-lt);border-color:var(--amber);color:var(--amber)}

/* 爸爸模式快捷 */
.duty-card{display:flex;gap:8rpx;justify-content:center;position:relative;z-index:1;margin-bottom:20rpx;flex-wrap:wrap}

/* 预测 */
.forecast-line{text-align:left;margin-bottom:16rpx;position:relative;z-index:1}
.forecast-line text{font-size:22rpx;color:var(--ink-lt);font-style:italic}

.journal-footer-text{display:block;text-align:right;font-size:18rpx;color:var(--ink-lt);margin-bottom:20rpx;padding-right:8rpx;position:relative;z-index:1}

/* 底部导航 — journal tabs */
.journal-nav{display:flex;justify-content:space-between;padding:20rpx 48rpx 0;border-top:1.5px solid var(--dot);position:relative;z-index:1}
.jnav-item{font-family:var(--font-journal);font-size:26rpx;color:var(--ink-lt);letter-spacing:3rpx}
.jnav-item.active{color:var(--amber);font-weight:700}

/* 自定义「更多」底部弹出面板 */
.more-overlay{
  position:fixed;top:0;left:0;right:0;bottom:0;
  background:rgba(45,35,24,.35);z-index:999;
  display:flex;align-items:flex-end;justify-content:center;
  animation:fadeIn .2s var(--ease-soft);
}
.more-sheet{
  width:100%;max-width:750rpx;
  background:var(--paper);
  border-radius:var(--radius-lg) var(--radius-lg) 0 0;
  padding:0 32rpx calc(32rpx + env(safe-area-inset-bottom));
  animation:slideUp .3s var(--ease-soft);
}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.more-handle{
  width:64rpx;height:8rpx;border-radius:4rpx;
  background:var(--dot);margin:16rpx auto 24rpx;
}
.more-title{
  display:block;font-family:var(--font-journal);font-size:var(--font-card);
  color:var(--ink);font-weight:700;text-align:center;margin-bottom:28rpx;
}
.more-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:16rpx;
  margin-bottom:20rpx;
}
.more-item{
  display:flex;flex-direction:column;align-items:center;gap:8rpx;
  padding:24rpx 8rpx;background:var(--cream);border-radius:var(--radius-sm);
  border:2rpx solid var(--dot);
}
.more-item:active{background:var(--amber-lt);border-color:var(--amber)}
.more-item-icon{font-size:40rpx}
.more-item-label{font-size:22rpx;color:var(--ink);font-weight:600}
.more-divider{height:2rpx;background:var(--dot);margin:12rpx 0}
.more-actions{display:flex;flex-direction:column;gap:4rpx}
.more-action{padding:20rpx 16rpx;font-size:26rpx;color:var(--ink-md)}
.more-action:active{color:var(--amber)}
.more-cancel{
  text-align:center;padding:24rpx 0 8rpx;
  font-size:28rpx;color:var(--ink-lt);font-weight:600;
}
.more-cancel:active{color:var(--ink)}
.footer-tools{display:flex;flex-direction:column;align-items:center;gap:12rpx;margin-bottom:12rpx;position:relative;z-index:1}
.ft-invite{
  width:100%;max-width:560rpx;padding:16rpx 0;
  background:linear-gradient(135deg,var(--amber-lt),var(--rose-lt));
  border:2rpx solid var(--dot);border-radius:20rpx;
  font-size:24rpx;font-weight:600;color:var(--ink);
  line-height:1.4;
}
.ft-invite::after{border:none}
.ft-invite:active{opacity:.7}
.ft-row{display:flex;gap:12rpx}
.ft-link{font-size:20rpx;color:var(--ink-lt)} .ft-link:active{color:var(--amber)} .ft-dot{font-size:20rpx;color:var(--ink-lt)}
.disclaimer-note{display:block;text-align:center;font-size:18rpx;color:var(--ink-lt);margin-bottom:16rpx;opacity:.5;position:relative;z-index:1}
.all-good{text-align:left;margin-bottom:12rpx;position:relative;z-index:1}.all-good text{font-family:var(--font-journal);font-size:24rpx;color:var(--mint);font-weight:600}

/* 里程碑庆祝覆盖层 */
.celebrate-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(45,35,24,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
  animation: fadeIn .3s var(--ease-soft);
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.celebrate-card {
  background: var(--paper);
  border-radius: var(--radius-lg);
  padding: 64rpx 48rpx 48rpx;
  text-align: center;
  margin: 0 48rpx;
  box-shadow: 0 16rpx 48rpx rgba(45,35,24,.15);
  animation: celebBounce .5s var(--ease-bounce);
}
@keyframes celebBounce {
  0% { transform: scale(.5); opacity: 0; }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}
.celebrate-emoji { font-size: 120rpx; display: block; margin-bottom: 16rpx; }
.celebrate-title { display: block; font-family: var(--font-journal); font-size: 44rpx; color: var(--ink); font-weight: 700; }
.celebrate-desc { display: block; font-size: 28rpx; color: var(--ink-md); margin-top: 12rpx; line-height: 1.5; }
.celebrate-stars { margin-top: 24rpx; display: flex; gap: 16rpx; justify-content: center; }
.cs { font-size: 48rpx; animation: starSpin 1s ease-in-out infinite; }
.cs:nth-child(2) { animation-delay: .2s; font-size: 56rpx; }
.cs:nth-child(3) { animation-delay: .4s; }
@keyframes starSpin {
  0%, 100% { transform: rotate(0) scale(1); }
  50% { transform: rotate(15deg) scale(1.2); }
}

/* 邀请弹窗按钮 */
.invite-actions {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.invite-accept {
  width: 100%;
  padding: 24rpx 0;
  background: var(--amber);
  color: #FFF;
  border: none;
  border-radius: var(--radius-full);
  font-size: 30rpx;
  font-weight: 700;
}
.invite-accept::after { border: none; }
.invite-decline {
  width: 100%;
  padding: 16rpx 0;
  background: transparent;
  color: var(--ink-md);
  border: none;
  font-size: 24rpx;
}
.invite-decline::after { border: none; }

/* 入场 */
.reveal-1{animation:revealUp .5s var(--ease-soft) both}
.reveal-2{animation:revealUp .5s var(--ease-soft) .06s both}
.reveal-3{animation:revealUp .5s var(--ease-soft) .12s both}
.reveal-4{animation:revealUp .5s var(--ease-soft) .18s both}
.reveal-5{animation:revealUp .5s var(--ease-soft) .24s both}
.reveal-6{animation:revealUp .5s var(--ease-soft) .30s both}
@keyframes revealUp{from{opacity:0;transform:translateY(18rpx)}to{opacity:1;transform:translateY(0)}}

/* 奶奶模式 */
.granny-shell{display:flex;flex-direction:column;justify-content:center;min-height:100vh;padding:80rpx 56rpx!important}
.granny-actions{display:flex;flex-direction:column;gap:40rpx}
.granny-btn{text-align:center;padding:64rpx;background:var(--cream);border-radius:var(--radius-lg);border:4rpx solid var(--dot);display:flex;flex-direction:column;align-items:center;gap:16rpx}
.granny-btn:active{border-color:var(--amber);transform:scale(.97)}
.granny-help{border-color:var(--gold)}
.granny-emoji{font-size:80rpx}
.granny-label{font-family:var(--font-journal);font-size:52rpx;font-weight:700;color:var(--ink)}
.last-update{text-align:center;font-size:28rpx;color:var(--ink-lt);margin-top:40rpx}

/* 爸爸模式 */
.role-dad .greet-line2{display:none}
.role-dad .greet-sub{display:none}
.role-dad .greet-line1{font-size:44rpx}
.role-dad .sticker-zone{display:none}
.role-dad .summary-line{display:none}
.role-dad .forecast-line{display:none}
.role-dad .journal-footer-text{display:none}
.role-dad .orbit-ring{display:none}
.role-dad .card-surface{transform:none!important;border-radius:20rpx}
.role-dad .main-btn{transform:none;width:240rpx;height:240rpx;border-radius:20rpx}
.role-dad .main-btn::after{display:none}
.role-dad .btn-icon{font-size:40rpx}
.role-dad .btn-text{font-size:24rpx;letter-spacing:2rpx}
.role-dad .twin-card.card-b{margin-left:0;margin-top:0}

/* 奶奶模式增强 */
.role-granny .bg-spot,.role-granny .bridge-wrap,.role-granny .action-center,
.role-granny .quick-bar,.role-granny .sticker-zone,.role-granny .summary-line,
.role-granny .forecast-line,.role-granny .journal-footer-text,.role-granny .journal-nav{display:none}
.quick-ref{display:flex;gap:16rpx;flex-wrap:wrap;justify-content:center;margin-bottom:20rpx;position:relative;z-index:1}
.qr-item{display:flex;align-items:center;gap:6rpx;padding:8rpx 16rpx;background:var(--cream);border-radius:16rpx;border:2rpx solid var(--dot)}
.qr-emoji{font-size:24rpx}
.qr-text{font-size:22rpx;color:var(--ink-md);font-weight:500}
</style>
