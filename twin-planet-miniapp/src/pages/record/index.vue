<!-- 双宝手帐 · 记录页 v8 · Stamp Press -->
<template>
  <view class="record-page">
    <view class="bg-spot spot-a" /><view class="bg-spot spot-b" />
    <view v-if="stickerShow && !isGrandma" class="sticker-pop"><text class="sticker-pop-emoji">{{ stickerEmoji }}</text></view>

    <!-- 奶奶确认弹窗 -->
    <view v-if="grannyConfirm" class="granny-confirm" @click="grannyConfirm=false">
      <view class="granny-confirm-card">
        <text class="granny-confirm-icon">✅</text>
        <text class="granny-confirm-text">{{ grannyConfirmText }}</text>
        <text class="granny-confirm-hint">轻触任意位置关闭</text>
      </view>
    </view>

    <!-- IDLE: 奶奶模式 — 极简3按钮 -->
    <template v-if="!recordsStore.isRunning && isGrandma">
      <view class="granny-record">
        <text class="granny-record-title">记录 {{ selBabyName || '宝宝' }}</text>
        <view class="granny-baby-switch" v-if="twins.length >= 2">
          <view class="granny-switch-btn" :class="{ on: sel===twins[0]?.id }" @click="sel=twins[0]?.id">
            {{ twins[0]?.nickname || '大宝' }}
          </view>
          <view class="granny-switch-btn" :class="{ on: sel===twins[1]?.id }" @click="sel=twins[1]?.id">
            {{ twins[1]?.nickname || '二宝' }}
          </view>
        </view>
        <view class="granny-actions">
          <view class="granny-record-btn" @click="doAction('feeding')">
            <text class="granny-btn-emoji">🍼</text>
            <text class="granny-btn-label">吃奶了</text>
          </view>
          <view class="granny-record-btn" @click="doAction('sleep')">
            <text class="granny-btn-emoji">😴</text>
            <text class="granny-btn-label">睡觉了</text>
          </view>
          <view class="granny-record-btn" @click="doAction('diaper')">
            <text class="granny-btn-emoji">🧷</text>
            <text class="granny-btn-label">换尿布</text>
          </view>
        </view>
      </view>
    </template>

    <!-- IDLE: 标准模式 -->
    <template v-if="!recordsStore.isRunning && !isGrandma">
      <view class="baby-tabs">
        <view class="baby-tab" v-for="(t,i) in twins" :key="t.id"
          :class="{ active: sel===t.id, 'tab-a':i===0, 'tab-b':i===1 }" @click="sel=t.id">
          <text class="tab-emoji">{{ i===0 ? '😋' : '😴' }}</text>
          <text class="tab-name">{{ t.nickname || t.name }}</text>
          <text class="tab-check" v-if="sel===t.id">✓</text>
        </view>
      </view>

      <view class="stamp-grid">
        <view v-for="(a,i) in actions" :key="a.type" class="stamp-btn"
          :class="{ 'stamp-primary': i===0, 'stamp-secondary': i===1, 'stamp-small': i>=4 }"
          @click="doAction(a.type)">
          <text class="stamp-emoji">{{ a.emoji }}</text>
          <text class="stamp-label">{{ a.label }}</text>
        </view>
      </view>

      <view class="dual-row" v-if="twins.length>=2">
        <view class="dual-chip dual-primary" @click="dualLog('feeding')">两个都喂了</view>
        <view class="dual-chip" @click="dualLog('sleep')">都睡了</view>
      </view>

      <!-- 夜间快速记录 -->
      <view class="night-quick" v-if="isNight">
        <view class="night-btn" @click="quickNight">
          <text>🌙 半夜了，点这里快速记录</text>
          <text class="night-sub">不选类型，记一笔就好</text>
        </view>
      </view>

      <!-- 撤销提示 -->
      <view class="undo-bar" v-if="showUndo" @click="doUndo">
        <text>↩ 撤销刚才的记录</text>
      </view>

      <view class="retro-note">
        <text class="retro-dash">--</text>
        <text class="retro-label">刚才忘了？</text>
        <view class="retro-type-row">
          <text v-for="a in retroActions" :key="a.type" class="retro-type-dot" :class="{ on: retroType===a.type }" @click="retroType=a.type">{{ a.emoji }}</text>
        </view>
        <view class="retro-times">
          <text v-for="m in [5,10,20,30]" :key="m" class="retro-min" @click="retro(m)">{{ m }}分前</text>
        </view>
      </view>
    </template>

    <!-- SINGLE TIMER -->
    <template v-if="recordsStore.runningTimers.length===1">
      <view class="timer-hero">
        <view class="hero-face" :class="runningTwin==='a'?'bg-a':'bg-b'">
          <text class="hero-emoji">{{ runningTwin==='a'?'😋':'😴' }}</text>
        </view>
        <text class="hero-baby-name">{{ runningName }}</text>
        <text class="hero-phase">{{ poeticLabel }}</text>
        <view class="hero-clock">
          <text class="clock-min">{{ formatElapsed(runningElapsed).split(':')[0] }}</text>
          <text class="clock-sep">:</text>
          <text class="clock-sec">{{ formatElapsed(runningElapsed).split(':')[1] }}</text>
        </view>
        <button class="end-btn" @click="stopOne(recordsStore.runningTimer?.babyId)">停止记录</button>
      </view>
    </template>

    <!-- DUAL TIMER -->
    <template v-if="recordsStore.runningTimers.length>=2">
      <view class="dual-zone">
        <view class="dual-card" v-for="t in recordsStore.runningTimers" :key="t.babyId"
          :class="t.babyId===twins[0]?.id?'dc-a':'dc-b'">
          <view class="dc-face" :class="t.babyId===twins[0]?.id?'bg-a':'bg-b'">
            <text class="dc-emoji">{{ t.babyId===twins[0]?.id?'😋':'😴' }}</text>
          </view>
          <text class="dc-name">{{ getName(t.babyId) }}</text>
          <text class="dc-time">{{ formatElapsed(t.elapsed) }}</text>
          <view class="dc-stop" @click="stopOne(t.babyId)"><text>停</text></view>
        </view>
      </view>
      <button class="stop-all" @click="stopAll">全部停止</button>
    </template>

    <view class="timeline" v-if="recentLogs.length && !recordsStore.isRunning">
      <text class="tl-section">今天</text>
      <view class="tl-item" v-for="l in recentLogs.slice(0,12)" :key="l.id">
        <view class="tl-dot" :style="{background:l.babyId===twins[0]?.id?'var(--amber)':'var(--rose)'}" />
        <text class="tl-text">{{ l.detail }}</text>
        <text class="tl-when">{{ timeAgo(l.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {computed,ref,onMounted,onUnmounted,watch} from 'vue'
import {onShow} from '@dcloudio/uni-app'
import { onShareAppMessage } from '@dcloudio/uni-app'
import {useBabiesStore} from '@/stores/babies'
import {useRecordsStore,type RecordType} from '@/stores/records'
import {useUserStore} from '@/stores/user'
import {timeAgo, formatElapsed} from '@/utils/format'
import {useHaptic} from '@/composables/useHaptic'
import {usePoeticTime} from '@/composables/usePoeticTime'
import {useStickersStore} from '@/stores/stickers'
import {useStickerSync} from '@/composables/useStickerSync'
// import {trackRecordCreated} from '@/utils/analytics'
const babiesStore=useBabiesStore();const recordsStore=useRecordsStore();const stickersStore=useStickersStore();const userStore=useUserStore();const {syncStickers}=useStickerSync();const sel=ref('')
// 奶奶模式
const isGrandma=computed(()=>userStore.isGrandmaMode)
const selBabyName=computed(()=>{const id=sel.value;const b=twins.value.find(t=>t.id===id);return b?.nickname||b?.name||''})
const actions=[{type:'feeding',emoji:'🍼',label:'喂奶'},{type:'sleep',emoji:'😴',label:'睡觉'},{type:'diaper',emoji:'🧷',label:'尿布'},{type:'temperature',emoji:'🌡️',label:'体温'},{type:'medicine',emoji:'💊',label:'用药'},{type:'bath',emoji:'🛁',label:'洗澡'}]
const retroActions=actions.slice(0,4)
const haptic=useHaptic()
const isNight=computed(()=>{const h=new Date().getHours();return h>=22||h<6})

const stickerShow=ref(false);const stickerEmoji=ref('⭐')
let stickerTimer:ReturnType<typeof setTimeout>|null=null
function popSticker(emoji:string){if(stickerTimer)clearTimeout(stickerTimer);stickerEmoji.value=emoji;stickerShow.value=true;stickerTimer=setTimeout(()=>{stickerShow.value=false},750)}

// 撤销：最近30秒内的记录可撤销
const showUndo=ref(false);let undoTimer:ReturnType<typeof setTimeout>|null=null
function showUndoBar(){showUndo.value=true;if(undoTimer)clearTimeout(undoTimer);undoTimer=setTimeout(()=>{showUndo.value=false},30000)}
function doUndo(){const log=recordsStore.undoLastLog();if(log){showUndo.value=false;uni.showToast({title:'已撤销',icon:'success',duration:1000})}}

// 🔧 tick 由 recordsStore._tick 全局管理，页面不再维护独立 interval
watch(()=>recordsStore.isRunning,r=>{if(r){haptic.heartbeatStart()}else{haptic.heartbeatStop()}},{immediate:true})
onUnmounted(()=>{haptic.heartbeatStop();if(stickerTimer)clearTimeout(stickerTimer)})
const runningElapsed=computed(()=>recordsStore.runningTimer?.elapsed??0)
const runningName=computed(()=>{const t=recordsStore.runningTimer;return t?getName(t.babyId):''})
const runningTwin=computed(()=>(recordsStore.runningTimer?.babyId===twins.value[0]?.id?'a':'b')as'a'|'b')
const timerType=computed(()=>recordsStore.runningTimer?.type as 'feeding'|'sleep'|undefined)
const elapsedRef=computed(()=>runningElapsed.value)
const {label:poeticLabel}=usePoeticTime(elapsedRef,timerType)

function getName(id:string){return twins.value.find(b=>b.id===id)?.nickname||''}
function doAction(t:RecordType){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  if(t==='feeding'||t==='sleep'){
    recordsStore.startTimer(id,t);haptic.thump()
    if(isGrandma.value){
      const nm=selBabyName.value
      showGrannyConfirm(nm+' '+(t==='feeding'?'吃奶了 ⏱️':'睡觉了 ⏱️'))
    }else{popSticker(t==='feeding'?'🍼':'😴')}
  }else{
    recordsStore.quickLog(id,t);haptic.sparkle();syncStickers();showUndoBar();trackRecordCreated(t,'quick')
    if(isGrandma.value){
      const nm=selBabyName.value
      const lb={diaper:'换尿布',temperature:'量体温',medicine:'吃药',bath:'洗澡'}
      showGrannyConfirm(nm+' '+(lb[t]||'记录')+' ✅')
    }else{
      const m={diaper:'🧷',temperature:'🌡️',medicine:'💊',bath:'🛁'}
      popSticker(m[t]||'⭐')
    }
  }
}
function quickNight(){const id=sel.value||twins.value[0]?.id;if(!id)return;recordsStore.quickLog(id,'feeding');haptic.sparkle();syncStickers();showUndoBar();trackRecordCreated('feeding','quick');popSticker('🌙')}
function dualLog(t:RecordType){const a=twins.value[0],b=twins.value[1];if(a)recordsStore.quickLog(a.id,t);if(b)recordsStore.quickLog(b.id,t);haptic.doubleBeat();syncStickers();showUndoBar();trackRecordCreated(t,"dual");popSticker('🔗')}
const retroType=ref<RecordType>('feeding')
function retro(m:number){const id=sel.value||twins.value[0]?.id;if(!id)return;recordsStore.quickLog(id,retroType.value,undefined,m*60000);haptic.sparkle();syncStickers();showUndoBar();trackRecordCreated(retroType.value,"retro");popSticker('⏰')}
	const todayStart=computed(()=>new Date().setHours(0,0,0,0))
	const recentLogs=computed(()=>{const t0=todayStart.value;return recordsStore.logs.filter(l=>l.createdAt>=t0).sort((a,b)=>b.createdAt-a.createdAt)})
	onMounted(()=>{uni.setNavigationBarTitle({title:"记录"});if(twins.value[0])sel.value=twins.value[0].id})
onShow(()=>{if(twins.value[0]&&!sel.value)sel.value=twins.value[0].id})
</script>

<style scoped>
.record-page{min-height:100vh;background:var(--paper);padding:36rpx 28rpx calc(80rpx + env(safe-area-inset-bottom));position:relative}
.bg-spot{position:absolute;pointer-events:none;z-index:0;border-radius:50%}
.spot-a{width:420rpx;height:420rpx;top:80rpx;right:-160rpx;background:radial-gradient(circle,rgba(212,128,104,0.03) 0%,transparent 60%)}
.spot-b{width:360rpx;height:360rpx;bottom:180rpx;left:-140rpx;background:radial-gradient(circle,rgba(224,123,62,0.03) 0%,transparent 60%)}
.sticker-pop{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);z-index:99;pointer-events:none}
.sticker-pop-emoji{font-size:128rpx;animation:stampPop .75s var(--ease-bounce) forwards}
@keyframes stampPop{0%{transform:scale(.2)rotate(-12deg);opacity:0}55%{transform:scale(1.25)rotate(3deg);opacity:1}100%{transform:scale(1)rotate(0);opacity:0}}

.baby-tabs{display:flex;gap:0;margin-bottom:32rpx;position:relative;z-index:1}
.baby-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:8rpx;padding:20rpx;border-radius:20rpx 20rpx 0 0;opacity:.45;transition:opacity .2s,border-color .2s;border-bottom:3rpx solid transparent}
.baby-tab.active{opacity:1}.baby-tab.tab-a.active{border-bottom-color:var(--amber);background:linear-gradient(to top,var(--amber-lt),transparent 60%)}.baby-tab.tab-b.active{border-bottom-color:var(--rose);background:linear-gradient(to top,var(--rose-lt),transparent 60%)}.tab-emoji{font-size:40rpx;transition:transform .3s var(--ease-bounce)}.baby-tab:active .tab-emoji{transform:scale(1.2)}.tab-name{font-family:var(--font-journal);font-size:26rpx;font-weight:700;color:var(--ink)}.tab-check{font-size:20rpx;color:var(--mint)}

.stamp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10rpx;margin-bottom:20rpx;position:relative;z-index:1}
.stamp-btn{display:flex;flex-direction:column;align-items:center;gap:6rpx;padding:28rpx 8rpx;background:var(--cream);border:2rpx solid var(--dot);border-radius:20rpx;transition:transform .15s var(--ease-bounce),border-color .2s,background .2s}
.stamp-btn:active{transform:scale(.9);border-color:var(--amber);background:var(--amber-lt)}.stamp-btn.stamp-primary{padding:32rpx 8rpx}.stamp-btn.stamp-secondary{padding:30rpx 8rpx}.stamp-btn.stamp-small{padding:22rpx 8rpx}.stamp-emoji{font-size:36rpx;transition:transform .3s var(--ease-bounce)}.stamp-primary .stamp-emoji{font-size:44rpx}.stamp-secondary .stamp-emoji{font-size:40rpx}.stamp-small .stamp-emoji{font-size:30rpx}.stamp-btn:active .stamp-emoji{transform:scale(1.3)}.stamp-label{font-size:24rpx;font-weight:600;color:var(--ink)}.stamp-primary .stamp-label{font-size:28rpx}.stamp-small .stamp-label{font-size:20rpx;color:var(--ink-md)}

.dual-row{display:flex;gap:10rpx;margin-bottom:20rpx;position:relative;z-index:1;align-items:center}.dual-chip{flex:1;text-align:center;padding:14rpx 8rpx;background:var(--cream);border:1.5px solid var(--dot);border-radius:24rpx;font-size:22rpx;color:var(--ink-md);font-weight:600;transition:transform .15s var(--ease-bounce)}.dual-chip:active{transform:scale(.93);border-color:var(--amber);color:var(--amber)}.dual-primary{padding:18rpx 12rpx;font-size:26rpx;background:var(--amber-lt);border-color:var(--amber);color:var(--amber)}.dual-chip:not(.dual-primary){font-size:20rpx}

.night-quick{text-align:center;margin-bottom:16rpx;position:relative;z-index:1}.night-btn{display:inline-block;padding:20rpx 40rpx;background:linear-gradient(135deg,rgba(45,35,24,0.03),rgba(45,35,24,0.06));border:2rpx solid var(--dot);border-radius:28rpx;font-size:26rpx;color:var(--ink-md)}.night-btn:active{background:var(--amber-lt);border-color:var(--amber)}.night-sub{display:block;font-size:20rpx;color:var(--ink-lt);margin-top:4rpx}

.undo-bar{text-align:center;padding:16rpx;margin-bottom:12rpx;position:relative;z-index:1;font-size:26rpx;color:var(--mint);font-weight:600}.undo-bar:active{opacity:.7}

.retro-note{display:flex;align-items:center;gap:10rpx;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;padding:8rpx 0}.retro-dash{color:var(--ink-lt);font-size:20rpx;opacity:.5}.retro-label{font-size:22rpx;color:var(--ink-lt)}.retro-type-row{display:flex;gap:6rpx}.retro-type-dot{width:44rpx;height:44rpx;display:flex;align-items:center;justify-content:center;font-size:24rpx;border-radius:50%;background:var(--cream);border:1.5px solid var(--dot);transition:border-color .2s,background .2s}.retro-type-dot:active{transform:scale(.85)}.retro-type-dot.on{border-color:var(--amber);background:var(--amber-lt)}.retro-times{display:flex;gap:6rpx}.retro-min{padding:6rpx 14rpx;font-size:20rpx;color:var(--ink-lt);background:var(--cream);border:1px solid var(--dot);border-radius:16rpx;transition:transform .15s var(--ease-bounce)}.retro-min:active{transform:scale(.9);border-color:var(--amber)}

.timer-hero{display:flex;flex-direction:column;align-items:center;padding:48rpx 0;position:relative;z-index:1}.hero-face{width:220rpx;height:220rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20rpx}.hero-face.bg-a{background:var(--amber-md)}.hero-face.bg-b{background:var(--rose-md)}.hero-emoji{font-size:108rpx;animation:faceRock 3s ease-in-out infinite}@keyframes faceRock{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}.hero-baby-name{font-family:var(--font-journal);font-size:40rpx;color:var(--ink)}.hero-phase{font-size:28rpx;color:var(--mint);margin-top:4rpx;font-weight:600}.hero-clock{display:flex;align-items:baseline;margin-top:8rpx;gap:0}.clock-min{font-family:var(--font-journal);font-size:72rpx;color:var(--ink);letter-spacing:4rpx}.clock-sep{font-size:40rpx;color:var(--ink-lt);margin:0 4rpx;animation:sepBlink 1s step-end infinite}@keyframes sepBlink{0%,100%{opacity:1}50%{opacity:.2}}.clock-sec{font-family:var(--font-journal);font-size:48rpx;color:var(--ink-md)}.end-btn{margin-top:28rpx;padding:18rpx 48rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:28rpx;color:var(--twin-danger);font-size:28rpx;font-weight:600;transition:transform .15s var(--ease-bounce)}.end-btn:active{transform:scale(.94);background:rgba(212,112,107,.06)}

.dual-zone{display:flex;gap:12rpx;margin-bottom:12rpx;position:relative;z-index:1}.dual-card{flex:1;display:flex;flex-direction:column;align-items:center;gap:10rpx;padding:20rpx 8rpx;border-radius:24rpx}.dual-card.dc-a{background:var(--amber-lt);border:2rpx solid rgba(224,123,62,.1)}.dual-card.dc-b{background:var(--rose-lt);border:2rpx solid rgba(212,128,104,.1)}.dc-face{width:96rpx;height:96rpx;border-radius:50%;display:flex;align-items:center;justify-content:center}.dc-face.bg-a{background:var(--amber-md)}.dc-face.bg-b{background:var(--rose-md)}.dc-emoji{font-size:48rpx;animation:faceRock 3s ease-in-out infinite}.dc-name{font-family:var(--font-journal);font-size:24rpx;font-weight:700;color:var(--ink)}.dc-time{font-family:var(--font-journal);font-size:36rpx;color:var(--ink);letter-spacing:2rpx}.dc-stop{padding:6rpx 20rpx;border-radius:16rpx;border:1.5px solid var(--twin-danger);font-size:20rpx;color:var(--twin-danger)}.dc-stop:active{background:rgba(212,112,107,.06)}.stop-all{width:100%;padding:16rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:24rpx;font-size:28rpx;font-weight:600;color:var(--twin-danger);position:relative;z-index:1}

.timeline{padding-top:16rpx;position:relative;z-index:1}.tl-section{display:block;font-family:var(--font-journal);font-size:22rpx;color:var(--ink-lt);font-weight:600;margin-bottom:10rpx;padding-left:2rpx}.tl-item{display:flex;align-items:center;gap:12rpx;padding:10rpx 0}.tl-dot{width:7rpx;height:7rpx;border-radius:50%;flex-shrink:0}.tl-text{flex:1;font-size:26rpx;color:var(--ink)}.tl-when{flex-shrink:0;font-size:20rpx;color:var(--ink-lt)}

/* 奶奶大反馈弹窗 */
.granny-confirm{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(45,35,24,.3);display:flex;align-items:center;justify-content:center;z-index:999}
.granny-confirm-card{background:var(--paper);border-radius:var(--radius-lg);padding:64rpx 56rpx;text-align:center;margin:0 48rpx;box-shadow:0 12rpx 40rpx rgba(0,0,0,.12);animation:celebBounce .4s var(--ease-bounce)}
.granny-confirm-icon{font-size:100rpx;display:block;margin-bottom:16rpx}
.granny-confirm-text{display:block;font-family:var(--font-journal);font-size:48rpx;color:var(--ink);font-weight:700;margin-bottom:16rpx}
.granny-confirm-hint{font-size:28rpx;color:var(--ink-lt)}

/* 奶奶模式 — 极简3按钮 */
.granny-record {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  position: relative;
  z-index: 1;
}
.granny-record-title {
  font-family: var(--font-journal);
  font-size: 56rpx;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 32rpx;
}
.granny-baby-switch {
  display: flex;
  gap: 24rpx;
  margin-bottom: 64rpx;
}
.granny-switch-btn {
  padding: 24rpx 48rpx;
  border-radius: var(--radius-md);
  font-size: 40rpx;
  font-weight: 700;
  background: var(--cream);
  color: var(--ink-md);
  border: 4rpx solid var(--dot);
  transition: all .2s;
}
.granny-switch-btn.on {
  border-color: var(--amber);
  color: var(--amber);
  background: var(--amber-lt);
}
.granny-actions {
  display: flex;
  flex-direction: column;
  gap: 56rpx;
  width: 100%;
  max-width: 560rpx;
}
.granny-record-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 56rpx 0;
  background: var(--cream);
  border: 4rpx solid var(--dot);
  border-radius: var(--radius-lg);
  transition: transform .15s;
}
.granny-record-btn:active {
  transform: scale(.95);
  border-color: var(--amber);
  background: var(--amber-lt);
}
.granny-btn-emoji {
  font-size: 96rpx;
}
.granny-btn-label {
  font-family: var(--font-journal);
  font-size: 48rpx;
  font-weight: 700;
  color: var(--ink);
}
</style>
