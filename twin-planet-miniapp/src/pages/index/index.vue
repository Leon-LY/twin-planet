<template>
  <view :class="[themeClass, { 'font-large': isGrandma }]">
    <view class="page-shell journal">
      <view class="masthead">
        <view class="masthead-left">
          <text class="date-line">{{ dateStr }}</text>
          <text class="role-note">{{ roleEmoji }} {{ roleLabel }}</text>
        </view>
        <view class="masthead-right">
          <text v-if="streakDays > 0" class="streak-stamp">连续 {{ streakDays }} 天</text>
          <text v-else class="streak-start">今天开始</text>
        </view>
      </view>
      <view class="greeting">
        <text class="greet-line1">{{ greeting }}</text>
        <text class="greet-line2">{{ greetLine2 }}</text>
        <text class="greet-sub">{{ insightText }}</text>
      </view>
      <text class="journal-footer-text" v-if="streakDays > 0">连续记录第 {{ streakDays }} 天 ✦</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from "vue"
import { useUserStore } from "@/stores/user"
import { useBabiesStore } from "@/stores/babies"
import { useRecordsStore } from "@/stores/records"
import { useStickersStore } from "@/stores/stickers"
import { useAlertsStore } from "@/stores/alerts"
import { useStickerSync } from "@/composables/useStickerSync"
import { useQuickRef } from "@/composables/useQuickRef"
const loading=ref(true)
const userStore=useUserStore()
const themeClass=computed(()=>{const c=['page-root'];const h=new Date().getHours();if(h>=22||h<6)c.push('theme-dark');if(userStore.isGrandmaMode)c.push('font-large','role-granny');else if(userStore.isDad)c.push('role-dad');return c.join(' ')})
const isGrandma=computed(()=>userStore.isGrandmaMode)
const babiesStore=useBabiesStore();const recordsStore=useRecordsStore()
const stickersStore=useStickersStore();const alertsStore=useAlertsStore()
const {syncStickers}=useStickerSync();const {quickRef}=useQuickRef()
const babyA=computed(()=>babiesStore.babyA);const babyB=computed(()=>babiesStore.babyB)
const streakDays=computed(()=>recordsStore.streakDays)
const greeting=computed(()=>{const h=new Date().getHours();if(h<6)return'凌晨好';if(h<9)return'早上好';if(h<12)return'上午好';if(h<14)return'中午好';if(h<18)return'下午好';if(h<22)return'晚上好';return'夜深了'})
const greetLine2=computed(()=>{const h=new Date().getHours();const r=userStore.profile?.role;if(r==='dad'){if(h>=22||h<6)return'值班中，撑住 💪';if(h<9)return'早上好，今天你是超级奶爸';return'数据看板已就绪 📊'}if(r==='grandma'||r==='grandpa')return'';if(h>=22||h<6)return'夜深了，辛苦啦 🌙';if(h<9)return'新的一天，两个小怪兽醒了没';if(h<14)return'上午过半，奶茶续命时间 🧋';return'下午好，小怪兽们在干嘛呢'})
const roleEmoji=computed(()=>userStore.roleEmoji)
const roleLabel=computed(()=>userStore.roleLabel)
const dateStr=computed(()=>{const d=new Date();const days=['日','一','二','三','四','五','六'];return d.getMonth()+1+'月'+d.getDate()+'日 星期'+days[d.getDay()]})
const syncRate=computed(()=>recordsStore.twinSyncRate)
const insightText=computed(()=>{const s=syncRate.value;if(s>70)return'同步率 '+s+'% · 神同步！不愧是双胞胎';if(s>30)return'同步率 '+s+'% · 今天打架战绩：平局 🤼';if(s>0)return'各有各的节奏，挺好的';return'两个小怪兽，今天会同步吗？'})
const isRunningA=computed(()=>babyA.value?recordsStore.isBabyRunning(babyA.value.id):false)
const isRunningB=computed(()=>babyB.value?recordsStore.isBabyRunning(babyB.value.id):false)
onMounted(()=>{setTimeout(()=>{loading.value=false;syncStickers()},200)})
</script>
<style scoped>
.journal{position:relative;min-height:100vh;background:var(--paper);padding:32rpx 28rpx calc(64rpx + env(safe-area-inset-bottom))}
.masthead{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44rpx}
.masthead-left{display:flex;flex-direction:column;gap:8rpx}
.date-line{font-family:var(--font-journal);font-size:24rpx;color:var(--ink-md);letter-spacing:2rpx}
.role-note{font-size:20rpx;color:var(--ink-lt);display:inline-flex;align-items:center;gap:6rpx}
.masthead-right{display:flex;align-items:flex-end}
.streak-stamp{background:var(--gold-lt);padding:6rpx 14rpx;border-radius:4rpx 12rpx 4rpx 12rpx;font-family:var(--font-journal);font-size:20rpx;color:var(--gold);font-weight:700;transform:rotate(2deg);box-shadow:0 2rpx 6rpx rgba(200,153,62,.1);animation:stampIn .4s var(--ease-bounce)}
@keyframes stampIn{0%{transform:rotate(2deg)scale(0);opacity:0}70%{transform:rotate(-1deg)scale(1.1)}100%{transform:rotate(2deg)scale(1);opacity:1}}
.streak-start{font-size:20rpx;color:var(--ink-lt);font-family:var(--font-journal)}
.greeting{position:relative;z-index:1;margin-bottom:44rpx}
.greet-line1{display:block;font-family:var(--font-journal);font-size:64rpx;font-weight:400;color:var(--ink);letter-spacing:-1rpx;line-height:1.1}
.greet-line2{display:block;font-family:var(--font-journal);font-size:36rpx;color:var(--ink-md);margin-top:4rpx}
.greet-sub{display:block;font-size:26rpx;color:var(--ink-lt);margin-top:16rpx;line-height:1.5;max-width:480rpx}
.journal-footer-text{display:block;text-align:right;font-size:18rpx;color:var(--ink-lt);margin-top:20rpx}
</style>
