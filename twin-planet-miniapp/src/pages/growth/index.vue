<template>
  <view class="growth-page page-enter">
    <view class="page-header">
      <text class="page-title">生长曲线</text>
      <text class="page-subtitle">每个宝宝都有自己的生长节奏 🌱</text>
    </view>

    <!-- 指标切换 -->
    <view class="indicator-tabs">
      <view class="tab-item" :class="{ active: indicator==='weight' }" @click="indicator='weight'">体重 (kg)</view>
      <view class="tab-item" :class="{ active: indicator==='length' }" @click="indicator='length'">身高 (cm)</view>
    </view>

    <!-- 空状态：无数据 -->
    <view v-if="!growthStore.hasRealData" class="empty-state">
      <text class="empty-emoji">📋</text>
      <text class="empty-title">等待第一次测量</text>
      <text class="empty-desc">每次测量都是一颗成长的小星星 ✦</text>
    </view>

    <!-- 图表卡片（有数据时显示） -->
    <view class="chart-card" v-if="growthStore.hasRealData">
      <view class="chart-header">
        <view class="legend-row">
          <view class="legend-item" v-if="babyA">
            <view class="legend-dot" style="background:var(--amber)" />
            <text class="legend-label">{{ babyA.nickname || babyA.name }}</text>
          </view>
          <view class="legend-item" v-if="babyB">
            <view class="legend-dot" style="background:var(--rose)" />
            <text class="legend-label">{{ babyB.nickname || babyB.name }}</text>
          </view>
        </view>
        <view class="diff-text" v-if="showDiff && diffText" @click="showDiff=false">{{ diffText }}</view>
        <view class="diff-toggle" v-if="!showDiff && diffText" @click="showDiff=true">
          <text>查看对比</text>
        </view>
      </view>

      <ec-canvas canvas-id="growth-chart" :width="chartWidth" :height="chartHeight" :option="chartOption" />

      <view class="disclaimer">
        <text class="disclaimer-icon">⚠️</text>
        <text class="disclaimer-text">曲线基于 WHO 儿童生长标准（2006），仅供参考，不构成医疗建议。</text>
      </view>
    </view>

    <!-- 双宝数据卡 -->
    <view class="data-cards" v-if="babyA || babyB">
      <view class="data-card journal-card" v-if="babyA" :style="{borderLeft:'4rpx solid var(--amber)'}">
        <text class="card-name">{{ babyA.nickname || babyA.name }}</text>
        <text class="card-gender">{{ babyA.gender==='male'?'👦':'👧' }} {{ babyA.gender==='male'?'男孩':'女孩' }}</text>
        <view class="card-stats" v-if="latestA">
          <view class="stat-item">
            <text class="stat-value">{{ indicator==='weight'?latestA.weight:latestA.height }}</text>
            <text class="stat-unit">{{ indicator==='weight'?'kg':'cm' }}</text>
          </view>
          <view class="stat-item"><text class="stat-label">百分位</text><text class="stat-value-sm">P{{ percentileA }}</text>
	          <text class="percentile-hint" v-if="percentileA">{{ percentileHint(percentileA) }}</text></view>
        </view>
        <text v-else class="card-no-data">等待记录 ✦</text>
      </view>

      <view class="data-card" v-if="babyB" :style="{borderLeft:'4rpx solid var(--rose)'}">
        <text class="card-name">{{ babyB.nickname || babyB.name }}</text>
        <text class="card-gender">{{ babyB.gender==='male'?'👦':'👧' }} {{ babyB.gender==='male'?'男孩':'女孩' }}</text>
        <view class="card-stats" v-if="latestB">
          <view class="stat-item">
            <text class="stat-value">{{ indicator==='weight'?latestB.weight:latestB.height }}</text>
            <text class="stat-unit">{{ indicator==='weight'?'kg':'cm' }}</text>
          </view>
          <view class="stat-item"><text class="stat-label">百分位</text><text class="stat-value-sm">P{{ percentileB }}</text>
	          <text class="percentile-hint" v-if="percentileB">{{ percentileHint(percentileB) }}</text></view>
        </view>
        <text v-else class="card-no-data">等待记录 ✦</text>
      </view>
    </view>

    <!-- 快速添加测量 -->
    <view class="add-section">
      <view class="add-toggle" @click="showAdd=!showAdd">
        <text>{{ showAdd?'收起':'+ 添加测量' }}</text>
      </view>
      <view v-if="showAdd" class="add-form">
        <view class="add-row">
          <view class="add-baby-chip" :class="{active:addBabyId===babyA?.id}" @click="addBabyId=babyA?.id" v-if="babyA">{{ babyA.nickname||babyA.name }}</view>
          <view class="add-baby-chip" :class="{active:addBabyId===babyB?.id}" @click="addBabyId=babyB?.id" v-if="babyB">{{ babyB.nickname||babyB.name }}</view>
        </view>
        <view class="add-inputs">
          <input class="add-input" type="digit" v-model="addWeight" placeholder="体重(kg)" />
          <input class="add-input" type="digit" v-model="addHeight" placeholder="身高(cm)" />
        </view>
        <view class="add-date-row">
          <picker mode="date" :value="addDate" :end="todayDate" @change="(e: any) => { addDate = e.detail.value }">
            <view class="add-date-picker"><text>{{ addDate || '选择日期' }}</text><text class="date-arrow">📅</text></view>
          </picker>
        </view>
        <button class="add-btn" @click="submitMeasurement" :disabled="!canSubmit">保存测量</button>
      </view>
    </view>

    <!-- 就诊速查卡导出 -->
    <view class="export-section" v-if="babyA && babyB && growthStore.hasRealData">
      <button class="export-btn" @click="exportClinicCard" :disabled="exporting">
        {{ exporting ? '生成中...' : '🏥 导出就诊速查卡' }}
      </button>
      <text class="export-hint">双宝对比摘要，方便儿科就诊时给医生看</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref,computed,onMounted} from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import EcCanvas from '@/components/ec-canvas/ec-canvas.vue'
import {useBabiesStore} from '@/stores/babies'
import {useGrowthStore} from '@/stores/growth'
import {
  getPercentileCurve,getLMS,calcZScore,zScoreToPercentile,calcDifferenceRate,
type Gender,type Indicator,type DiffResult,
} from '@/utils/whoGrowth'
import { drawClinicCard } from '@/utils/clinicCard'

const babiesStore=useBabiesStore()
const growthStore=useGrowthStore()
const babyA=computed(()=>babiesStore.babyA)
const babyB=computed(()=>babiesStore.babyB)

const indicator=ref<Indicator>('weight')
const showDiff=ref(false)
const CHART_W=345;const CHART_H=320
const chartWidth=computed(()=>Math.min(uni.getSystemInfoSync().windowWidth-30,375))
const chartHeight=ref(CHART_H)

// 获取宝宝月龄（早产儿 <37 周使用矫正月龄）
const TERM_WEEKS = 37
function calcAgeMonths(birthDate:string, gestationalWeeks?:number):number{
  const b=new Date(birthDate);const n=new Date()
  const chronAge=(n.getFullYear()-b.getFullYear())*12+(n.getMonth()-b.getMonth())
  // 早产儿矫正：矫正月龄 = 实际月龄 - (40 - 胎龄) / 4
  if (gestationalWeeks && gestationalWeeks < TERM_WEEKS) {
    const prematurityMonths = (40 - gestationalWeeks) / 4
    const corrected = chronAge - prematurityMonths
    return Math.max(0, Math.round(corrected))
  }
  return chronAge
}

// 真实测量数据
const dataA=computed(()=>babyA.value?growthStore.forBaby(babyA.value.id):[])
const dataB=computed(()=>babyB.value?growthStore.forBaby(babyB.value.id):[])
const latestA=computed(()=>babyA.value?growthStore.latestForBaby(babyA.value.id):null)
const latestB=computed(()=>babyB.value?growthStore.latestForBaby(babyB.value.id):null)

// 百分位计算
function calcPercentile(baby:any,latest:any):number{
  if(!baby||!latest)return 0
  const gender:Gender=baby.gender==='male'?'male':'female'
  const ageMonths=calcAgeMonths(baby.birthDate, (baby as any).gestationalWeeks)
  const lms=getLMS(gender,indicator.value,Math.min(ageMonths,60))
  if(!lms)return 0
  const val=indicator.value==='weight'?latest.weight:latest.height
  const z=calcZScore(val,lms.L,lms.M,lms.S)
  return Math.round(zScoreToPercentile(z))
}
const percentileA=computed(()=>calcPercentile(babyA.value,latestA.value))
const percentileB=computed(()=>calcPercentile(babyB.value,latestB.value))

// 自然语言差异（去焦虑化）
const diffText=computed(()=>{
  if(!latestA.value||!latestB.value)return''
  const sameGender=babyA.value?.gender===babyB.value?.gender
  const valA=indicator.value==='weight'?latestA.value.weight:latestA.value.height
  const valB=indicator.value==='weight'?latestB.value.weight:latestB.value.height
  const diff=calcDifferenceRate(valA,valB,sameGender)
  const aName=babyA.value?.nickname||babyA.value?.name||'大宝'
  const bName=babyB.value?.nickname||babyB.value?.name||'二宝'
  if(diff.rate<3)return`${aName}和${bName}差不多`
  if(diff.rate<8)return`${aName}稍微${valA>valB?'重':'轻'}一点`
  return`${aName}比${bName}${valA>valB?'重':'轻'} ${diff.rate.toFixed(0)}%`
})

// ECharts 配置
const chartOption=computed(()=>{
  const indicatorLabel=indicator.value==='weight'?'体重 (kg)':'身高 (cm)'
  const baby=babyA.value||babyB.value
  const gender:Gender=baby?.gender==='male'?'male':'female'
  const maxAge=Math.max(
    babyA.value?calcAgeMonths(babyA.value.birthDate, (babyA.value as any).gestationalWeeks):24,
    babyB.value?calcAgeMonths(babyB.value.birthDate, (babyB.value as any).gestationalWeeks):24
  )
  const p3=getPercentileCurve(gender,indicator.value,3)
  const p50=getPercentileCurve(gender,indicator.value,50)
  const p97=getPercentileCurve(gender,indicator.value,97)

  const series:any[]=[
    {type:'line',name:'P3',data:p3.points.map(p=>[p.x,p.y]),lineStyle:{color:'var(--ink-lt)',width:.5,type:'dotted'},symbol:'none',silent:true},
    {type:'line',name:'P50',data:p50.points.map(p=>[p.x,p.y]),lineStyle:{color:'var(--dot)',width:1,type:'dashed'},symbol:'none',silent:true},
    {type:'line',name:'P97',data:p97.points.map(p=>[p.x,p.y]),lineStyle:{color:'var(--ink-lt)',width:.5,type:'dotted'},symbol:'none',silent:true},
  ]
  if(dataA.value.length){
    series.push({
      type:'scatter',name:babyA.value?.nickname||'大宝',
      data:dataA.value.map(d=>[d.ageMonths,indicator.value==='weight'?d.weight:d.height]),
      itemStyle:{color:'var(--amber)'},symbol:'circle',symbolSize:8,
      emphasis:{symbolSize:12},
    })
  }
  if(dataB.value.length){
    series.push({
      type:'scatter',name:babyB.value?.nickname||'二宝',
      data:dataB.value.map(d=>[d.ageMonths,indicator.value==='weight'?d.weight:d.height]),
      itemStyle:{color:'var(--rose)'},symbol:'circle',symbolSize:8,
      emphasis:{symbolSize:12},
    })
  }

  return{
    grid:{left:12,right:16,top:20,bottom:12,containLabel:true},
    xAxis:{type:'value',name:'月龄',nameTextStyle:{fontSize:10,color:'var(--ink-md)'},min:0,max:Math.max(maxAge+6,12),axisLabel:{fontSize:9,color:'var(--ink-md)'},axisLine:{lineStyle:{color:'var(--dot)'}},splitLine:{show:false}},
    yAxis:{type:'value',name:indicatorLabel,nameTextStyle:{fontSize:10,color:'var(--ink-md)'},axisLabel:{fontSize:9,color:'var(--ink-md)'},axisLine:{lineStyle:{color:'var(--dot)'}},splitLine:{lineStyle:{color:'var(--dot)',type:'dashed'}}},
    series,legend:{show:false},
    tooltip:{trigger:'axis',backgroundColor:'var(--cream)',borderColor:'var(--dot)',textStyle:{color:'var(--ink)',fontSize:11}},
  }
})

// 添加测量表单
	// 百分位说明 — 纯描述性语言，不做健康判断（安全红线 #1）
	function percentileHint(p:number):string{
	  if(p<3)return '(低于 WHO 标准第 3 百分位，建议与儿科医生保持定期随访)'
	  if(p<15)return '(在 WHO 标准第 3-15 百分位区间)'
	  if(p<85)return '(在 WHO 标准第 15-85 百分位区间)'
	  if(p<97)return '(在 WHO 标准第 85-97 百分位区间)'
		return '(高于 WHO 标准第 97 百分位，建议与儿科医生保持定期随访)'
	}

const showAdd=ref(false)
const addBabyId=ref('')
const addWeight=ref('')
const addDate=ref(new Date().toISOString().slice(0,10))
const todayDate=computed(()=>new Date().toISOString().slice(0,10))
const addHeight=ref('')
const canSubmit=computed(()=>addBabyId.value&&(addWeight.value||addHeight.value))

function submitMeasurement(){
  if(!canSubmit.value)return
  const baby=addBabyId.value===babyA.value?.id?babyA.value:babyB.value
  if(!baby)return
  growthStore.addMeasurement({
    babyId:addBabyId.value,
    date:addDate.value,
    ageMonths:calcAgeMonths(baby.birthDate, (baby as any).gestationalWeeks),
    weight:parseFloat(addWeight.value)||0,
    height:parseFloat(addHeight.value)||0,
  })
  addWeight.value='';addHeight.value='';showAdd.value=false
  uni.showToast({title:'已保存 ✦',icon:'success',duration:1000})
}

onMounted(()=>{uni.setNavigationBarTitle({title:'生长曲线'});if(babyA.value)addBabyId.value=babyA.value.id})
onShareAppMessage(()=>({title:'双宝生长曲线 · WHO国际标准对比',path:'/pages/growth/index',imageUrl:'/static/share-brand.png'}))
const exporting=ref(false)
async function exportClinicCard(){
  if(exporting.value||!babyA.value||!babyB.value)return
  exporting.value=true
  try{
    const path=await drawClinicCard({
      babyAName:babyA.value.nickname||babyA.value.name,
      babyBName:babyB.value.nickname||babyB.value.name,
      babyAGender:babyA.value.gender==='male'?'男':'女',
      babyBGender:babyB.value.gender==='male'?'男':'女',
      babyABirth:babyA.value.birthDate,
      babyBBirth:babyB.value.birthDate,
      babyAWeight:latestA.value?.weight||0,
      babyBWeight:latestB.value?.weight||0,
      babyAHeight:latestA.value?.height||0,
      babyBHeight:latestB.value?.height||0,
    })
    uni.showToast({title:'速查卡已生成',icon:'success'})
  }catch(e:any){
    uni.showToast({title:e?.message||'生成失败',icon:'none'})
  }finally{exporting.value=false}
}
</script>

<style scoped>
.growth-page{min-height:100vh;background:var(--paper);padding:32rpx 28rpx calc(64rpx + env(safe-area-inset-bottom))}
.page-header{margin-bottom:24rpx}
.page-title{display:block;font-family:var(--font-journal);font-size:var(--font-title);color:var(--ink)}
.page-subtitle{font-size:var(--font-body);color:var(--ink-md);margin-top:4rpx}

.indicator-tabs{display:flex;gap:12rpx;margin-bottom:24rpx}
.tab-item{flex:1;text-align:center;padding:20rpx 0;border-radius:var(--radius-md);font-size:var(--font-body);font-weight:600;color:var(--ink-md);background:var(--cream);border:2rpx solid var(--dot);transition:all .2s var(--ease-soft)}
.tab-item.active{background:var(--ink);color:#FFF;border-color:var(--ink)}

.empty-state{text-align:center;padding:120rpx 40rpx}
.empty-emoji{font-size:80rpx;display:block;margin-bottom:16rpx}
.empty-title{font-family:var(--font-journal);font-size:var(--font-card);color:var(--ink);display:block}
.empty-desc{font-size:var(--font-body);color:var(--ink-md);margin-top:8rpx}

.chart-card{background:var(--cream);border-radius:var(--radius-lg);padding:28rpx 20rpx 12rpx;margin-bottom:20rpx;border:2rpx solid var(--dot)}
.chart-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12rpx;padding:0 8rpx}
.legend-row{display:flex;gap:24rpx}
.legend-item{display:flex;align-items:center;gap:8rpx}
.legend-dot{width:12rpx;height:12rpx;border-radius:50%}
.legend-label{font-size:var(--font-body);font-weight:600;color:var(--ink)}
.diff-text{font-size:var(--font-caption);color:var(--mint);font-weight:600;font-family:var(--font-journal)}
.diff-toggle{font-size:var(--font-caption);color:var(--ink-lt);text-decoration:underline;padding:2rpx 0}
.disclaimer{display:flex;align-items:flex-start;gap:8rpx;padding:12rpx 8rpx 4rpx;margin-top:8rpx;border-top:1px solid var(--dot)}
.disclaimer-icon{font-size:24rpx;flex-shrink:0}
.disclaimer-text{font-size:var(--font-caption);color:var(--ink-md);line-height:1.5}

.data-cards{display:flex;gap:14rpx;margin-bottom:24rpx}
.data-card{flex:1;background:var(--cream);border-radius:var(--radius-md);padding:28rpx;border:2rpx solid var(--dot)}
.card-name{display:block;font-family:var(--font-journal);font-size:var(--font-card);color:var(--ink);font-weight:700}
.card-gender{font-size:var(--font-caption);color:var(--ink-md);margin-top:2rpx}
.card-stats{display:flex;justify-content:space-between;align-items:baseline;margin-top:16rpx}
.stat-value{font-size:48rpx;font-weight:700;color:var(--ink)}
.stat-unit{font-size:var(--font-caption);color:var(--ink-md);margin-left:4rpx}
.stat-label{display:block;font-size:var(--font-caption);color:var(--ink-lt);margin-bottom:4rpx}
.stat-value-sm{font-size:28rpx;font-weight:600;color:var(--mint)}
.card-no-data{font-size:var(--font-caption);color:var(--ink-lt);margin-top:16rpx;display:block}

.add-section{margin-top:8rpx}
.add-toggle{text-align:center;padding:20rpx;font-size:var(--font-body);color:var(--amber);font-weight:600}
.add-form{background:var(--cream);border:2rpx solid var(--dot);border-radius:var(--radius-md);padding:28rpx}
.add-row{display:flex;gap:16rpx;margin-bottom:20rpx}
.add-baby-chip{flex:1;text-align:center;padding:16rpx;border-radius:var(--radius-sm);font-size:var(--font-body);font-weight:600;background:var(--paper);color:var(--ink-md);border:2rpx solid var(--dot);transition:all .15s var(--ease-bounce)}
.add-baby-chip.active{border-color:var(--amber);color:var(--amber);background:var(--amber-lt)}
.add-inputs{display:flex;gap:12rpx;margin-bottom:16rpx}
.add-input{flex:1;padding:16rpx 20rpx;background:var(--paper);border:2rpx solid var(--dot);border-radius:var(--radius-sm);font-size:var(--font-body);color:var(--ink)}
.add-btn{width:100%;padding:22rpx;background:var(--amber);color:#FFF;border:none;border-radius:var(--radius-md);font-size:var(--font-body);font-weight:700}
.add-btn[disabled]{opacity:.4}

.add-date-row{margin-top:12rpx}
.add-date-picker{display:flex;align-items:center;justify-content:space-between;padding:16rpx 20rpx;background:var(--paper);border:2rpx solid var(--dot);border-radius:var(--radius-sm);font-size:var(--font-body);color:var(--ink)}
.date-arrow{font-size:24rpx}

.percentile-hint{display:block;font-size:var(--font-caption);color:var(--ink-md);margin-top:2rpx;font-family:var(--font-journal)}

.export-section{display:flex;flex-direction:column;align-items:center;gap:12rpx;margin-top:48rpx;padding-top:32rpx;border-top:2rpx dashed var(--dot)}
.export-btn{width:100%;padding:24rpx;background:var(--cream);border:2rpx solid var(--dot);border-radius:var(--radius-md);font-family:var(--font-journal);font-size:30rpx;font-weight:700;color:var(--ink);text-align:center}
.export-btn::after{border:none}
.export-btn:active{background:var(--amber-lt);border-color:var(--amber)}
.export-btn[disabled]{opacity:.4}
.export-hint{font-size:22rpx;color:var(--ink-lt)}
</style>
