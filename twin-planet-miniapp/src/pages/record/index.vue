<!-- 双宝手帐 v4 · 记录 -->
<template>
  <view class="record-page">
    <template v-if="!recordsStore.isRunning">
      <view class="select-zone">
        <view class="sel-card" v-for="(t,i) in twins" :key="t.id"
          :class="{ active: sel === t.id, 'bg-a': i===0, 'bg-b': i===1 }" @click="sel = t.id">
          <text class="sel-face">{{ i===0 ? '😋' : '😴' }}</text>
          <text class="sel-name">{{ t.nickname || t.name }}</text>
        </view>
      </view>

      <view class="act-grid">
        <view v-for="a in actions" :key="a.type" class="act-card" @click="doAction(a.type)">
          <text class="act-emoji">{{ a.emoji }}</text>
          <text class="act-label">{{ a.label }}</text>
        </view>
      </view>

      <view class="quick-dual" v-if="twins.length >= 2">
        <view class="qd-btn" @click="dualLog('feeding')">🍼 两个都喂了</view>
        <view class="qd-btn" @click="dualLog('sleep')">😴 两个都睡了</view>
        <view class="qd-btn" @click="dualLog('diaper')">🧷 两个都换了</view>
      </view>

      <view class="retro">
        <text class="caption">刚才忘了？</text>
        <view class="retro-chips">
          <text v-for="m in [5,10,20,30]" :key="m" class="r-chip" @click="retro(m)">{{ m }}分钟前</text>
        </view>
      </view>
    </template>

    <template v-if="recordsStore.runningTimers.length === 1">
      <view class="timer-hero">
        <view class="hero-avatar" :class="runningTwin==='a'?'av-a':'av-b'">
          <text class="hero-face">{{ runningTwin==='a'?'😋':'😴' }}</text>
        </view>
        <text class="hero-name">{{ runningName }}</text>
        <text class="hero-label">{{ poeticLabel }}</text>
        <text class="hero-time">{{ formatElapsed(runningElapsed) }}</text>
        <button class="stop-btn" @click="stopOne(recordsStore.runningTimer!.babyId)">✋ 停止</button>
      </view>
    </template>

    <template v-if="recordsStore.runningTimers.length >= 2">
      <view class="dual-zone">
        <view class="dual-card" v-for="t in recordsStore.runningTimers" :key="t.babyId">
          <view class="dual-avatar" :class="t.babyId===twins[0]?.id?'av-a':'av-b'">
            <text class="dual-face-emoji">{{ t.babyId===twins[0]?.id?'😋':'😴' }}</text>
          </view>
          <text class="dual-name">{{ getName(t.babyId) }}</text>
          <text class="dual-time">{{ formatElapsed(t.elapsed) }}</text>
          <button class="stop-sm" @click="stopOne(t.babyId)">停止</button>
        </view>
      </view>
      <button class="stop-all" @click="stopAll">✋ 全部停止</button>
    </template>

    <view class="timeline" v-if="recentLogs.length && !recordsStore.isRunning">
      <view class="tl-item" v-for="l in recentLogs.slice(0,8)" :key="l.id">
        <view class="tl-dot" :style="{background:l.babyId===twins[0]?.id?'var(--amber)':'var(--rose)'}" />
        <text class="tl-text">{{ l.detail }}</text>
        <text class="tl-time caption">{{ timeAgo(l.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed,ref,onMounted,onUnmounted,watch } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore,type RecordType } from '@/stores/records'
const babiesStore=useBabiesStore();const recordsStore=useRecordsStore();const sel=ref('')
const twins=computed(()=>[babiesStore.babyA,babiesStore.babyB].filter(Boolean))
const actions=[{type:'feeding' as RecordType,emoji:'🍼',label:'喂奶'},{type:'sleep' as RecordType,emoji:'😴',label:'睡觉'},{type:'diaper' as RecordType,emoji:'🧷',label:'尿布'},{type:'temperature' as RecordType,emoji:'🌡️',label:'体温'},{type:'medicine' as RecordType,emoji:'💊',label:'用药'},{type:'bath' as RecordType,emoji:'🛁',label:'洗澡'}]
const tick=ref(0);let h:ReturnType<typeof setInterval>|null=null
watch(()=>recordsStore.isRunning,r=>{if(r)h=setInterval(()=>tick.value++,1000);else{if(h){clearInterval(h);h=null}}},{immediate:true})
onUnmounted(()=>{if(h)clearInterval(h)})
const runningElapsed=computed(()=>{tick.value;return recordsStore.runningTimer?.elapsed??0})
const runningName=computed(()=>{const t=recordsStore.runningTimer;return t?getName(t.babyId):''})
const runningTwin=computed(()=>recordsStore.runningTimer?.babyId===twins.value[0]?.id?'a':'b')
const poeticLabel=computed(()=>{const p=recordsStore.runningTimer?.type==='sleep'?[{m:2,l:'刚刚入眠'},{m:5,l:'星尘落下'},{m:10,l:'梦乡深处'},{m:20,l:'星际漫游'},{m:999,l:'继续守护'}]:[{m:2,l:'刚刚开始'},{m:5,l:'星光降临'},{m:10,l:'航行中'},{m:15,l:'渐入佳境'},{m:20,l:'即将圆满'},{m:999,l:'星光已满'}];const min=runningElapsed.value/60;for(const x of p){if(min<x.m)return x.l};return p[p.length-1].l})
function getName(id:string){return twins.value.find(b=>b.id===id)?.nickname||''}
function doAction(t:RecordType){const id=sel.value||twins.value[0]?.id;if(!id)return;if(t==='feeding'||t==='sleep')recordsStore.startTimer(id,t);else{recordsStore.quickLog(id,t);uni.showToast({title:'已记录 ✦',icon:'success',duration:1000})}}
function dualLog(t:RecordType){const a=twins.value[0],b=twins.value[1];if(a)recordsStore.quickLog(a.id,t);if(b)recordsStore.quickLog(b.id,t);uni.showToast({title:t==='feeding'?'都喂了 ✦':t==='sleep'?'都睡了 ✦':'都换了 ✦',icon:'success'})}
function retro(m:number){const id=sel.value||twins.value[0]?.id;if(!id)return;recordsStore.quickLog(id,'feeding');uni.showToast({title:`已补记 ${m} 分钟前`,icon:'success',duration:1000})}
function stopOne(id:string){const l=recordsStore.stopTimer(id);uni.showToast({title:l?`${l.babyName} · ${l.detail} ✦`:'不足1分钟',icon:l?'success':'none',duration:1500})}
function stopAll(){let c=0;for(const t of recordsStore.runningTimers){if(recordsStore.stopTimer(t.babyId))c++};uni.showToast({title:`${c}条已保存 ✦`,icon:'success'})}
function formatElapsed(s:number){const m=Math.floor(s/60);return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function timeAgo(ts:number){const d=Math.floor((Date.now()-ts)/60000);if(d<1)return'刚刚';if(d<60)return`${d}分钟前`;return`${Math.floor(d/60)}小时前`}
const t0=new Date().setHours(0,0,0,0)
const recentLogs=computed(()=>recordsStore.logs.filter(l=>l.createdAt>=t0).sort((a,b)=>b.createdAt-a.createdAt))
onMounted(()=>{uni.setNavigationBarTitle({title:'手帐记录'});if(twins.value[0])sel.value=twins.value[0].id})
</script>

<style scoped>
.record-page{min-height:100vh;background:var(--paper);padding:40rpx 28rpx calc(80rpx + env(safe-area-inset-bottom))}

.select-zone{display:flex;justify-content:center;gap:28rpx;margin-bottom:36rpx}
.sel-card{display:flex;flex-direction:column;align-items:center;gap:12rpx;padding:32rpx 28rpx;border-radius:28rpx;border:2rpx solid transparent;opacity:0.5;transition:opacity 0.2s,border-color 0.2s,transform 0.2s var(--ease-bounce);position:relative}
.sel-card:active{transform:scale(0.94)}
.sel-card.active{opacity:1;border-color:var(--amber);box-shadow:0 4rpx 16rpx rgba(224,123,62,0.1)}
.sel-card.bg-a{background:var(--amber-lt)}
.sel-card.bg-b{background:var(--rose-lt)}
.sel-face{font-size:56rpx;transition:transform 0.3s var(--ease-bounce)}
.sel-card:active .sel-face{transform:scale(1.15)}
.sel-name{font-family:var(--font-journal);font-size:var(--font-body);font-weight:700;color:var(--ink)}

.act-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14rpx;margin-bottom:24rpx}
.act-card{display:flex;flex-direction:column;align-items:center;gap:8rpx;padding:32rpx 10rpx;background:var(--cream);border:2rpx solid var(--dot);border-radius:24rpx;transition:transform 0.15s var(--ease-bounce),border-color 0.2s,background 0.2s}
.act-card:active{transform:scale(0.88);border-color:var(--amber);background:var(--amber-lt);box-shadow:0 0 0 8rpx rgba(224,123,62,0.05)}
.act-emoji{font-size:40rpx;transition:transform 0.3s var(--ease-bounce)}
.act-card:active .act-emoji{transform:scale(1.2)}
.act-label{font-size:var(--font-body);font-weight:600;color:var(--ink)}

.quick-dual{display:flex;gap:12rpx;margin-bottom:24rpx}
.qd-btn{flex:1;text-align:center;padding:18rpx 8rpx;background:var(--amber-lt);border:1.5px solid var(--amber);border-radius:var(--radius-full);font-size:24rpx;color:var(--amber);font-weight:700;transition:transform 0.15s var(--ease-bounce)}
.qd-btn:active{transform:scale(0.93);background:var(--amber);color:#FFF}

.retro{text-align:center;margin-bottom:24rpx}
.retro-chips{display:flex;justify-content:center;gap:12rpx;margin-top:8rpx}
.r-chip{padding:10rpx 20rpx;background:var(--cream);border:1px solid var(--dot);border-radius:var(--radius-full);font-size:var(--font-caption);color:var(--ink-md)}
.r-chip:active{border-color:var(--amber)}

.timer-hero{display:flex;flex-direction:column;align-items:center;padding:48rpx 0}
.hero-avatar{width:200rpx;height:200rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:24rpx}
.hero-avatar.av-a{background:var(--amber-md)}
.hero-avatar.av-b{background:var(--rose-md)}
.hero-face{font-size:96rpx;animation:faceWiggle 0.6s ease-in-out infinite}
@keyframes faceWiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
.hero-name{font-family:var(--font-journal);font-size:var(--font-title);color:var(--ink)}
.hero-label{font-size:32rpx;color:var(--mint);margin-top:6rpx;font-weight:600}
.hero-time{font-size:var(--font-caption);color:var(--ink-lt);margin-top:4rpx;letter-spacing:3rpx}
.stop-btn{margin-top:32rpx;padding:22rpx 56rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:var(--radius-full);color:var(--twin-danger);font-size:var(--font-body);font-weight:600;transition:transform 0.15s var(--ease-bounce)}
.stop-btn:active{transform:scale(0.94);background:rgba(212,112,107,0.06)}

.dual-zone{display:flex;gap:16rpx;margin-bottom:16rpx}
.dual-card{flex:1;display:flex;flex-direction:column;align-items:center;gap:12rpx;padding:24rpx 10rpx;background:var(--cream);border:2rpx solid var(--dot);border-radius:24rpx}
.dual-avatar{width:120rpx;height:120rpx;border-radius:50%;display:flex;align-items:center;justify-content:center}
.dual-avatar.av-a{background:var(--amber-md)}
.dual-avatar.av-b{background:var(--rose-md)}
.dual-face-emoji{font-size:60rpx;animation:faceWiggle 0.6s ease-in-out infinite}
.dual-name{font-family:var(--font-journal);font-size:var(--font-body);font-weight:700;color:var(--ink)}
.dual-time{font-family:var(--font-journal);font-size:40rpx;color:var(--ink);letter-spacing:2rpx}
.stop-sm{padding:10rpx 28rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:var(--radius-full);font-size:var(--font-caption);color:var(--twin-danger)}
.stop-sm:active{background:rgba(212,112,107,0.06)}
.stop-all{width:100%;padding:20rpx;margin-top:12rpx;background:transparent;border:2rpx solid var(--twin-danger);border-radius:var(--radius-full);font-size:var(--font-body);font-weight:600;color:var(--twin-danger)}

.timeline{padding-top:24rpx}
.tl-item{display:flex;align-items:center;gap:14rpx;padding:12rpx 0}
.tl-dot{width:8rpx;height:8rpx;border-radius:50%;flex-shrink:0}
.tl-text{flex:1;font-size:var(--font-body);color:var(--ink)}
.tl-time{flex-shrink:0}
</style>
