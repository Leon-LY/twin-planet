<!-- 双宝手帐 · 记录页 v5 -->
<template>
  <view class="record-page">
    <!-- 暖光 -->
    <view class="bg-spot spot-a" /><view class="bg-spot spot-b" />

    <!-- === 空闲：选择 + 盖章 === -->
    <template v-if="!recordsStore.isRunning">
      <view class="select-zone">
        <view class="sel-card" v-for="(t,i) in twins" :key="t.id"
          :class="{ active: sel===t.id, 'bg-a':i===0, 'bg-b':i===1 }" @click="sel=t.id">
          <text class="sel-face">{{ i===0 ? '😋' : '😴' }}</text>
          <text class="sel-name">{{ t.nickname || t.name }}</text>
          <text class="sel-hint" v-if="sel===t.id">已选</text>
        </view>
      </view>

      <!-- 盖章网格 -->
      <view class="stamp-grid">
        <view v-for="a in actions" :key="a.type" class="stamp-btn" @click="doAction(a.type)">
          <text class="stamp-emoji">{{ a.emoji }}</text>
          <text class="stamp-label">{{ a.label }}</text>
        </view>
      </view>

      <!-- 双宝同步 -->
      <view class="dual-row" v-if="twins.length>=2">
        <view class="dual-chip" @click="dualLog('feeding')">🍼 两个都喂了</view>
        <view class="dual-chip" @click="dualLog('sleep')">😴 两个都睡了</view>
      </view>

      <!-- 回溯 — 支持所有类型 -->
      <view class="retro-zone">
        <text class="retro-label">⏰ 刚才忘了？</text>
        <view class="retro-chips">
          <text v-for="m in [5,10,20,30]" :key="m" class="r-chip" @click="retro(m)">{{ m }}分钟前</text>
        </view>
      </view>
    </template>

    <!-- === 单计时 === -->
    <template v-if="recordsStore.runningTimers.length===1">
      <view class="timer-hero">
        <view class="hero-face" :class="runningTwin==='a'?'face-a':'face-b'">
          <text class="hero-emoji">{{ runningTwin==='a'?'😋':'😴' }}</text>
        </view>
        <text class="hero-name">{{ runningName }}</text>
        <text class="hero-poetry">{{ poeticLabel }}</text>
        <text class="hero-time">{{ formatElapsed(runningElapsed) }}</text>
        <button class="end-btn" @click="stopOne(recordsStore.runningTimer!.babyId)">✋ 停止记录</button>
      </view>
    </template>

    <!-- === 双计时 === -->
    <template v-if="recordsStore.runningTimers.length>=2">
      <view class="dual-zone">
        <view class="dual-card" v-for="t in recordsStore.runningTimers" :key="t.babyId">
          <view class="dual-face" :class="t.babyId===twins[0]?.id?'face-a':'face-b'">
            <text class="dual-emoji">{{ t.babyId===twins[0]?.id?'😋':'😴' }}</text>
          </view>
          <text class="dual-name">{{ getName(t.babyId) }}</text>
          <text class="dual-time">{{ formatElapsed(t.elapsed) }}</text>
          <button class="stop-sm" @click="stopOne(t.babyId)">停止</button>
        </view>
      </view>
      <button class="stop-all" @click="stopAll">✋ 全部停止</button>
    </template>

    <!-- 时间线 -->
    <view class="timeline" v-if="recentLogs.length && !recordsStore.isRunning">
      <view class="tl-item" v-for="l in recentLogs.slice(0,10)" :key="l.id">
        <view class="tl-dot" :style="{background:l.babyId===twins[0]?.id?'var(--amber)':'var(--rose)'}" />
        <text class="tl-text">{{ l.detail }}</text>
        <text class="tl-time">{{ timeAgo(l.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {computed,ref,onMounted,onUnmounted,watch} from 'vue'
import {useBabiesStore} from '@/stores/babies'
import {useRecordsStore,type RecordType} from '@/stores/records'
const babiesStore=useBabiesStore();const recordsStore=useRecordsStore();const sel=ref('')
const twins=computed(()=>[babiesStore.babyA,babiesStore.babyB].filter(Boolean))
const actions=[{type:'feeding' as RecordType,emoji:'🍼',label:'喂奶'},{type:'sleep' as RecordType,emoji:'😴',label:'睡觉'},{type:'diaper' as RecordType,emoji:'🧷',label:'尿布'},{type:'temperature' as RecordType,emoji:'🌡️',label:'体温'},{type:'medicine' as RecordType,emoji:'💊',label:'用药'},{type:'bath' as RecordType,emoji:'🛁',label:'洗澡'}]
const tick=ref(0);let h:ReturnType<typeof setInterval>|null=null
watch(()=>recordsStore.isRunning,r=>{if(r)h=setInterval(()=>tick.value++,1000);else{if(h){clearInterval(h);h=null}}},{immediate:true})
onUnmounted(()=>{if(h)clearInterval(h)})
const runningElapsed=computed(()=>{tick.value;return recordsStore.runningTimer?.elapsed??0})
const runningName=computed(()=>{const t=recordsStore.runningTimer;return t?getName(t.babyId):''})
const runningTwin=computed(()=>(recordsStore.runningTimer?.babyId===twins.value[0]?.id?'a':'b')as'a'|'b')
const poeticLabel=computed(()=>{const p=recordsStore.runningTimer?.type==='sleep'?[{m:2,l:'刚刚入眠'},{m:5,l:'星尘落下'},{m:10,l:'梦乡深处'},{m:20,l:'星际漫游'},{m:999,l:'继续守护'}]:[{m:2,l:'刚刚开始'},{m:5,l:'星光降临'},{m:10,l:'航行中'},{m:15,l:'渐入佳境'},{m:20,l:'即将圆满'},{m:999,l:'星光已满'}];const min=runningElapsed.value/60;for(const x of p){if(min<x.m)return x.l};return p[p.length-1].l})
function getName(id:string){return twins.value.find(b=>b.id===id)?.nickname||''}
function doAction(t:RecordType){const id=sel.value||twins.value[0]?.id;if(!id)return;if(t==='feeding'||t==='sleep')recordsStore.startTimer(id,t);else{recordsStore.quickLog(id,t);uni.showToast({title:'已盖章 ✦',icon:'success',duration:1000})}}
function dualLog(t:RecordType){const a=twins.value[0],b=twins.value[1];if(a)recordsStore.quickLog(a.id,t);if(b)recordsStore.quickLog(b.id,t);uni.showToast({title:t==='feeding'?'都喂了 ✦':'都睡了 ✦',icon:'success'})}
function retro(m:number){const id=sel.value||twins.value[0]?.id;if(!id)return;const type=(actions.find(a=>a.type==='feeding')||actions[0]).type;recordsStore.quickLog(id,type);uni.showToast({title:`已补记 ${m} 分钟前 ✦`,icon:'success',duration:1000})}
function stopOne(id:string){const l=recordsStore.stopTimer(id);uni.showToast({title:l?`${l.babyName} · ${l.detail} ✦`:'不足1分钟',icon:l?'success':'none',duration:1500})}
function stopAll(){let c=0;for(const t of recordsStore.runningTimers){if(recordsStore.stopTimer(t.babyId))c++};uni.showToast({title:`${c}条已保存 ✦`,icon:'success'})}
function formatElapsed(s:number){const m=Math.floor(s/60);return`${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function timeAgo(ts:number){const d=Math.floor((Date.now()-ts)/60000);if(d<1)return'刚刚';if(d<60)return`${d}分钟前`;return`${Math.floor(d/60)}小时前`}
const t0=new Date().setHours(0,0,0,0)
const recentLogs=computed(()=>recordsStore.logs.filter(l=>l.createdAt>=t0).sort((a,b)=>b.createdAt-a.createdAt))
onMounted(()=>{uni.setNavigationBarTitle({title:'手帐记录'});if(twins.value[0])sel.value=twins.value[0].id})
</script>

<style scoped>
.record-page{min-height:100vh;background:var(--paper);padding:40rpx 28rpx calc(80rpx + env(safe-area-inset-bottom));position:relative}
.bg-spot{position:absolute;pointer-events:none;z-index:0;border-radius:50%}
.spot-a{width:400rpx;height:400rpx;top:100rpx;right:-150rpx;background:radial-gradient(circle,rgba(212,128,104,0.03) 0%,transparent 60%)}
.spot-b{width:350rpx;height:350rpx;bottom:200rpx;left:-120rpx;background:radial-gradient(circle,rgba(224,123,62,0.03) 0%,transparent 60%)}

.select-zone{display:flex;justify-content:center;gap:28rpx;margin-bottom:36rpx;position:relative;z-index:1}
.sel-card{display:flex;flex-direction:column;align-items:center;gap:10rpx;padding:32rpx 28rpx;border-radius:28rpx;border:2rpx solid transparent;opacity:0.5;transition:opacity .2s,border-color .2s,transform .2s var(--ease-bounce);position:relative}
.sel-card:active{transform:scale(.94)}
.sel-card.active{opacity:1;border-color:var(--amber);box-shadow:0 4rpx 16rpx rgba(224,123,62,.1)}
.sel-card.bg-a{background:var(--amber-lt)}
.sel-card.bg-b{background:var(--rose-lt)}
.sel-face{font-size:56rpx;transition:transform .3s var(--ease-bounce)}
.sel-card:active .sel-face{transform:scale(1.15)}
.sel-name{font-family:var(--font-journal);font-size:var(--font-body);font-weight:700;color:var(--ink)}
.sel-hint{font-size:var(--font-caption);color:var(--amber);font-weight:600}

.stamp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14rpx;margin-bottom:24rpx;position:relative;z-index:1}
.stamp-btn{display:flex;flex-direction:column;align-items:center;gap:8rpx;padding:32rpx 10rpx;background:var(--cream);border:2rpx solid var(--dot);border-radius:24rpx;transition:transform .15s var(--ease-bounce),border-color .2s,background .2s,box-shadow .2s}
.stamp-btn:active{transform:scale(.88);border-color:var(--amber);background:var(--amber-lt);box-shadow:0 0 0 8rpx rgba(224,123,62,.05)}
.stamp-emoji{font-size:40rpx;transition:transform .3s var(--ease-bounce)}
.stamp-btn:active .stamp-emoji{transform:scale(1.25)}
.stamp-label{font-size:var(--font-body);font-weight:600;color:var(--ink)}

.dual-row{display:flex;gap:12rpx;margin-bottom:24rpx;position:relative;z-index:1}
.dual-chip{flex:1;text-align:center;padding:18rpx 8rpx;background:var(--amber-lt);border:1.5px solid var(--amber);border-radius:var(--radius-full);font-size:24rpx;color:var(--amber);font-weight:700;transition:transform .15s var(--ease-bounce)}
.dual-chip:active{transform:scale(.93);background:var(--amber);color:#FFF}

.retro-zone{text-align:center;position:relative;z-index:1}
.retro-label{font-size:var(--font-caption);color:var(--ink-lt);display:block;margin-bottom:8rpx}
.retro-chips{display:flex;justify-content:center;gap:12rpx}
.r-chip{padding:10rpx 20rpx;background:var(--cream);border:1px solid var(--dot);border-radius:var(--radius-full);font-size:var(--font-caption);color:var(--ink-md);transition:transform .15s var(--ease-bounce),border-color .2s}
.r-chip:active{transform:scale(.9);border-color:var(--amber)}

.timer-hero{display:flex;flex-direction:column;align-items:center;padding:56rpx 0;position:relative;z-index:1}
.hero-face{width:200rpx;height:200rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:24rpx}
.hero-face.face-a{background:var(--amber-md)}
.hero-face.face-b{background:var(--rose-md)}
.hero-emoji{font-size:96rpx;animation:faceBounce .6s ease-in-out infinite}
@keyframes faceBounce{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
.hero-name{font-family:var(--font-journal);font-size:var(--font-title);color:var(--ink)}
.hero-poetry{font-size:32rpx;color:var(--mint);margin-top:6rpx;font-weight:600}
.hero-time{font-size:var(--font-caption);color:var(--ink-lt);margin-top:4rpx;letter-spacing:3rpx}
.end-btn{margin-top:32rpx;padding:22rpx 56rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:var(--radius-full);color:var(--twin-danger);font-size:var(--font-body);font-weight:600;transition:transform .15s var(--ease-bounce)}
.end-btn:active{transform:scale(.94);background:rgba(212,112,107,.06)}

.dual-zone{display:flex;gap:16rpx;margin-bottom:16rpx;position:relative;z-index:1}
.dual-card{flex:1;display:flex;flex-direction:column;align-items:center;gap:12rpx;padding:24rpx 10rpx;background:var(--cream);border:2rpx solid var(--dot);border-radius:24rpx}
.dual-face{width:120rpx;height:120rpx;border-radius:50%;display:flex;align-items:center;justify-content:center}
.dual-face.face-a{background:var(--amber-md)}.dual-face.face-b{background:var(--rose-md)}
.dual-emoji{font-size:60rpx;animation:faceBounce .6s ease-in-out infinite}
.dual-name{font-family:var(--font-journal);font-size:var(--font-body);font-weight:700;color:var(--ink)}
.dual-time{font-family:var(--font-journal);font-size:40rpx;color:var(--ink);letter-spacing:2rpx}
.stop-sm{padding:10rpx 28rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:var(--radius-full);font-size:var(--font-caption);color:var(--twin-danger)}
.stop-sm:active{background:rgba(212,112,107,.06)}
.stop-all{width:100%;padding:20rpx;margin-top:12rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:var(--radius-full);font-size:var(--font-body);font-weight:600;color:var(--twin-danger);position:relative;z-index:1}

.timeline{padding-top:24rpx;position:relative;z-index:1}
.tl-item{display:flex;align-items:center;gap:14rpx;padding:12rpx 0}
.tl-dot{width:8rpx;height:8rpx;border-radius:50%;flex-shrink:0}
.tl-text{flex:1;font-size:var(--font-body);color:var(--ink)}
.tl-time{flex-shrink:0}
</style>
