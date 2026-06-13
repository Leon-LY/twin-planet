<!-- 双宝手帐 v4 -->
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
        <!-- 暖色光斑 -->
        <view class="bg-spot spot-a" />
        <view class="bg-spot spot-b" />

        <!-- 页眉 -->
        <view class="header reveal-1">
          <view class="header-left">
            <text class="date-tag">{{ dateStr }}</text>
            <text class="role-tag" @click="switchRole">{{ roleEmoji }} {{ roleLabel }}</text>
          </view>
          <view class="streak-stamp">
             <text v-if="streakDays > 0">✦ 连续 {{ streakDays }} 天</text><text v-else>✦ 今天开始</text>
          </view>
        </view>

        <!-- 问候 -->
        <view class="greet-zone reveal-2">
          <text class="greet-hand">{{ greeting }}</text>
          <text class="greet-hand"><text class="highlight">两个小怪兽</text></text>
          <view class="greet-quote">
            <text class="greet-emoji">{{ moodEmoji }}</text>
            <text>{{ insightText }}</text>
          </view>
        </view>

        <!-- 双宝卡片 — 重叠 -->
        <view class="twins-zone reveal-3">
          <view class="twin-card card-a" @click="goRecord">
            <view class="card-bg bg-a" />
            <view class="avatar-wrap">
              <view class="avatar av-a" :class="{ running: isRunningA }">
                <text class="av-emoji">{{ isRunningA ? '😋' : '😛' }}</text>
              </view>
              <text class="av-sparkle s1">⭐</text>
              <text class="av-sparkle s2">✨</text>
            </view>
            <text class="twin-name">{{ babyA?.nickname || babyA?.name || '大宝' }}</text>
            <text class="twin-role">大宝</text>
            <view class="twin-status">
              <text v-if="isRunningA" class="status-running"><text class="st-dot green"></text>喂奶中</text>
              <text v-else-if="babyStatus(babyA)" class="status-idle">{{ babyStatus(babyA) }}</text>
              <text v-else class="status-idle">轻触记录</text>
            </view>
          </view>

          <view class="twin-card card-b" @click="goRecord">
            <view class="card-bg bg-b" />
            <view class="avatar-wrap">
              <view class="avatar av-b" :class="{ running: isRunningB }">
                <text class="av-emoji">{{ isRunningB ? '😴' : '😪' }}</text>
              </view>
              <text class="av-sparkle s1">🌸</text>
              <text class="av-sparkle s2">💫</text>
            </view>
            <text class="twin-name">{{ babyB?.nickname || babyB?.name || '二宝' }}</text>
            <text class="twin-role">二宝</text>
            <view class="twin-status">
              <text v-if="isRunningB" class="status-running"><text class="st-dot green"></text>计时中</text>
              <text v-else-if="babyStatus(babyB)" class="status-idle">{{ babyStatus(babyB) }}</text>
              <text v-else class="status-idle">轻触记录</text>
            </view>
          </view>
        </view>

        <!-- 并蒂光桥 -->
        <view class="bridge-wrap reveal-4">
          <LightBridge :state="bridgeState" :height="40" :animated="true" />
        </view>

        <!-- 中央按钮 -->
        <view class="center-zone reveal-5">
          <view class="btn-stage">
            <view class="orbit-ring" />
            <text class="float-el f1">⭐</text><text class="float-el f2">💫</text>
            <button class="main-btn" @click="goRecord">
              <text class="btn-icon">✋</text>
              <text class="btn-text">记 一 笔</text>
            </button>
          </view>
        </view>

        <!-- 快捷 -->
        <view class="quick-row reveal-6" v-if="babyA && babyB">
          <view class="q-chip" @click="dualRecord('feeding')"><text>🍼 都喂了</text></view>
          <view class="q-chip" @click="dualRecord('sleep')"><text>😴 都睡了</text></view>
          <view class="q-chip" @click="dualRecord('diaper')"><text>🧷 都换了</text></view>
        </view>

        <text class="egg" v-if="streakDays > 0">1+1=11 · 端水失败的第 {{ streakDays }} 天</text>

        <!-- 底部 -->
        <view class="footer">
          <text class="f-item active">记录</text>
          <text class="f-item" @click="goGrowth">生长</text>
          <text class="f-item" @click="goSnapshot">快照</text>
          <text class="f-item" @click="goMore">发现</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed,ref,onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'
import TwinSkeleton from '@/components/twin-skeleton/twin-skeleton.vue'
import LightBridge from '@/components/cosmic/LightBridge.vue'

const loading=ref(true);const userStore=useUserStore()
const themeClass=computed(()=>{const c=['page-root'];const h=new Date().getHours();if(h>=22||h<6)c.push('theme-dark');if(userStore.isGrandmaMode)c.push('font-large','role-granny');else if(userStore.isDad)c.push('role-dad');return c.join(' ')})
onMounted(()=>{setTimeout(()=>{loading.value=false},400)})

const babiesStore=useBabiesStore();const recordsStore=useRecordsStore()
const isGrandma=computed(()=>userStore.isGrandmaMode)
const babyA=computed(()=>babiesStore.babyA);const babyB=computed(()=>babiesStore.babyB)
const streakDays=computed(()=>recordsStore.streakDays)
const isRunningA=computed(()=>babyA.value?recordsStore.isBabyRunning(babyA.value.id):false)
const isRunningB=computed(()=>babyB.value?recordsStore.isBabyRunning(babyB.value.id):false)

const greeting=computed(()=>{const h=new Date().getHours();if(h<6)return'凌晨好';if(h<9)return'早上好';if(h<12)return'上午好';if(h<14)return'中午好';if(h<18)return'下午好';if(h<22)return'晚上好';return'夜深了'})
const moodEmoji=computed(()=>{const h=new Date().getHours();if(h>=2&&h<6)return'😵';if(h>=22||h<2)return'🌙';return'👾'})
const roleEmoji=computed(()=>{const r=userStore.profile?.role;return r==='dad'?'👨':r==='grandma'?'👵':r==='grandpa'?'👴':r==='nanny'?'👩‍🍼':'👩'})
const roleLabel=computed(()=>{const r=userStore.profile?.role;return r==='dad'?'爸爸':r==='grandma'?'奶奶':r==='grandpa'?'爷爷':r==='nanny'?'育儿嫂':'妈妈'})
const dateStr=computed(()=>{const d=new Date();const days=['日','一','二','三','四','五','六'];return `${d.getMonth()+1}月${d.getDate()}日 · 星期${days[d.getDay()]}`})

function babyStatus(b:any):string{if(!b)return'';const logs=recordsStore.recentLogsByBaby[b.id];if(!logs?.length)return'';const last=logs[logs.length-1];const m=Math.floor((Date.now()-last.createdAt)/60000);const a=last.type==='feeding'?'喂奶':last.type==='sleep'?'睡觉':'记录';if(m<1)return`刚刚${a}`;if(m<60)return`${m}分钟前${a}`;return`${Math.floor(m/60)}小时前${a}`}

const syncRate=computed(()=>recordsStore.twinSyncRate)
const insightText=computed(()=>{const s=syncRate.value;if(s>70)return`今天同步率 ${s}% · 越来越有默契了`;if(s>30)return`今天同步率 ${s}% · 打架战绩：平局`;if(s>0)return`今天各有各的节奏`;return'今天的两个小怪兽'})
const bridgeState=computed(()=>{const aId=babyA.value?.id;const bId=babyB.value?.id;if(!aId||!bId)return'faint';const aLogs=recordsStore.recentLogsByBaby[aId]||[];const bLogs=recordsStore.recentLogsByBaby[bId]||[];const aRecent=aLogs.length&&(Date.now()-aLogs[aLogs.length-1].createdAt)<3600000;const bRecent=bLogs.length&&(Date.now()-bLogs[bLogs.length-1].createdAt)<3600000;if(aRecent&&bRecent)return'bright';if(aRecent)return'one-sided-a';if(bRecent)return'one-sided-b';if(aLogs.length||bLogs.length)return'steady';return'faint'})

function dualRecord(t:'feeding'|'sleep'|'diaper'){if(babyA.value)recordsStore.quickLog(babyA.value.id,t);if(babyB.value)recordsStore.quickLog(babyB.value.id,t);uni.showToast({title:t==='feeding'?'都喂了 ✦':t==='sleep'?'都睡了 ✦':'都换了 ✦',icon:'success'})}

const navigate=(url:string)=>uni.navigateTo({url})
const goRecord=()=>navigate('/pages/record/index')
const goGrowth=()=>navigate('/pages/growth/index')
const goSnapshot=()=>navigate('/pages/snapshot/index')
const goMore=()=>uni.showActionSheet({itemList:['萌芽日记','星尘日志','指挥官控制台','星光监测站','星际通讯','轨道决策','星座日志'],success:(res)=>uni.navigateTo({url:['/pages/sprout/index','/pages/contribution/index','/pages/duty/index','/pages/guardian/index','/pages/handover/index','/pages/school/index','/pages/milestones/index'][res.tapIndex]})})
const goHelp=()=>uni.showModal({title:'需要帮忙？',content:'打电话给家里人，或者打开记录页点最大的按钮就行。',confirmText:'我知道了',showCancel:false})
const switchRole=()=>{const roles=['👩 妈妈','👨 爸爸','👵 奶奶','👴 爷爷','👩‍🍼 育儿嫂','📝 重新创建家庭','🚪 退出登录'];uni.showActionSheet({itemList:roles,success:(res)=>{if(res.tapIndex===5){uni.reLaunch({url:'/pages/onboarding/family'})}else if(res.tapIndex===6){userStore.logout();uni.reLaunch({url:'/pages/login/index'})}else{const r=['mom','dad','grandma','grandpa','nanny'][res.tapIndex];userStore.setRole(r);uni.showToast({title:`已切换为${roles[res.tapIndex]}模式`,icon:'success',duration:1500})}}})}
</script>

<style scoped>
.journal{position:relative}

/* 暖色光斑 */
.bg-spot{position:absolute;pointer-events:none;z-index:0;border-radius:50%}
.spot-a{width:500rpx;height:500rpx;top:80rpx;left:-200rpx;background:radial-gradient(circle,rgba(224,123,62,0.04) 0%,transparent 60%)}
.spot-b{width:400rpx;height:400rpx;bottom:200rpx;right:-160rpx;background:radial-gradient(circle,rgba(92,154,110,0.03) 0%,transparent 60%)}

/* 页眉 */
.header{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36rpx}
.header-left{display:flex;flex-direction:column;gap:6rpx}
.date-tag{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md);letter-spacing:1rpx;padding-bottom:4rpx;border-bottom:1.5px solid var(--dot)}
.role-tag{font-size:20rpx;color:var(--ink-lt);padding:4rpx 12rpx;background:var(--cream);border-radius:8rpx;align-self:flex-start}
.role-tag:active{background:var(--amber-lt);color:var(--amber)}
.streak-stamp{background:var(--gold-lt);color:var(--gold);font-weight:700;font-size:22rpx;padding:8rpx 18rpx;border-radius:16rpx;letter-spacing:3rpx;font-family:var(--font-journal);box-shadow:0 2rpx 8rpx rgba(200,153,62,0.12);transform:rotate(3deg);animation:badgePop 0.5s var(--ease-bounce)}@keyframes badgePop{0%{transform:rotate(3deg)scale(0);opacity:0}70%{transform:rotate(-2deg)scale(1.15)}100%{transform:rotate(3deg)scale(1);opacity:1}}

/* 问候 */
.greet-zone{position:relative;z-index:1;margin-bottom:40rpx}
.greet-hand{font-family:var(--font-journal);font-size:56rpx;font-weight:400;color:var(--ink);letter-spacing:-1rpx;line-height:1.15;display:block}
.highlight{display:inline-block;position:relative}
.highlight::after{content:'';position:absolute;bottom:2rpx;left:-4rpx;right:-4rpx;height:12rpx;background:var(--amber-lt);z-index:-1;border-radius:4rpx;opacity:0.6}
.greet-quote{display:flex;align-items:center;gap:10rpx;margin-top:12rpx;font-size:28rpx;color:var(--ink-md)}
.greet-emoji{font-size:40rpx;animation:gentleBob 2.5s ease-in-out infinite}
@keyframes gentleBob{0%,100%{transform:translateY(0)rotate(0)}30%{transform:translateY(-6rpx)rotate(3deg)}60%{transform:translateY(2rpx)rotate(-2deg)}}

/* 双宝卡片 */
.twins-zone{position:relative;z-index:1;display:flex;gap:0;margin-bottom:28rpx}
.twin-card{flex:1;position:relative;padding:28rpx 16rpx 20rpx}
.twin-card:active{transform:scale(0.96);transition:transform 0.2s var(--ease-bounce)}
.twin-card.card-b{margin-left:-10rpx;z-index:0}
.twin-card.card-a{z-index:1}
.card-bg{position:absolute;inset:0;border-radius:28rpx;transition:box-shadow 0.3s,transform 0.2s var(--ease-bounce)}
.bg-a{background:var(--amber-lt);border:1.5px solid rgba(224,123,62,0.12);box-shadow:0 4rpx 16rpx rgba(224,123,62,0.06);transform:rotate(-0.5deg)}
.bg-b{background:var(--rose-lt);border:1.5px solid rgba(212,128,104,0.12);box-shadow:0 4rpx 16rpx rgba(212,128,104,0.06);transform:rotate(1deg)}

/* 头像 */
.avatar-wrap{position:relative;display:flex;justify-content:center;margin-bottom:16rpx}
.avatar{width:96rpx;height:96rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;transition:transform 0.3s var(--ease-bounce)}
.twin-card:active .avatar{transform:scale(1.1)}
.av-a{background:var(--amber-md)}
.av-b{background:var(--rose-md)}
.av-emoji{font-size:48rpx;line-height:1}
.avatar.running::before{content:'';position:absolute;inset:-8rpx;border-radius:50%;border:2rpx solid var(--mint);opacity:0.5;animation:ringPulse 2s ease-in-out infinite}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:0.35}50%{transform:scale(1.12);opacity:0.85}}

.av-sparkle{position:absolute;font-size:22rpx;pointer-events:none;z-index:2}
.av-sparkle.s1{top:-6rpx;right:-8rpx;animation:sparkleFloat 3s ease-in-out infinite}
.av-sparkle.s2{bottom:-6rpx;left:-8rpx;animation:sparkleFloat 3.5s ease-in-out infinite 0.8s}
@keyframes sparkleFloat{0%,100%{transform:translateY(0)scale(1);opacity:0.4}50%{transform:translateY(-8rpx)scale(1.3);opacity:1}}

.twin-name{font-family:var(--font-journal);font-size:var(--font-card);font-weight:700;color:var(--ink);text-align:center;display:block;margin-bottom:2rpx}
.twin-role{font-size:22rpx;color:var(--ink-lt);text-align:center;display:block;margin-bottom:8rpx}
.twin-status{font-size:24rpx;text-align:center;display:flex;align-items:center;justify-content:center;gap:6rpx}

/* 状态 */
.st-dot{width:6rpx;height:6rpx;border-radius:50%;display:inline-block}
.st-dot.green{background:var(--mint)}
.status-running{color:var(--mint);font-weight:600}
.status-idle{color:var(--ink-md)}

/* 并蒂光桥 */
.bridge-wrap{display:flex;justify-content:center;position:relative;z-index:1;margin-bottom:28rpx}

/* 中央按钮 */
.center-zone{flex:1;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;margin-bottom:20rpx}
.btn-stage{position:relative;width:440rpx;height:440rpx;display:flex;align-items:center;justify-content:center}
.orbit-ring{position:absolute;inset:0;border-radius:50%;border:2rpx dashed var(--dot);animation:spin 35s linear infinite;opacity:0.45}
@keyframes spin{to{transform:rotate(360deg)}}

/* 交错入场 */
.reveal-1{animation:revealUp 0.5s var(--ease-soft) both}
.reveal-2{animation:revealUp 0.5s var(--ease-soft) 0.08s both}
.reveal-3{animation:revealUp 0.5s var(--ease-soft) 0.16s both}
.reveal-4{animation:revealUp 0.5s var(--ease-soft) 0.24s both}
.reveal-5{animation:revealUp 0.5s var(--ease-soft) 0.32s both}
.reveal-6{animation:revealUp 0.5s var(--ease-soft) 0.40s both}
@keyframes revealUp{from{opacity:0;transform:translateY(16rpx)}to{opacity:1;transform:translateY(0)}}

.float-el{position:absolute;font-size:28rpx;pointer-events:none}
.f1{top:10rpx;left:30rpx;animation:orbFloat 4s ease-in-out infinite}
.f2{top:30rpx;right:20rpx;animation:orbFloat 3.5s ease-in-out infinite 0.6s}
@keyframes orbFloat{0%,100%{transform:translate(0,0)rotate(0);opacity:0.3}25%{transform:translate(6rpx,-10rpx)rotate(8deg);opacity:0.8}50%{transform:translate(-4rpx,-16rpx)rotate(-5deg);opacity:0.5}75%{transform:translate(-10rpx,-4rpx)rotate(-8deg);opacity:0.7}}

.main-btn{width:320rpx;height:320rpx;border-radius:50%;position:relative;z-index:2;background:var(--amber);border:none;color:#FFF;font-family:var(--font-journal);box-shadow:0 24rpx 64rpx rgba(224,123,62,0.22),0 8rpx 16rpx rgba(224,123,62,0.12),inset 0 3rpx 0 rgba(255,255,255,0.2),inset 0 -6rpx 12rpx rgba(0,0,0,0.08);transform:rotate(-3deg);transition:transform 0.18s var(--ease-bounce),box-shadow 0.18s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10rpx}
.main-btn::after{content:'';position:absolute;top:14rpx;left:22%;right:22%;height:35%;background:radial-gradient(ellipse at center,rgba(255,255,255,0.28) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.main-btn:active{transform:rotate(-3deg)scale(0.86);box-shadow:0 6rpx 20rpx rgba(224,123,62,0.18),0 2rpx 4rpx rgba(224,123,62,0.1)}
.btn-icon{font-size:64rpx;position:relative;z-index:1}
.btn-text{font-size:36rpx;font-weight:700;letter-spacing:6rpx;position:relative;z-index:1}

/* 快捷 */
.quick-row{display:flex;gap:12rpx;justify-content:center;position:relative;z-index:1;margin-bottom:24rpx}
.q-chip{padding:18rpx 28rpx;border-radius:20rpx;font-size:24rpx;font-weight:600;background:var(--cream);border:1.5px solid var(--dot);color:var(--ink-md);transition:transform 0.15s var(--ease-bounce),background 0.2s,border-color 0.2s}
.q-chip:active{transform:scale(0.88);background:var(--amber-lt);border-color:var(--amber);color:var(--amber)}

.egg{text-align:center;font-size:20rpx;color:var(--ink-lt);font-style:italic;margin-bottom:16rpx;opacity:0.4;position:relative;z-index:1}

/* 底部 */
.footer{display:flex;justify-content:center;gap:56rpx;padding-top:20rpx;border-top:1.5px solid var(--dot);position:relative;z-index:1}
.f-item{font-family:var(--font-journal);font-size:28rpx;color:var(--ink-lt);letter-spacing:3rpx}
.f-item.active{color:var(--amber);font-weight:700;position:relative}
.f-item.active::after{content:'';position:absolute;bottom:-22rpx;left:50%;transform:translateX(-50%);width:6rpx;height:6rpx;border-radius:50%;background:var(--amber)}

/* 奶奶模式 */
.granny-shell{display:flex;flex-direction:column;justify-content:center;min-height:100vh;padding:80rpx 48rpx!important}
.granny-actions{display:flex;flex-direction:column;gap:var(--space-md)}
.granny-btn{text-align:center;padding:56rpx;background:var(--cream);border-radius:var(--radius-lg);border:4rpx solid var(--dot);display:flex;flex-direction:column;align-items:center;gap:var(--space-sm)}
.granny-btn:active{border-color:var(--amber);transform:scale(0.97)}
.granny-help{border-color:var(--gold)}
.granny-emoji{font-size:72rpx}
.granny-label{font-size:48rpx;font-weight:700;color:var(--ink)}

/* === 角色：爸爸模式 — 去装饰、提效率 === */
.role-dad .float-el,.role-dad .av-sparkle,.role-dad .orbit-ring{display:none}
.role-dad .twin-card.card-b{margin-left:0}
.role-dad .bg-a,.role-dad .bg-b{transform:none!important}
.role-dad .main-btn{transform:none;width:280rpx;height:280rpx;border-radius:24rpx}
.role-dad .greet-emoji,.role-dad .greet-quote{display:none}
.role-dad .highlight::after{display:none}
.role-dad .egg{display:none}
.role-dad .greet-hand{font-size:40rpx}
.role-dad .main-btn::after{display:none}
.role-dad .btn-icon{font-size:40rpx}
.role-dad .btn-text{font-size:28rpx;letter-spacing:2rpx}

/* === 角色：奶奶模式增强 === */
.role-granny .float-el,.role-granny .av-sparkle,.role-granny .orbit-ring{display:none}
.role-granny .greet-emoji,.role-granny .greet-quote,.role-granny .egg{display:none}
.role-granny .bridge-wrap{display:none}
.role-granny .twin-card{flex:none;width:100%}
</style>
