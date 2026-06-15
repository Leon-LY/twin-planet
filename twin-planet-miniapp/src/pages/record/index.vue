<!-- 双宝手帐 · 记录页 v9 · 上下文优先，计时可选 -->
<template>
  <view class="record-page journal-paper page-enter">
    <view class="bg-spot spot-a" /><view class="bg-spot spot-b" />
    <view v-if="stickerShow" class="sticker-pop"><text class="sticker-pop-emoji">{{ stickerEmoji }}</text></view>

    <!-- 无宝宝 -->
    <template v-if="!twins.length">
      <view class="empty-state">
        <text class="empty-emoji">👶👶</text>
        <text class="empty-title">还没有添加宝宝</text>
        <text class="empty-desc">先添加宝宝，才能开始记录哦~</text>
      </view>
    </template>

    <!-- ===== IDLE ===== -->
    <template v-else-if="!recordsStore.isRunning">
      <!-- 宝宝选择 -->
      <view class="baby-tabs">
        <view class="baby-tab" v-for="(t,i) in twins" :key="t.id"
          :class="{ active: sel===t.id, 'tab-a':i===0, 'tab-b':i===1 }" @click="sel=t.id">
          <text class="tab-emoji">{{ i===0 ? '😋' : '😴' }}</text>
          <text class="tab-name">{{ t.nickname || t.name }}</text>
          <text class="tab-check" v-if="sel===t.id">✓</text>
        </view>
      </view>

      <!-- 计时型操作：喂奶 + 睡觉（大按钮） -->
      <view class="section-label">⏱ 计时记录</view>
      <view class="timer-actions">
        <view class="ta-btn ta-feed" @click="openPanel('feeding')">
          <text class="ta-emoji">🍼</text>
          <text class="ta-label">喂奶</text>
        </view>
        <view class="ta-btn ta-sleep" @click="doStartSleep">
          <text class="ta-emoji">😴</text>
          <text class="ta-label">睡觉</text>
        </view>
      </view>

      <!-- 即时型操作：尿布/体温/用药/洗澡（小按钮） -->
      <view class="section-label">⚡ 快速记录</view>
      <view class="quick-actions">
        <view class="qa-btn" @click="openPanel('diaper')">
          <text class="qa-emoji">🧷</text><text class="qa-label">尿布</text>
        </view>
        <view class="qa-btn" @click="openPanel('temperature')">
          <text class="qa-emoji">🌡️</text><text class="qa-label">体温</text>
        </view>
        <view class="qa-btn" @click="openPanel('medicine')">
          <text class="qa-emoji">💊</text><text class="qa-label">用药</text>
        </view>
        <view class="qa-btn" @click="doQuickBath">
          <text class="qa-emoji">🛁</text><text class="qa-label">洗澡</text>
        </view>
      </view>

      <!-- 上下文面板：喂奶 -->
      <view class="ctx-panel journal-card" v-if="panelType==='feeding'">
        <view class="journal-tape tape-amber" />
        <text class="ctx-title">喂奶详情</text>
        <view class="ctx-row">
          <text class="ctx-chip" :class="{on:feedSide==='left'}" @click="feedSide='left'">左</text>
          <text class="ctx-chip" :class="{on:feedSide==='right'}" @click="feedSide='right'">右</text>
          <text class="ctx-chip" :class="{on:feedSide==='bottle'}" @click="feedSide='bottle'">🍼 瓶喂</text>
        </view>
        <view class="ctx-row" v-if="feedSide==='bottle'">
          <text class="ctx-chip sm" :class="{on:feedAmount===60}" @click="feedAmount=60">60ml</text>
          <text class="ctx-chip sm" :class="{on:feedAmount===90}" @click="feedAmount=90">90ml</text>
          <text class="ctx-chip sm" :class="{on:feedAmount===120}" @click="feedAmount=120">120ml</text>
          <text class="ctx-chip sm" :class="{on:feedAmount===150}" @click="feedAmount=150">150ml</text>
          <text class="ctx-chip sm" :class="{on:feedAmount===180}" @click="feedAmount=180">180ml</text>
        </view>
        <view class="ctx-actions">
          <view class="ctx-btn secondary" @click="doStartTimer('feeding')">开始计时</view>
          <view class="ctx-btn primary" @click="doFeedNow">直接记录</view>
        </view>
        <view class="ctx-close" @click="closePanel">✕</view>
      </view>

      <!-- 上下文面板：尿布 -->
      <view class="ctx-panel" v-if="panelType==='diaper'">
        <text class="ctx-title">换尿布</text>
        <view class="ctx-row">
          <text class="ctx-chip lg" :class="{on:diaperType==='wet'}" @click="doDiaperQuick('wet')">💧 小便</text>
          <text class="ctx-chip lg" :class="{on:diaperType==='dirty'}" @click="doDiaperQuick('dirty')">💩 大便</text>
          <text class="ctx-chip lg" :class="{on:diaperType==='both'}" @click="doDiaperQuick('both')">💧💩 都有</text>
        </view>
        <view class="ctx-close" @click="closePanel">✕</view>
      </view>

      <!-- 上下文面板：体温 -->
      <view class="ctx-panel" v-if="panelType==='temperature'">
        <text class="ctx-title">体温测量</text>
        <view class="ctx-row">
          <text class="ctx-chip sm" v-for="v in tempPresets" :key="v"
            :class="{on:tempValue===v}" @click="tempValue=v">{{ v }}°C</text>
        </view>
        <view class="ctx-actions">
          <view class="ctx-btn primary" @click="doTempQuick">记录</view>
        </view>
        <view class="ctx-close" @click="closePanel">✕</view>
      </view>

      <!-- 上下文面板：用药 -->
      <view class="ctx-panel" v-if="panelType==='medicine'">
        <text class="ctx-title">用药记录</text>
        <view class="ctx-row wrap">
          <text class="ctx-chip sm" v-for="m in medPresets" :key="m"
            :class="{on:medName===m}" @click="medName=m">{{ m }}</text>
        </view>
        <view class="ctx-input-row">
          <input class="ctx-input" v-model="medName" placeholder="药名（如布洛芬）" />
          <input class="ctx-input sm-input" v-model="medDosage" placeholder="剂量（如2.5ml）" />
        </view>
        <view class="ctx-actions">
          <view class="ctx-btn primary" @click="doMedQuick">记录</view>
        </view>
        <view class="ctx-close" @click="closePanel">✕</view>
      </view>

      <!-- 双胞胎快捷记录 -->
      <view class="dual-row" v-if="twins.length>=2">
        <view class="dual-chip dual-primary" @click="dualLog('feeding')">两个都喂了</view>
        <view class="dual-chip" @click="dualLog('sleep')">都睡了</view>
      </view>

      <!-- 夜间快速记录 -->
      <view class="night-quick" v-if="isNight">
        <text class="night-label">🌙 夜间快速记录</text>
        <view class="night-row">
          <view class="night-chip" @click="quickNight('feeding')">🍼 喂奶</view>
          <view class="night-chip" @click="quickNight('diaper')">🧷 尿布</view>
          <view class="night-chip" @click="quickNight('sleep')">😴 哄睡</view>
        </view>
      </view>

      <!-- 回溯记录 -->
      <view class="retro-note">
        <text class="retro-dash">--</text>
        <text class="retro-label">刚才忘了？</text>
        <view class="retro-presets">
          <text class="retro-chip" @click="retro(5,'feeding')">🍼 5分前</text>
          <text class="retro-chip" @click="retro(10,'feeding')">🍼 10分前</text>
          <text class="retro-chip" @click="retro(20,'diaper')">🧷 20分前</text>
          <text class="retro-chip" @click="retro(15,'sleep')">😴 15分前</text>
        </view>
      </view>
    </template>

    <!-- ===== SINGLE TIMER ===== -->
    <template v-if="recordsStore.runningTimers.length===1">
      <view class="timer-hero">
        <view class="hero-face" :class="runningTwin==='a'?'bg-a':'bg-b'">
          <text class="hero-emoji">{{ runningTwin==='a'?'😋':'😴' }}</text>
        </view>
        <text class="hero-baby-name">{{ runningName }}</text>
        <!-- 上下文信息（比时钟更突出） -->
        <view class="hero-ctx">
          <text v-if="timerType==='feeding' && feedSide" class="hero-side">
            {{ feedSide==='left'?'左':feedSide==='right'?'右':'瓶喂' }}
          </text>
          <text v-if="timerType==='feeding' && feedAmount" class="hero-amount">{{ feedAmount }}ml</text>
          <text v-if="timerType==='sleep'" class="hero-side">💤</text>
        </view>
        <!-- 时钟：小而安静 -->
        <view class="hero-clock">
          <text class="clock-elapsed">{{ formatElapsed(runningElapsed) }}</text>
        </view>
        <text class="hero-phase">{{ poeticLabel }}</text>
        <!-- 喂奶计时中：侧别+奶量选择 -->
        <view class="feed-controls" v-if="timerType==='feeding'">
          <view class="feed-sides">
            <text class="feed-side" :class="{on:feedSide==='left'}" @click="setFeedSide('left')">左</text>
            <text class="feed-side" :class="{on:feedSide==='right'}" @click="setFeedSide('right')">右</text>
            <text class="feed-side" :class="{on:feedSide==='bottle'}" @click="setFeedSide('bottle')">🍼</text>
          </view>
          <view class="feed-amounts" v-if="feedSide">
            <text v-for="ml in [60,90,120,150,180]" :key="ml" class="feed-ml" :class="{on:feedAmount===ml}" @click="setFeedAmount(ml)">{{ ml }}ml</text>
          </view>
        </view>
        <view class="timer-end-row">
          <view class="end-btn" @click="stopOne(recordsStore.runningTimer?.babyId)">
            {{ timerType==='sleep'?'醒了':'喂完了' }}
          </view>
        </view>
      </view>
    </template>

    <!-- ===== DUAL TIMER ===== -->
    <template v-if="recordsStore.runningTimers.length>=2">
      <view class="dual-zone">
        <view class="dual-card" v-for="t in recordsStore.runningTimers" :key="t.babyId"
          :class="t.babyId===twins[0]?.id?'dc-a':'dc-b'">
          <view class="dc-face" :class="t.babyId===twins[0]?.id?'bg-a':'bg-b'">
            <text class="dc-emoji">{{ t.babyId===twins[0]?.id?'😋':'😴' }}</text>
          </view>
          <text class="dc-name">{{ getName(t.babyId) }}</text>
          <text class="dc-ctx" v-if="t.type==='feeding'">{{ feedSide ? (feedSide==='left'?'左':feedSide==='right'?'右':'瓶') : '' }}{{ feedAmount ? ' '+feedAmount+'ml' : '' }}</text>
          <text class="dc-ctx" v-else-if="t.type==='sleep'">💤</text>
          <text class="dc-time">{{ formatElapsed(t.elapsed) }}</text>
          <view class="dc-stop" @click="stopOne(t.babyId)">
            <text>{{ t.type==='sleep'?'醒':'停' }}</text>
          </view>
        </view>
      </view>
      <view class="stop-all" @click="stopAll">全部停止</view>
    </template>

    <!-- ===== 时间线 ===== -->
    <view class="timeline" v-if="recentLogs.length && !recordsStore.isRunning">
      <text class="tl-section">今天</text>
      <view class="tl-item" v-for="l in recentLogs.slice(0,15)" :key="l.id">
        <view class="tl-dot" :style="{background:l.babyId===twins[0]?.id?'var(--amber)':'var(--rose)'}" />
        <text class="tl-text">{{ l.detail }}</text>
        <text class="tl-when">{{ timeAgo(l.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {computed,ref,onMounted,onUnmounted,watch} from 'vue'
import {onShow,onHide} from '@dcloudio/uni-app'
import { onShareAppMessage } from '@dcloudio/uni-app'
import {useBabiesStore} from '@/stores/babies'
import {useRecordsStore,type RecordType} from '@/stores/records'
import {timeAgo, formatElapsed} from '@/utils/format'
import {useHaptic} from '@/composables/useHaptic'
import {usePoeticTime} from '@/composables/usePoeticTime'
import {useStickersStore} from '@/stores/stickers'
import {useStickerSync} from '@/composables/useStickerSync'
import {trackRecordCreated, trackPageView} from '@/utils/analytics'

const babiesStore=useBabiesStore();const recordsStore=useRecordsStore();const stickersStore=useStickersStore();const {syncStickers}=useStickerSync()
const sel=ref('')
const twins=computed(()=>[babiesStore.babyA,babiesStore.babyB].filter(Boolean))
const haptic=useHaptic()
const isNight=computed(()=>{const h=new Date().getHours();return h>=22||h<6})

// ---- 上下文面板 ----
const panelType=ref<'feeding'|'diaper'|'temperature'|'medicine'|''>('')
const feedSide=ref<'left'|'right'|'bottle'|''>('')
const feedAmount=ref(0)
const diaperType=ref<'wet'|'dirty'|'both'|''>('')
const tempValue=ref(0)
const tempPresets=[36.0,36.5,37.0,37.5,38.0,38.5,39.0,39.5,40.0]
const medName=ref('')
const medDosage=ref('')
const medPresets=['布洛芬','对乙酰氨基酚','维生素D','益生菌','蒙脱石散','生理盐水']

function openPanel(t:'feeding'|'diaper'|'temperature'|'medicine'){panelType.value=t;haptic.tick()}
function closePanel(){panelType.value=''}
function resetContext(){feedSide.value='';feedAmount.value=0;diaperType.value='';tempValue.value=0;medName.value='';medDosage.value='';panelType.value=''}

// ---- 贴纸 ----
const stickerShow=ref(false);const stickerEmoji=ref('⭐')
let stickerTimer:ReturnType<typeof setTimeout>|null=null
function popSticker(emoji:string){if(stickerTimer)clearTimeout(stickerTimer);stickerEmoji.value=emoji;stickerShow.value=true;stickerTimer=setTimeout(()=>{stickerShow.value=false},750)}

// ---- 计时器 ----
const tick=ref(0);let h:ReturnType<typeof setInterval>|null=null
watch(()=>recordsStore.isRunning,r=>{if(r){haptic.heartbeatStart();h=setInterval(()=>tick.value++,1000)}else{haptic.heartbeatStop();if(h){clearInterval(h);h=null}}},{immediate:true})
onUnmounted(()=>{if(h)clearInterval(h);haptic.heartbeatStop();if(stickerTimer)clearTimeout(stickerTimer)})
onHide(()=>{if(h){clearInterval(h);h=null};haptic.heartbeatStop()})
const runningElapsed=computed(()=>{tick.value;return recordsStore.runningTimer?.elapsed??0})
const runningName=computed(()=>{const t=recordsStore.runningTimer;return t?getName(t.babyId):''})
const runningTwin=computed(()=>(recordsStore.runningTimer?.babyId===twins.value[0]?.id?'a':'b')as'a'|'b')
const timerType=computed(()=>recordsStore.runningTimer?.type as 'feeding'|'sleep'|undefined)
const elapsedRef=computed(()=>runningElapsed.value)
const {label:poeticLabel}=usePoeticTime(elapsedRef,timerType)

function setFeedSide(s:'left'|'right'|'bottle'){feedSide.value=s;const id=recordsStore.runningTimer?.babyId;if(id)recordsStore.setTimerField(id,'feedingSide',s)}
function setFeedAmount(ml:number){feedAmount.value=ml;const id=recordsStore.runningTimer?.babyId;if(id)recordsStore.setTimerField(id,'amountMl',ml)}
function getName(id:string){return twins.value.find(b=>b.id===id)?.nickname||''}

// ---- 操作处理 ----

/** 喂奶：从上下文面板直接记录 */
function doFeedNow(){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  recordsStore.quickLog(id,'feeding',{
    feedingSide:feedSide.value||undefined,
    amountMl:feedAmount.value||undefined,
    feedingMode:feedSide.value==='bottle'?'bottle':'breast',
  })
  finishAction('feeding','quick','🍼')
}

/** 喂奶：从上下文面板启动计时器 */
function doStartTimer(type:'feeding'|'sleep'){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  if(type==='feeding' && feedSide.value){
    recordsStore.startTimer(id,type)
    // 启动后立即设置上下文
    recordsStore.setTimerField(id,'feedingSide',feedSide.value)
    if(feedAmount.value) recordsStore.setTimerField(id,'amountMl',feedAmount.value)
    recordsStore.setTimerField(id,'feedingMode',feedSide.value==='bottle'?'bottle':'breast')
  }else{
    recordsStore.startTimer(id,type)
  }
  haptic.thump()
  popSticker(type==='feeding'?'🍼':'😴')
  closePanel()
}

/** 睡觉：直接启动计时器 */
function doStartSleep(){
  const id=sel.value||twins.value[0]?.id;if(!id){uni.showToast({title:'请先选择宝宝',icon:'none'});return}
  recordsStore.startTimer(id,'sleep')
  haptic.thump();popSticker('😴')
}

/** 尿布：从面板直接记录 */
function doDiaperQuick(t:'wet'|'dirty'|'both'){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  recordsStore.quickLog(id,'diaper',{diaperType:t})
  finishAction('diaper','quick','🧷')
}

/** 体温：从面板直接记录 */
function doTempQuick(){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  if(!tempValue.value){uni.showToast({title:'请选择温度值',icon:'none'});return}
  recordsStore.quickLog(id,'temperature',{temperatureValue:tempValue.value})
  finishAction('temperature','quick','🌡️')
}

/** 用药：从面板直接记录 */
function doMedQuick(){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  if(!medName.value){uni.showToast({title:'请输入药名',icon:'none'});return}
  recordsStore.quickLog(id,'medicine',{medicineName:medName.value,medicineDosage:medDosage.value||undefined})
  finishAction('medicine','quick','💊')
}

/** 洗澡：直接记录 */
function doQuickBath(){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  recordsStore.quickLog(id,'bath')
  finishAction('bath','quick','🛁')
}

function finishAction(t:RecordType,mode:string,emoji:string){
  haptic.sparkle();syncStickers();trackRecordCreated(t,mode);popSticker(emoji);resetContext()
}

function quickNight(t:RecordType='feeding'){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  recordsStore.quickLog(id,t)
  haptic.sparkle();syncStickers()
  const m:Record<string,string>={feeding:'🍼',diaper:'🧷',sleep:'😴'};popSticker(m[t]||'🌙')
}

function dualLog(t:RecordType){
  const a=twins.value[0],b=twins.value[1]
  if(a)recordsStore.quickLog(a.id,t,{feedingSide:feedSide.value||undefined,amountMl:feedAmount.value||undefined})
  if(b)recordsStore.quickLog(b.id,t,{feedingSide:feedSide.value||undefined,amountMl:feedAmount.value||undefined})
  haptic.doubleBeat();syncStickers();trackRecordCreated(t,'dual');popSticker('🔗')
}

function retro(m:number,t:RecordType='feeding'){
  const id=sel.value||twins.value[0]?.id;if(!id)return
  recordsStore.quickLog(id,t,{offsetMs:m*60000})
  haptic.sparkle();syncStickers()
  const em:Record<string,string>={feeding:'🍼',diaper:'🧷',sleep:'😴'};popSticker(em[t]||'⏰')
}

const todayStart=computed(()=>new Date().setHours(0,0,0,0))
const recentLogs=computed(()=>{const t0=todayStart.value;return recordsStore.logs.filter(l=>l.createdAt>=t0).sort((a,b)=>b.createdAt-a.createdAt)})

onMounted(()=>{uni.setNavigationBarTitle({title:"记录"});if(twins.value[0])sel.value=twins.value[0].id})
onShow(()=>{if(twins.value[0]&&!sel.value)sel.value=twins.value[0].id;trackPageView('record')})

const stopOne=(id?:string)=>{
  // 上下文字段已在计时过程中通过 setTimerField 实时同步到 store，直接停止即可
  recordsStore.stopTimer(id)
  resetContext()
}
const stopAll=()=>{recordsStore.stopTimer();resetContext()}
</script>

<style scoped>
.record-page{min-height:100vh;background:var(--paper);padding:36rpx 28rpx calc(80rpx + env(safe-area-inset-bottom));position:relative}
.bg-spot{position:absolute;pointer-events:none;z-index:0;border-radius:50%}
.spot-a{width:420rpx;height:420rpx;top:80rpx;right:-160rpx;background:radial-gradient(circle,rgba(212,128,104,0.03) 0%,transparent 60%)}
.spot-b{width:360rpx;height:360rpx;bottom:180rpx;left:-140rpx;background:radial-gradient(circle,rgba(224,123,62,0.03) 0%,transparent 60%)}
.sticker-pop{position:fixed;top:16%;left:50%;transform:translate(-50%,-50%);z-index:99;pointer-events:none}
.sticker-pop-emoji{font-size:96rpx;animation:stickerPeel .75s var(--ease-peel) forwards}

/* 空状态 */
.empty-state{padding:160rpx 0;text-align:center;position:relative;z-index:1}
.empty-emoji{font-size:80rpx;display:block;margin-bottom:20rpx}
.empty-title{display:block;font-family:var(--font-journal);font-size:36rpx;color:var(--ink);margin-bottom:8rpx}
.empty-desc{font-size:26rpx;color:var(--ink-md)}

/* 宝宝标签 */
.baby-tabs{display:flex;gap:0;margin-bottom:24rpx;position:relative;z-index:1}
.baby-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:8rpx;padding:20rpx;border-radius:20rpx 20rpx 0 0;opacity:.45;transition:opacity .2s,border-color .2s;border-bottom:3rpx solid transparent}
.baby-tab.active{opacity:1}.baby-tab.tab-a.active{border-bottom-color:var(--amber);background:linear-gradient(to top,var(--amber-lt),transparent 60%)}.baby-tab.tab-b.active{border-bottom-color:var(--rose);background:linear-gradient(to top,var(--rose-lt),transparent 60%)}.tab-emoji{font-size:40rpx;transition:transform .3s var(--ease-bounce)}.baby-tab:active .tab-emoji{transform:scale(1.2)}.tab-name{font-family:var(--font-journal);font-size:26rpx;font-weight:700;color:var(--ink)}.tab-check{font-size:20rpx;color:var(--mint)}

/* 区域标签 */
.section-label{font-size:24rpx;color:var(--ink-md);margin-bottom:14rpx;padding-left:8rpx;font-weight:700;position:relative;z-index:1;font-family:var(--font-journal);letter-spacing:1rpx}

/* 计时型操作 */
.timer-actions{display:flex;gap:12rpx;margin-bottom:20rpx;position:relative;z-index:1}
.ta-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:8rpx;padding:32rpx 8rpx;border-radius:24rpx;border:2rpx solid var(--dot);background:var(--cream);transition:transform .15s var(--ease-bounce),border-color .2s}
.ta-btn:active{transform:scale(.93)}
.ta-feed{border-color:rgba(224,123,62,.2);background:linear-gradient(135deg,var(--amber-lt),var(--cream))}
.ta-feed:active{border-color:var(--amber);background:var(--amber-lt)}
.ta-sleep{border-color:rgba(156,142,124,.2);background:linear-gradient(135deg,rgba(156,142,124,.06),var(--cream))}
.ta-sleep:active{border-color:var(--ink-md);background:rgba(156,142,124,.08)}
.ta-emoji{font-size:48rpx;transition:transform .3s var(--ease-bounce)}
.ta-btn:active .ta-emoji{transform:scale(1.2)}
.ta-label{font-size:26rpx;font-weight:700;color:var(--ink)}

/* 即时型操作 */
.quick-actions{display:flex;gap:10rpx;margin-bottom:16rpx;position:relative;z-index:1}
.qa-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:6rpx;padding:20rpx 6rpx;background:var(--cream);border:1.5px solid var(--dot);border-radius:18rpx;transition:transform .15s var(--ease-bounce),border-color .2s}
.qa-btn:active{transform:scale(.9);border-color:var(--amber);background:var(--amber-lt)}
.qa-emoji{font-size:32rpx;transition:transform .2s var(--ease-bounce)}
.qa-btn:active .qa-emoji{transform:scale(1.2)}
.qa-label{font-size:22rpx;font-weight:600;color:var(--ink-md)}

/* 上下文面板 */
.ctx-panel{position:relative;z-index:2;background:var(--cream);border:2rpx solid var(--amber);border-radius:20rpx;padding:24rpx;margin-bottom:16rpx;animation:ctxIn .25s var(--ease-soft)}
@keyframes ctxIn{from{opacity:0;transform:translateY(-12rpx)}to{opacity:1;transform:translateY(0)}}
.ctx-title{display:block;font-family:var(--font-journal);font-size:26rpx;font-weight:700;color:var(--ink);margin-bottom:16rpx}
.ctx-row{display:flex;gap:8rpx;margin-bottom:12rpx;flex-wrap:wrap}
.ctx-row.wrap{flex-wrap:wrap}
.ctx-chip{padding:12rpx 22rpx;border-radius:16rpx;background:var(--paper);border:1.5px solid var(--dot);font-size:26rpx;font-weight:600;color:var(--ink-md);transition:all .15s var(--ease-bounce)}
.ctx-chip:active{transform:scale(.9)}
.ctx-chip.on{border-color:var(--amber);background:var(--amber-lt);color:var(--amber)}
.ctx-chip.sm{padding:8rpx 16rpx;font-size:24rpx}
.ctx-chip.lg{padding:16rpx 28rpx;font-size:28rpx}
.ctx-input-row{display:flex;gap:8rpx;margin-bottom:12rpx}
.ctx-input{flex:1;padding:14rpx 18rpx;background:var(--paper);border:1.5px solid var(--dot);border-radius:14rpx;font-size:26rpx;color:var(--ink);height:56rpx}
.ctx-input.sm-input{flex:.6}
.ctx-actions{display:flex;gap:10rpx}
.ctx-btn{flex:1;text-align:center;padding:16rpx;border-radius:18rpx;font-size:26rpx;font-weight:700;transition:transform .15s var(--ease-bounce)}
.ctx-btn:active{transform:scale(.94)}
.ctx-btn.primary{background:var(--amber);color:#fff}
.ctx-btn.secondary{background:transparent;border:2rpx solid var(--amber);color:var(--amber)}
.ctx-close{position:absolute;top:12rpx;right:12rpx;width:56rpx;height:56rpx;display:flex;align-items:center;justify-content:center;font-size:32rpx;color:var(--ink-lt);border-radius:50%}
.ctx-close:active{background:rgba(0,0,0,.04)}

/* 双胞胎快捷 */
.dual-row{display:flex;gap:10rpx;margin-bottom:16rpx;position:relative;z-index:1;align-items:center}
.dual-chip{flex:1;text-align:center;padding:14rpx 8rpx;background:var(--cream);border:1.5px solid var(--dot);border-radius:24rpx;font-size:20rpx;color:var(--ink-md);font-weight:600;transition:transform .15s var(--ease-bounce)}
.dual-chip:active{transform:scale(.93);border-color:var(--amber);color:var(--amber)}
.dual-primary{padding:18rpx 12rpx;font-size:26rpx;background:var(--amber-lt);border-color:var(--amber);color:var(--amber)}

/* 夜间快速 */
.night-quick{text-align:center;margin-bottom:16rpx;position:relative;z-index:1}
.night-label{display:block;font-size:22rpx;color:var(--ink-lt);margin-bottom:12rpx;font-family:var(--font-journal)}
.night-row{display:flex;gap:10rpx;justify-content:center}
.night-chip{flex:1;max-width:180rpx;text-align:center;padding:16rpx 8rpx;background:linear-gradient(135deg,rgba(45,35,24,0.03),rgba(45,35,24,0.06));border:2rpx solid var(--dot);border-radius:20rpx;font-size:24rpx;color:var(--ink-md);font-weight:600;transition:transform .15s var(--ease-bounce)}
.night-chip:active{transform:scale(.9);background:var(--amber-lt);border-color:var(--amber);color:var(--amber)}

/* 回溯 */
.retro-note{display:flex;align-items:center;gap:12rpx;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;padding:8rpx 0}
.retro-dash{color:var(--ink-lt);font-size:20rpx;opacity:.5}
.retro-label{font-size:22rpx;color:var(--ink-lt)}
.retro-presets{display:flex;gap:8rpx}
.retro-chip{padding:10rpx 18rpx;font-size:22rpx;color:var(--ink-md);background:var(--cream);border:1.5px solid var(--dot);border-radius:18rpx;font-weight:500;transition:transform .15s var(--ease-bounce),border-color .2s}
.retro-chip:active{transform:scale(.9);border-color:var(--amber);color:var(--amber)}

/* 计时器英雄区 */
.timer-hero{display:flex;flex-direction:column;align-items:center;padding:40rpx 0;position:relative;z-index:1}
.hero-face{width:180rpx;height:180rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16rpx}
.hero-face.bg-a{background:var(--amber-md)}.hero-face.bg-b{background:var(--rose-md)}
.hero-emoji{font-size:88rpx;animation:faceRock 3s ease-in-out infinite}
@keyframes faceRock{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}
.hero-baby-name{font-family:var(--font-journal);font-size:36rpx;color:var(--ink)}
.hero-ctx{display:flex;align-items:center;gap:8rpx;margin-top:6rpx}
.hero-side{font-size:32rpx;font-weight:700;color:var(--amber)}
.hero-amount{font-size:28rpx;font-weight:600;color:var(--ink)}
.hero-clock{margin-top:8rpx}
.clock-elapsed{font-family:var(--font-journal);font-size:52rpx;color:var(--ink-md);letter-spacing:2rpx}
.hero-phase{font-size:24rpx;color:var(--mint);margin-top:4rpx;font-weight:600}
.timer-end-row{margin-top:24rpx}
.end-btn{padding:18rpx 56rpx;background:var(--mint);border-radius:28rpx;font-size:30rpx;font-weight:700;color:#fff;transition:transform .15s var(--ease-bounce);display:inline-block}
.end-btn:active{transform:scale(.94);opacity:.85}

/* 喂养控制 */
.feed-controls{margin-top:20rpx;display:flex;flex-direction:column;align-items:center;gap:12rpx}
.feed-sides{display:flex;gap:8rpx}
.feed-side{width:72rpx;height:72rpx;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--cream);border:2rpx solid var(--dot);font-size:28rpx;font-weight:700;color:var(--ink-md);transition:all .15s var(--ease-bounce)}
.feed-side:active{transform:scale(.88)}
.feed-side.on{border-color:var(--amber);background:var(--amber-lt);color:var(--amber)}
.feed-amounts{display:flex;gap:8rpx}
.feed-ml{padding:8rpx 18rpx;border-radius:16rpx;background:var(--cream);border:1.5px solid var(--dot);font-size:24rpx;color:var(--ink-md);font-weight:600;transition:all .15s var(--ease-bounce)}
.feed-ml:active{transform:scale(.9)}
.feed-ml.on{border-color:var(--mint);background:var(--mint-lt);color:var(--mint)}

/* 双计时器 */
.dual-zone{display:flex;gap:14rpx;margin-bottom:14rpx;position:relative;z-index:1}
.dual-card{flex:1;display:flex;flex-direction:column;align-items:center;gap:10rpx;padding:24rpx 12rpx;border-radius:24rpx}
.dual-card.dc-a{background:var(--amber-lt);border:2rpx solid rgba(224,123,62,.1)}
.dual-card.dc-b{background:var(--rose-lt);border:2rpx solid rgba(212,128,104,.1)}
.dc-face{width:96rpx;height:96rpx;border-radius:50%;display:flex;align-items:center;justify-content:center}
.dc-face.bg-a{background:var(--amber-md)}.dc-face.bg-b{background:var(--rose-md)}
.dc-emoji{font-size:48rpx;animation:faceRock 3s ease-in-out infinite}
.dc-name{font-family:var(--font-journal);font-size:24rpx;font-weight:700;color:var(--ink)}
.dc-ctx{font-size:20rpx;color:var(--ink-md);font-weight:600}
.dc-time{font-family:var(--font-journal);font-size:36rpx;color:var(--ink);letter-spacing:2rpx}
.dc-stop{padding:16rpx 32rpx;border-radius:20rpx;background:var(--mint);font-size:26rpx;color:#fff;font-weight:600;min-width:88rpx;text-align:center;transition:transform .15s var(--ease-bounce)}
.dc-stop:active{transform:scale(.92);opacity:.85}
.stop-all{width:100%;padding:16rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:24rpx;font-size:26rpx;font-weight:600;color:var(--twin-danger);position:relative;z-index:1}

/* 时间线 */
.timeline{padding-top:16rpx;position:relative;z-index:1}
.tl-section{display:block;font-family:var(--font-journal);font-size:22rpx;color:var(--ink-lt);font-weight:600;margin-bottom:10rpx;padding-left:2rpx}
.tl-item{display:flex;align-items:center;gap:12rpx;padding:10rpx 0}
.tl-dot{width:7rpx;height:7rpx;border-radius:50%;flex-shrink:0}
.tl-text{flex:1;font-size:26rpx;color:var(--ink)}
.tl-when{flex-shrink:0;font-size:20rpx;color:var(--ink-lt)}
</style>
