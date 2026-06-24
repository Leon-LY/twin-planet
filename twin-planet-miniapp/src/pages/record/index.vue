<!-- 双宝记 · 记录页 v3：手帳盖章台 -->
<template>
  <view class="stamp-page" :class="{ 'theme-dark': isNight }">
    <!-- 空状态 -->
    <template v-if="!twins.length">
      <view class="empty-state">
        <view class="empty-icon-row">
          <text class="empty-emoji iconfont icon-baby-a"></text>
          <text class="empty-emoji iconfont icon-baby-b"></text>
        </view>
        <text class="empty-title">还没有添加宝宝</text>
        <text class="empty-desc">先去「我的」添加双胞胎信息吧</text>
      </view>
    </template>

    <template v-else>
      <!-- === 计时器界面 (覆盖层) === -->
      <template v-if="recordsStore.isRunning">
        <!-- 单计时器 -->
        <view v-if="recordsStore.runningTimers.length===1" class="timer-overlay animate-in">
          <view class="timer-card" :class="runningTwin==='a'?'amber':'terracotta'">
            <view class="timer-face">
              <text class="timer-emoji">{{ timerType==='feeding'?'🍼':'😴' }}</text>
            </view>
            <text class="timer-name">{{ runningName }}</text>
            <text class="timer-elapsed">{{ formatElapsed(runningElapsed) }}</text>
            <text class="timer-poetic">{{ poeticLabel }}</text>
            <!-- 喂养计时中：侧别+奶量 -->
            <view class="feed-ctrls" v-if="timerType==='feeding'">
              <view class="fc-sides">
                <text class="fc-chip" :class="{on:feedSide==='left'}" @click="setFeedSide('left')">左</text>
                <text class="fc-chip" :class="{on:feedSide==='right'}" @click="setFeedSide('right')">右</text>
                <text class="fc-chip" :class="{on:feedSide==='bottle'}" @click="setFeedSide('bottle')">瓶</text>
              </view>
              <view class="fc-amounts" v-if="feedSide">
                <text v-for="ml in [60,90,120,150,180]" :key="ml" class="fc-chip" :class="{on:feedAmount===ml}" @click="setFeedAmount(ml)">{{ ml }}ml</text>
              </view>
            </view>
            <view class="timer-stop" @click="stopOne(recordsStore.runningTimer?.babyId)">
              {{ timerType==='sleep'?'醒了':'喂完了' }}
            </view>
          </view>
          <!-- 另一个宝宝：计时中也可盖章 -->
          <view class="timer-idle-card" v-if="idleBaby" @click="stampBaby(idleBaby.id)">
            <text class="idle-avatar">{{ idleBaby.nickname?.charAt(0)||'🦊' }}</text>
            <text class="idle-hint">点击给 {{ idleBaby.nickname }} 记录</text>
          </view>
        </view>

        <!-- 双计时器 -->
        <view v-else class="dual-timer animate-in">
          <view class="dual-cards">
            <view v-for="t in recordsStore.runningTimers" :key="t.babyId" class="dt-card" :class="t.babyId===twins[0]?.id?'amber':'terracotta'">
              <view class="dt-face"><text class="dt-emoji">{{ t.type==='feeding'?'🍼':'😴' }}</text></view>
              <text class="dt-name">{{ getName(t.babyId) }}</text>
              <text class="dt-elapsed">{{ formatElapsed(t.elapsed) }}</text>
              <view class="dt-stop" @click="stopOne(t.babyId)">停止</view>
            </view>
          </view>
          <view class="dt-all-stop" @click="stopAll">全部停止</view>
        </view>
      </template>

      <!-- === 盖章台主界面 (空闲时) === -->
      <template v-else>
        <!-- 双宝卡片 -->
        <view class="baby-cards">
          <view
            v-for="(b, i) in twins"
            :key="b.id"
            class="baby-card"
            :class="[i===0?'amber':'terracotta', { 'stamp-target': selectedStamp, 'stamp-hit': hitBabyId===b.id }]"
            @click="stampBaby(b.id)"
          >
            <!-- 卡片装饰：和纸胶带 -->
            <view class="card-tape" :class="i===0?'tape-amber':'tape-terracotta'"></view>
            <!-- 头像 -->
            <image
              :src="i===0 ? avatars.a : avatars.b"
              class="card-avatar"
              mode="aspectFill"
            />
            <!-- 名字 -->
            <text class="card-name">{{ b.nickname || b.name }}</text>
            <!-- 今日摘要 -->
            <view class="card-summary">
              <text class="cs-item" v-if="todayCount(b.id,'feeding')>0">🍼 {{ todayCount(b.id,'feeding') }}</text>
              <text class="cs-item" v-if="todayCount(b.id,'sleep')>0">😴 {{ todayCount(b.id,'sleep') }}</text>
              <text class="cs-item" v-if="todayCount(b.id,'diaper')>0">💧 {{ todayCount(b.id,'diaper') }}</text>
            </view>
            <!-- 高频快捷 chips：点一下即记录 -->
            <view class="card-chips">
              <view class="card-chip amber-chip" @click.stop="quickRecord(b.id,'feeding')">
                <text class="card-chip-emoji">🍼</text>
              </view>
              <view class="card-chip" @click.stop="quickRecord(b.id,'diaper')">
                <text class="card-chip-emoji">💧</text>
              </view>
              <view class="card-chip gray-chip" @click.stop="quickRecord(b.id,'sleep')">
                <text class="card-chip-emoji">😴</text>
              </view>
            </view>
            <!-- 盖章提示 -->
            <view v-if="selectedStamp" class="stamp-hint">
              <text class="stamp-hint-icon">{{ selectedStampEmoji }}</text>
              <text>点击盖章</text>
            </view>
            <!-- 盖下动画 -->
            <view v-if="hitBabyId===b.id" class="stamp-effect">
              <text class="stamp-effect-icon">{{ selectedStampEmoji }}</text>
            </view>
          </view>
        </view>

        <!-- 选中的印章提示行 -->
        <view class="stamp-action-bar" v-if="selectedStamp">
          <text class="sab-text">已选「{{ selectedStampLabel }}」— 点击宝宝卡片盖章</text>
          <text class="sab-cancel" @click="deselectStamp">取消</text>
        </view>

        <!-- 印章台 -->
        <view class="stamp-tray">
          <view
            v-for="s in STAMP_TYPES"
            :key="s.type"
            class="stamp-item"
            :class="{ selected: selectedStamp===s.type, dimmed: selectedStamp && selectedStamp!==s.type }"
            @click="selectStamp(s.type)"
          >
            <view class="stamp-body">
              <text class="stamp-emoji">{{ s.emoji }}</text>
            </view>
            <text class="stamp-label">{{ s.label }}</text>
          </view>
        </view>

        <!-- 快速双记（两个都喂了 / 都睡了） -->
        <view class="dual-quick" v-if="twins.length>=2">
          <text class="dq-chip" @click="dualQuick('feeding')">🍼 两个都喂了</text>
          <text class="dq-chip" @click="dualQuick('sleep')">😴 都睡了</text>
        </view>

        <!-- 今日时间线 -->
        <view class="timeline" v-if="recentLogs.length">
          <text class="tl-title">今日记录</text>
          <view v-for="l in recentLogs" :key="l.id" class="tl-item">
            <view class="tl-dot" :class="l.babyId===twins[0]?.id?'dot-a':'dot-b'"></view>
            <text class="tl-detail">{{ l.detail }}</text>
            <text class="tl-time">{{ relativeTime(l.createdAt) }}</text>
          </view>
        </view>
      </template>

      <!-- 撤销条 -->
      <view class="undo-bar" v-if="undoVisible">
        <text class="undo-text">{{ undoMessage }}</text>
        <text class="undo-link" @click="doUndo">撤销</text>
      </view>

      <!-- 贴纸弹出 -->
      <view class="sticker-pop" v-if="stickerShow">
        <text class="sticker-pop-emoji iconfont" :class="stickerEmoji"></text>
      </view>

      <!-- 知识提示 -->
      <view class="knowledge-card" v-if="knowledgeVisible">
        <text class="knowledge-text">{{ knowledgeText }}</text>
        <text class="knowledge-close" @click="closeKnowledge">✕</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { useRecordsStore, type RecordType, type RecordLog } from '@/stores/records'
import { useBabiesStore } from '@/stores/babies'
import { useStickersStore } from '@/stores/stickers'
import { useStickerSync } from '@/composables/useStickerSync'
import { useHaptic } from '@/composables/useHaptic'
import { usePoeticTime } from '@/composables/usePoeticTime'
import { trackRecordCreated } from '@/utils/analytics'
import { pickKnowledge } from '@/config/knowledge'
function relativeTime(ts:number):string{const d=Math.floor((Date.now()-ts)/6e4);if(d<1)return'刚刚';if(d<60)return d+'分钟前';const h=Math.floor(d/60);if(h<24)return h+'小时前';return Math.floor(h/24)+'天前'}

const recordsStore = useRecordsStore()
const babiesStore = useBabiesStore()
const stickersStore = useStickersStore()
const { syncStickers } = useStickerSync()
const haptic = useHaptic()

// ---- 宝宝数据 ----
const twins = computed(() => [babiesStore.babyA, babiesStore.babyB].filter((b): b is NonNullable<typeof b> => !!b))
const babyA = computed(() => babiesStore.babyA)
const babyB = computed(() => babiesStore.babyB)
const avatars = { a: '/static/avatars/baby-a-amber.png', b: '/static/avatars/baby-b-terracotta.png' }

function todayCount(babyId: string, type: RecordType): number {
  const t0 = new Date().setHours(0,0,0,0)
  return recordsStore.logs.filter(l => l.babyId===babyId && l.type===type && l.createdAt>=t0).length
}

// ---- 印章系统 ----
const TIME_STAMPS = new Set(['feeding','sleep'])
const STAMP_TYPES = [
  { type:'temperature' as RecordType, emoji:'🌡️', label:'体温' },
  { type:'medicine' as RecordType, emoji:'💊', label:'用药' },
  { type:'bath' as RecordType, emoji:'🛁', label:'洗澡' },
]

const selectedStamp = ref<RecordType|''>('')
const selectedStampEmoji = computed(() => STAMP_TYPES.find(s=>s.type===selectedStamp.value)?.emoji||'')
const selectedStampLabel = computed(() => STAMP_TYPES.find(s=>s.type===selectedStamp.value)?.label||'')
const hitBabyId = ref<string>('')

function selectStamp(type: RecordType) {
  if (selectedStamp.value === type) {
    deselectStamp()
    return
  }
  selectedStamp.value = type
  haptic.tick()
}

function deselectStamp() {
  selectedStamp.value = ''
}

/** 高频快捷记录：点 chip 即完成（喂养/尿布/哄睡） */
function quickRecord(babyId: string, type: RecordType) {
  // 点击动画
  hitBabyId.value = babyId
  setTimeout(() => { hitBabyId.value = '' }, 500)

  if (TIME_STAMPS.has(type)) {
    // 计时类型：快速启动计时器
    if (recordsStore.runningTimers[babyId]) recordsStore.stopTimer(babyId)
    recordsStore.startTimer(babyId, type)
    haptic.thump()
  } else {
    const log = recordsStore.quickLog(babyId, type)
    if (log) showUndo(log)
    haptic.sparkle()
    syncStickers()
    trackRecordCreated(type, 'chip')
    showKnowledge(type)
  }
  popSticker(type)
}

function stampBaby(babyId: string) {
  if (!selectedStamp.value) return
  const t = selectedStamp.value

  // 低频操作：直接快速记录
  const log = recordsStore.quickLog(babyId, t)
  if (log) showUndo(log)
  haptic.sparkle()
  syncStickers()
  trackRecordCreated(t, 'stamp')
  showKnowledge(t)
  popSticker(t)

  // 盖下动画
  hitBabyId.value = babyId
  setTimeout(() => { hitBabyId.value = '' }, 500)
}

function dualQuick(type: 'feeding'|'sleep') {
  const a = twins.value[0], b = twins.value[1]
  let lastLog: RecordLog|undefined
  if (a) lastLog = recordsStore.quickLog(a.id, type)
  if (b) lastLog = recordsStore.quickLog(b.id, type)
  if (lastLog) showUndo(lastLog)
  haptic.doubleBeat()
  syncStickers()
  trackRecordCreated(type, 'dual')
  showKnowledge(type)
}

// ---- 计时器相关 ----
const tick = ref(0)
let h: ReturnType<typeof setInterval>|null = null
watch(()=>recordsStore.isRunning, r=>{
  if(r){ haptic.heartbeatStart(); h=setInterval(()=>tick.value++,1000) }
  else{ haptic.heartbeatStop(); if(h){clearInterval(h);h=null} }
},{immediate:true})

onUnmounted(()=>{ if(h)clearInterval(h); haptic.heartbeatStop(); if(stickerTimer)clearTimeout(stickerTimer); if(undoTimer)clearTimeout(undoTimer); if(knowledgeTimer)clearTimeout(knowledgeTimer) })
onHide(()=>{ if(h){clearInterval(h);h=null}; haptic.heartbeatStop() })

const runningElapsed = computed(()=>{ tick.value; return recordsStore.runningTimer?.elapsed??0 })
const runningName = computed(()=>{ const t=recordsStore.runningTimer; return t?getName(t.babyId):'' })
const runningTwin = computed(()=>(recordsStore.runningTimer?.babyId===twins.value[0]?.id?'a':'b'))
const timerType = computed(()=>recordsStore.runningTimer?.type as 'feeding'|'sleep'|undefined)
const elapsedRef = computed(()=>runningElapsed.value)
const {label:poeticLabel} = usePoeticTime(elapsedRef, timerType)

// 计时中另一个未计时的宝宝
const idleBaby = computed(()=>{
  if (recordsStore.runningTimers.length!==1) return null
  const runningId = recordsStore.runningTimer?.babyId
  return twins.value.find(b=>b.id!==runningId) || null
})

// 喂养计时上下文
const feedSide = ref<'left'|'right'|'bottle'|''>('')
const feedAmount = ref(0)
function setFeedSide(s:'left'|'right'|'bottle'){ feedSide.value=s; const id=recordsStore.runningTimer?.babyId; if(id)recordsStore.setTimerField(id,'feedingSide',s) }
function setFeedAmount(ml:number){ feedAmount.value=ml; const id=recordsStore.runningTimer?.babyId; if(id)recordsStore.setTimerField(id,'amountMl',ml) }
function getName(id:string){ return twins.value.find(b=>b.id===id)?.nickname||'' }

function stopOne(id?: string) {
  recordsStore.stopTimer(id)
  haptic.thump()
}
function stopAll() {
  recordsStore.stopTimer()
  haptic.thump()
}
function formatElapsed(s: number): string {
  const m = Math.floor(s/60), sec = s%60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

// ---- 贴纸弹出 ----
const stickerShow = ref(false); const stickerEmoji = ref('')
let stickerTimer: ReturnType<typeof setTimeout>|null = null
const stickerMap: Record<string,string> = { feeding:'icon-bottle', sleep:'icon-sleep', diaper:'icon-diaper', temperature:'icon-thermometer', medicine:'icon-medicine', bath:'icon-bath' }
function popSticker(type: string) {
  if(stickerTimer) clearTimeout(stickerTimer)
  stickerEmoji.value = stickerMap[type] || 'icon-star'
  stickerShow.value = true
  stickerTimer = setTimeout(()=>{ stickerShow.value = false }, 750)
}

// ---- 撤销 ----
const undoVisible = ref(false); const undoMessage = ref(''); const undoLogId = ref<string|null>(null)
let undoTimer: ReturnType<typeof setTimeout>|null = null
const typeLabel: Record<string,string> = { feeding:'喂奶', sleep:'睡眠', diaper:'尿布', temperature:'体温', medicine:'用药', bath:'洗澡' }
function showUndo(log: RecordLog) {
  if(undoTimer) clearTimeout(undoTimer)
  undoLogId.value = log.id; undoMessage.value = `已记录 ${log.babyName} ${typeLabel[log.type]||log.type}`
  undoVisible.value = true; undoTimer = setTimeout(()=>{ undoVisible.value = false }, 3000)
}
function doUndo() {
  if(undoLogId.value){ recordsStore.removeLog(undoLogId.value); uni.showToast({title:'已撤销',icon:'none',duration:1500}) }
  undoVisible.value = false; if(undoTimer) clearTimeout(undoTimer)
}

// ---- 知识提示 ----
const knowledgeText = ref(''); const knowledgeVisible = ref(false)
const knowledgeShownTypes = ref<Set<string>>(new Set())
let knowledgeTimer: ReturnType<typeof setTimeout>|null = null
function showKnowledge(type: string) {
  if(knowledgeShownTypes.value.has(type)) return
  const tip = pickKnowledge(type)
  if(!tip) return
  knowledgeShownTypes.value = new Set([...knowledgeShownTypes.value, type])
  knowledgeText.value = tip; knowledgeVisible.value = true
  if(knowledgeTimer) clearTimeout(knowledgeTimer)
  knowledgeTimer = setTimeout(()=>{ knowledgeVisible.value = false }, 5000)
}
function closeKnowledge() { knowledgeVisible.value = false; if(knowledgeTimer) clearTimeout(knowledgeTimer) }

// ---- 时间线 ----
const recentLogs = computed(() => {
  const t0 = new Date().setHours(0,0,0,0)
  return recordsStore.logs.filter(l => l.createdAt >= t0).sort((a,b) => b.createdAt - a.createdAt).slice(0, 15)
})

// ---- 夜间模式 ----
const isNight = computed(() => { const h = new Date().getHours(); return h>=22 || h<6 })

// ---- TabBar ----
onShow(() => {
  try {
    const pages = getCurrentPages()
    const page = pages[pages.length-1]
    if ((page as any)?.getTabBar) {
      (page as any).getTabBar().setData({ selected: 1 })
    }
  } catch(_){}
})

onMounted(() => {
  uni.setNavigationBarTitle({ title: '记录' })
})
</script>

<style scoped>
.stamp-page {
  min-height: 100vh;
  background: var(--paper);
  padding: 32rpx 28rpx calc(100rpx + env(safe-area-inset-bottom));
}

/* === 空状态 === */
.empty-state { padding:160rpx 0; text-align:center; }
.empty-icon-row { display:flex; justify-content:center; gap:4rpx; margin-bottom:20rpx; }
.empty-emoji { font-size:80rpx; display:block; margin-bottom:20rpx; color:var(--dot); }
.empty-icon-row .empty-emoji { margin-bottom:0; }
.empty-title { display:block; font-family:var(--font-journal); font-size:36rpx; color:var(--ink); margin-bottom:8rpx; }
.empty-desc { font-size:26rpx; color:var(--ink-md); }

/* === 计时器覆盖层 === */
.animate-in { animation: fadeInScale 0.4s var(--ease-page) both; }
.timer-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding-top: 40rpx;
}
.timer-card {
  width: 100%;
  max-width: 480rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx 32rpx;
  border-radius: 28rpx;
  box-shadow: var(--shadow-layer-2);
}
.timer-card.amber { background: linear-gradient(160deg, var(--amber-lt), var(--cream)); border: 2rpx solid var(--amber); }
.timer-card.terracotta { background: linear-gradient(160deg, var(--terracotta-lt), var(--cream)); border: 2rpx solid var(--terracotta); }
.timer-face {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--cream);
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
  margin-bottom: 20rpx;
  animation: ringPulse 2.5s ease-in-out infinite;
}
.timer-emoji { font-size: 56rpx; }
.timer-name { font-family: var(--font-journal); font-size: var(--font-card); color: var(--ink); margin-bottom: 8rpx; }
.timer-elapsed { font-family: var(--font-journal); font-size: 64rpx; font-weight: 300; color: var(--ink); letter-spacing: 2rpx; }
.timer-poetic { font-size: 22rpx; color: var(--ink-md); margin-top: 8rpx; }

/* 喂养控制 */
.feed-ctrls { margin-top: 24rpx; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.fc-sides, .fc-amounts { display: flex; gap: 10rpx; }
.fc-chip {
  padding: 10rpx 20rpx; border-radius: 20rpx; font-size: 24rpx; color: var(--ink-md);
  background: var(--cream); border: 1.5rpx solid var(--dot);
  transition: all 0.15s var(--ease-stamp);
}
.fc-chip.on { background: var(--amber-lt); border-color: var(--amber); color: var(--amber); font-weight: 600; }

.timer-stop {
  margin-top: 32rpx; width: 100%; text-align: center;
  padding: 20rpx; background: var(--ink); color: var(--paper);
  border-radius: 24rpx; font-size: 28rpx; font-weight: 600;
}

/* 未计时宝宝卡片 */
.timer-idle-card {
  width: 100%; max-width: 480rpx; padding: 28rpx;
  background: var(--cream); border: 2rpx dashed var(--dot);
  border-radius: 20rpx; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
}
.idle-avatar { font-size: 40rpx; }
.idle-hint { font-size: 24rpx; color: var(--ink-md); }

/* 双计时器 */
.dual-timer { display:flex; flex-direction:column; align-items:center; gap:20rpx; padding-top:24rpx; }
.dual-cards { display:flex; gap:16rpx; width:100%; }
.dt-card {
  flex:1; display:flex; flex-direction:column; align-items:center;
  padding:28rpx 16rpx; border-radius:20rpx; box-shadow:var(--shadow-layer-1);
}
.dt-card.amber { background: linear-gradient(160deg, var(--amber-lt), var(--cream)); border: 2rpx solid var(--amber); }
.dt-card.terracotta { background: linear-gradient(160deg, var(--terracotta-lt), var(--cream)); border: 2rpx solid var(--terracotta); }
.dt-face { width:80rpx; height:80rpx; border-radius:50%; background:var(--cream); display:flex; align-items:center; justify-content:center; margin-bottom:12rpx; box-shadow:0 2rpx 12rpx rgba(0,0,0,0.06); }
.dt-emoji { font-size:36rpx; }
.dt-name { font-family:var(--font-journal); font-size:var(--font-body); color:var(--ink); }
.dt-elapsed { font-family:var(--font-journal); font-size:44rpx; font-weight:300; color:var(--ink); margin:8rpx 0; }
.dt-stop { padding:12rpx 32rpx; background:var(--ink); color:var(--paper); border-radius:16rpx; font-size:24rpx; }
.dt-all-stop { margin-top:8rpx; padding:14rpx 48rpx; background:var(--twin-danger); color:var(--cream); border-radius:24rpx; font-size:26rpx; }

/* === 双宝卡片 === */
.baby-cards { display:flex; gap:16rpx; margin-bottom:20rpx; }
.baby-card {
  flex:1; position:relative; overflow:hidden;
  display:flex; flex-direction:column; align-items:center;
  padding: 38rpx 16rpx 20rpx;
  /* 手撕纸不规则圆角 */
  border-radius: 28rpx 8rpx 28rpx 12rpx;
  box-shadow: var(--shadow-layer-2);
  transition: all 0.25s var(--ease-stamp);
  /* 水彩渐变底 */
  background:
    radial-gradient(ellipse 60% 50% at 35% 30%, var(--amber-lt) 0%, transparent 55%),
    var(--cream);
}
.baby-card:nth-child(2) {
  border-radius: 8rpx 28rpx 12rpx 28rpx;
  background:
    radial-gradient(ellipse 60% 50% at 65% 30%, var(--terracotta-lt) 0%, transparent 55%),
    var(--cream);
}
.baby-card.amber { border: 2rpx solid rgba(224,123,62,0.2); }
.baby-card.terracotta { border: 2rpx solid rgba(192,133,82,0.2); }

/* 卡片胶带 — 和纸撕裂边感 */
.card-tape {
  position: absolute; top: -6rpx; left: 50%; transform: translateX(-50%) rotate(-2deg);
  width: 68rpx; height: 18rpx;
  border-radius: 4rpx 1rpx 5rpx 2rpx;
  box-shadow: 0 1rpx 2rpx rgba(0,0,0,0.06);
}
.card-tape.tape-amber { background: linear-gradient(175deg, rgba(224,123,62,0.35), rgba(224,123,62,0.15)); }
.card-tape.tape-terracotta { background: linear-gradient(175deg, rgba(192,133,82,0.35), rgba(192,133,82,0.15)); transform: translateX(-50%) rotate(1.5deg); }

/* 选中印章后的卡片状态 — 暖色光晕 */
.baby-card.stamp-target { border-style: solid; cursor: pointer; }
.baby-card.stamp-target.amber { border-color: var(--amber); box-shadow: 0 0 0 6rpx rgba(224,123,62,0.1), var(--shadow-layer-2); }
.baby-card.stamp-target.terracotta { border-color: var(--terracotta); box-shadow: 0 0 0 6rpx rgba(192,133,82,0.1), var(--shadow-layer-2); }

/* 盖下瞬间 */
.baby-card.stamp-hit { transform: scale(0.94); }
.stamp-effect { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:10; pointer-events:none; animation: stampDown 0.5s var(--ease-stamp) both; }
.stamp-effect-icon { font-size: 100rpx; }

.card-avatar {
  width: 72rpx; height: 72rpx; border-radius: 50%; margin-bottom: 8rpx;
  border: 3rpx solid var(--cream);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}
.card-name {
  font-family: var(--font-journal);
  font-size: var(--font-card); color: var(--ink); font-weight: 600;
  margin-bottom: 6rpx;
}
.card-summary { display:flex; gap:8rpx; flex-wrap:wrap; justify-content:center; margin-top:4rpx; }
.cs-item {
  font-size:20rpx; color:var(--ink-md);
  background:var(--paper); padding:2rpx 8rpx; border-radius:6rpx;
  font-family: var(--font-journal);
}
/* 高频快捷 chips */
.card-chips { display:flex; gap:10rpx; margin-top:10rpx; justify-content:center; }
.card-chip {
  width:56rpx; height:56rpx; border-radius:50%;
  background:var(--cream);
  border:2rpx solid var(--dot);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 2rpx 6rpx rgba(0,0,0,0.05);
  transition:all 0.15s var(--ease-stamp);
}
.card-chip:active { transform:scale(0.88); background:var(--amber-lt); border-color:var(--amber); }
.card-chip-emoji { font-size:26rpx; }
.stamp-hint {
  margin-top:10rpx; display:flex; align-items:center; gap:6rpx;
  font-size:20rpx; color:var(--amber); font-weight:500;
  animation: subtleFloat 2s var(--ease-soft) infinite;
}
.stamp-hint-icon { font-size:24rpx; }

/* === 选中印章提示条 === */
.stamp-action-bar {
  display: flex; justify-content: center; align-items: center; gap: 16rpx;
  margin-bottom: 16rpx; padding: 10rpx 20rpx;
  background: var(--amber-lt); border-radius: 12rpx;
}
.sab-text { font-size: 24rpx; color: var(--amber); font-weight: 500; }
.sab-cancel { font-size: 22rpx; color: var(--ink-md); padding: 4rpx 12rpx; border-radius: 8rpx; border: 1rpx solid var(--dot); }

/* === 印章台 === */
.stamp-tray {
  display: flex; gap: 4rpx; justify-content: center;
  padding: 12rpx 6rpx 8rpx;
  background: linear-gradient(180deg, rgba(0,0,0,0.02), transparent 30%, var(--paper));
  border-radius: 16rpx;
  border: 1.5rpx solid var(--dot);
  box-shadow: var(--shadow-recess);
  margin-bottom: 16rpx;
}
.stamp-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx;
  padding: 8rpx 2rpx 6rpx; border-radius: 12rpx;
  transition: all 0.2s var(--ease-stamp);
  position: relative;
}
.stamp-item:active { transform: scale(0.94); }
.stamp-item.selected {
  transform: translateY(-8rpx) scale(1.06);
  background: transparent;
}
.stamp-item.dimmed { opacity: 0.4; transform: scale(0.92); }

/* 印章本体 — 手绘不规则感 */
.stamp-body {
  width: 68rpx; height: 68rpx;
  /* 非对称圆角：手刻印章的不规则边缘 */
  border-radius: 46% 54% 52% 48% / 48% 50% 54% 52%;
  background:
    /* 水彩晕染层 */
    radial-gradient(ellipse 55% 60% at 38% 42%, rgba(224,123,62,0.06) 0%, transparent 55%),
    radial-gradient(ellipse 40% 48% at 55% 38%, rgba(224,123,62,0.04) 0%, transparent 50%),
    /* 纸面底色 */
    var(--cream);
  display: flex; align-items: center; justify-content: center;
  /* 印章厚度：底层深色 + 投影 */
  box-shadow:
    0 2rpx 0 rgba(160,110,70,0.3),
    0 3rpx 8rpx rgba(0,0,0,0.08),
    0 1rpx 0 rgba(255,255,255,0.6) inset;
  position: relative;
  /* 微旋转：手工印章不会完全对齐 */
  transform: rotate(-1deg);
  transition: all 0.25s var(--ease-stamp);
}
/* 印章木质纹理 — 细微横纹 */
.stamp-body::before {
  content: '';
  position: absolute; inset: 4rpx; border-radius: inherit; z-index: 0; pointer-events: none;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 3rpx, rgba(0,0,0,0.015) 3rpx, rgba(0,0,0,0.015) 4rpx);
}
/* 印章墨迹 — 边缘不规则颜色积累 */
.stamp-body::after {
  content: '';
  position: absolute; inset: -1rpx; border-radius: inherit; z-index: -1; pointer-events: none;
  background:
    radial-gradient(ellipse 30% 50% at 15% 40%, rgba(224,123,62,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 25% 45% at 80% 55%, rgba(224,123,62,0.06) 0%, transparent 55%);
  opacity: 0.6;
}

/* 各印章颜色主题 */
.stamp-item:nth-child(1) .stamp-body { /* 喂奶 — amber */
  --stamp-ink: rgba(224,123,62,0.15);
  box-shadow: 0 2rpx 0 rgba(160,110,70,0.3), 0 3rpx 8rpx rgba(0,0,0,0.08), 0 1rpx 0 rgba(255,255,255,0.6) inset;
}
.stamp-item:nth-child(2) .stamp-body { /* 哄睡 — ink */
  background:
    radial-gradient(ellipse 50% 55% at 40% 45%, rgba(45,35,24,0.04) 0%, transparent 55%),
    var(--cream);
  box-shadow: 0 2rpx 0 rgba(60,50,40,0.3), 0 3rpx 8rpx rgba(0,0,0,0.06);
  transform: rotate(1.5deg);
}
.stamp-item:nth-child(3) .stamp-body { /* 尿布 — terracotta */
  background:
    radial-gradient(ellipse 55% 60% at 44% 40%, rgba(192,133,82,0.06) 0%, transparent 55%),
    var(--cream);
  box-shadow: 0 2rpx 0 rgba(150,100,65,0.3), 0 3rpx 8rpx rgba(0,0,0,0.06);
  transform: rotate(-2deg);
}
.stamp-item:nth-child(4) .stamp-body { /* 体温 — mint */
  background:
    radial-gradient(ellipse 50% 55% at 42% 45%, rgba(79,174,110,0.05) 0%, transparent 55%),
    var(--cream);
  box-shadow: 0 2rpx 0 rgba(70,140,95,0.3), 0 3rpx 8rpx rgba(0,0,0,0.06);
  transform: rotate(0.8deg);
}
.stamp-item:nth-child(5) .stamp-body { /* 用药 — gold */
  background:
    radial-gradient(ellipse 55% 60% at 40% 43%, rgba(200,153,62,0.06) 0%, transparent 55%),
    var(--cream);
  box-shadow: 0 2rpx 0 rgba(170,130,50,0.3), 0 3rpx 8rpx rgba(0,0,0,0.06);
  transform: rotate(-1.2deg);
}
.stamp-item:nth-child(6) .stamp-body { /* 洗澡 — 暖灰 */
  background:
    radial-gradient(ellipse 50% 55% at 45% 40%, rgba(156,142,124,0.05) 0%, transparent 55%),
    var(--cream);
  box-shadow: 0 2rpx 0 rgba(120,110,100,0.3), 0 3rpx 8rpx rgba(0,0,0,0.06);
  transform: rotate(1.8deg);
}

/* 选中态印章 */
.stamp-item.selected .stamp-body {
  box-shadow:
    0 0 0 3rpx rgba(224,123,62,0.2),
    0 4rpx 20rpx rgba(224,123,62,0.25),
    0 2rpx 0 rgba(160,110,70,0.4);
  transform: translateY(-2rpx) rotate(0deg);
}
.stamp-emoji {
  font-size: 30rpx;
  position: relative; z-index: 1;
  /* emoji 模拟印章墨迹不均匀感 */
  opacity: 0.75;
}
.stamp-item.selected .stamp-emoji { opacity: 1; }
.stamp-label { font-size: 20rpx; color: var(--ink-md); font-weight: 500; }
.stamp-item.selected .stamp-label { color: var(--amber); font-weight: 700; }

/* === 快速双记 === */
.dual-quick { display:flex; gap:12rpx; justify-content:center; margin-bottom:20rpx; }
.dq-chip {
  padding: 12rpx 24rpx; border-radius: 20rpx;
  font-size: 24rpx; color: var(--ink); font-weight: 500;
  background: var(--cream); border: 1.5rpx solid var(--dot);
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.03);
  transition: all 0.15s var(--ease-stamp);
}
.dq-chip:active { transform: scale(0.95); background: var(--amber-lt); border-color: var(--amber); }

/* === 时间线 === */
.timeline { padding: 0 4rpx; }
.tl-title { font-family: var(--font-journal); font-size: var(--font-body); color: var(--ink); font-weight: 700; margin-bottom: 14rpx; display:block; }
.tl-item { display:flex; align-items:center; gap:12rpx; padding:10rpx 0; border-bottom:1rpx dotted var(--dot); }
.tl-dot { width:14rpx; height:14rpx; border-radius:50%; flex-shrink:0; }
.tl-dot.dot-a { background: var(--amber); }
.tl-dot.dot-b { background: var(--terracotta); }
.tl-detail { flex:1; font-size:24rpx; color:var(--ink); line-height:1.4; }
.tl-time { font-size:20rpx; color:var(--ink-lt); flex-shrink:0; }

/* === 撤销条 === */
.undo-bar {
  position: fixed; bottom: calc(100rpx + env(safe-area-inset-bottom) + 8rpx);
  left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 16rpx;
  padding: 14rpx 28rpx;
  background: var(--ink); color: var(--paper);
  border-radius: 28rpx; font-size: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
  z-index: 200;
  animation: slideInRight 0.35s var(--ease-page) both;
}
.undo-link { color: var(--amber); font-weight: 700; }

/* === 贴纸弹出 === */
.sticker-pop {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  z-index: 300; pointer-events: none;
}
.sticker-pop-emoji {
  font-size: 96rpx; opacity: 0.8;
  animation: stickerPopBounce 0.7s var(--ease-bounce) both;
}

/* === 知识提示 === */
.knowledge-card {
  position: fixed; bottom: calc(120rpx + env(safe-area-inset-bottom));
  left: 28rpx; right: 28rpx;
  padding: 16rpx 20rpx;
  background: var(--cream); border: 1.5rpx solid var(--dot);
  border-radius: 14rpx; box-shadow: var(--shadow-layer-1);
  z-index: 150; display: flex; align-items: center; gap: 12rpx;
  animation: slideInRight 0.4s var(--ease-page) both;
}
.knowledge-text { flex:1; font-size:22rpx; color:var(--ink); line-height:1.5; }
.knowledge-close { font-size:28rpx; color:var(--ink-md); padding:4rpx; }

@keyframes ringPulse {
  0%,100% { box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); }
  50% { box-shadow: 0 4rpx 30rpx rgba(224,123,62,0.2); }
}

/* === 暗色模式 === */
.theme-dark .stamp-page { background: var(--ink); }
.theme-dark .stamp-item { background: transparent; }
.theme-dark .stamp-body { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
.theme-dark .dq-chip { background: rgba(255,255,255,0.04); }
</style>
