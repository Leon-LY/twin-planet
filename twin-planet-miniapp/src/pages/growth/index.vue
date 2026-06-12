<template>
  <view class="growth-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="page-title">对比生长曲线</text>
      <text class="page-subtitle">WHO 国际标准 · 并蒂对比</text>
    </view>

    <!-- 指标切换 -->
    <view class="indicator-tabs">
      <view
        class="tab-item"
        :class="{ active: indicator === 'weight' }"
        @click="switchIndicator('weight')"
      >
        体重 (kg)
      </view>
      <view
        class="tab-item"
        :class="{ active: indicator === 'length' }"
        @click="switchIndicator('length')"
      >
        身高 (cm)
      </view>
    </view>

    <!-- 曲线图 -->
    <view class="chart-card">
      <view class="chart-header">
        <view class="legend-row">
          <view class="legend-item">
            <view class="legend-dot" style="background: #4299E1" />
            <text class="legend-label">安宁</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot" style="background: #F56565" />
            <text class="legend-label">安然</text>
          </view>
        </view>
        <view class="diff-badge" :class="'diff-' + diffResult.level">
          <text>差异 {{ diffResult.rate.toFixed(1) }}%</text>
        </view>
      </view>

      <ec-canvas
        canvas-id="growth-chart"
        :width="chartWidth"
        :height="chartHeight"
        :option="chartOption"
      />

      <!-- 安全免责声明 -->
      <view class="disclaimer">
        <text class="disclaimer-icon">⚠️</text>
        <text class="disclaimer-text">
          颜色仅为统计标记，不代表医学诊断。曲线基于 WHO 儿童生长标准（2006），仅供参考。
        </text>
      </view>
    </view>

    <!-- 数据卡片 -->
    <view class="data-cards">
      <view class="data-card card-aning">
        <view class="card-color-bar" style="background: #4299E1" />
        <text class="card-name">李牧川 · 安宁</text>
        <text class="card-gender">👦 男孩</text>
        <view class="card-stats">
          <view class="stat-item">
            <text class="stat-value">{{ latestAning[indicator] }}</text>
            <text class="stat-unit">{{ indicator === 'weight' ? 'kg' : 'cm' }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">百分位</text>
            <text class="stat-value-sm">{{ aningPercentile }}%</text>
          </view>
        </view>
      </view>

      <view class="data-card card-anran">
        <view class="card-color-bar" style="background: #F56565" />
        <text class="card-name">李牧岑 · 安然</text>
        <text class="card-gender">👧 女孩</text>
        <view class="card-stats">
          <view class="stat-item">
            <text class="stat-value">{{ latestAnran[indicator] }}</text>
            <text class="stat-unit">{{ indicator === 'weight' ? 'kg' : 'cm' }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">百分位</text>
            <text class="stat-value-sm">{{ anranPercentile }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 回来继续开发按钮 -->
    <view class="next-actions">
      <text class="next-hint">📋 Phase 0 生长曲线 Demo 已完成</text>
      <text class="next-hint-sub">下一步：双轨喂养记录页面</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EcCanvas from '@/components/ec-canvas/ec-canvas.vue'
import {
  getPercentileCurve,
  getLMS,
  calcZScore,
  zScoreToPercentile,
  calcDifferenceRate,
  BABY_COLORS,
  DIFF_COLORS,
  type Gender,
  type Indicator,
  type DiffResult,
  type GrowthDataPoint,
} from '@/utils/whoGrowth'

// ============================================================
// 状态
// ============================================================

const indicator = ref<Indicator>('weight')
const CHART_W = 345
const CHART_H = 320

// 响应式图表尺寸
const chartWidth = computed(() => {
  const sys = uni.getSystemInfoSync()
  return Math.min(sys.windowWidth - 30, 375) // 15px padding each side
})
const chartHeight = ref(CHART_H)

// ============================================================
// 模拟实测数据：龙凤胎，2022-07-07 出生，至今 ~48 个月
// ============================================================

function generateSimulatedData(
  gender: Gender,
  indicator: Indicator,
): GrowthDataPoint[] {
  const points: GrowthDataPoint[] = []
  // 模拟 0-48 个月，每 3 个月一个测量点（实际场景不会每月都测）
  const step = indicator === 'weight' ? 2 : 3 // 体重每2月，身高每3月
  for (let m = 0; m <= 48; m += step) {
    const lms = getLMS(gender, indicator, m)
    if (!lms) continue
    // 模拟实测值：在 P50 附近随机波动
    const zNoise = (Math.random() - 0.45) * 1.2 // 轻微偏下
    const measured = indicator === 'weight'
      ? lms.M * Math.pow(1 + lms.L * lms.S * zNoise, 1 / lms.L)
      : lms.M + lms.S * lms.M * zNoise
    points.push({ ageMonths: m, value: Math.round(measured * 100) / 100 })
  }
  return points
}

const simulatedBoyWeight = generateSimulatedData('male', 'weight')
const simulatedGirlWeight = generateSimulatedData('female', 'weight')
const simulatedBoyLength = generateSimulatedData('male', 'length')
const simulatedGirlLength = generateSimulatedData('female', 'length')

// 最新数据点
const latestAning = computed(() => {
  const data = indicator.value === 'weight' ? simulatedBoyWeight : simulatedBoyLength
  return { [indicator.value]: data[data.length - 1]?.value ?? 0 }
})
const latestAnran = computed(() => {
  const data = indicator.value === 'weight' ? simulatedGirlWeight : simulatedGirlLength
  return { [indicator.value]: data[data.length - 1]?.value ?? 0 }
})

// 百分位
const aningPercentile = computed(() => {
  const lms = getLMS('male', indicator.value, 48)
  if (!lms) return 0
  const val = indicator.value === 'weight'
    ? simulatedBoyWeight[simulatedBoyWeight.length - 1]?.value ?? 0
    : simulatedBoyLength[simulatedBoyLength.length - 1]?.value ?? 0
  const z = calcZScore(val, lms.L, lms.M, lms.S)
  return Math.round(zScoreToPercentile(z))
})
const anranPercentile = computed(() => {
  const lms = getLMS('female', indicator.value, 48)
  if (!lms) return 0
  const val = indicator.value === 'weight'
    ? simulatedGirlWeight[simulatedGirlWeight.length - 1]?.value ?? 0
    : simulatedGirlLength[simulatedGirlLength.length - 1]?.value ?? 0
  const z = calcZScore(val, lms.L, lms.M, lms.S)
  return Math.round(zScoreToPercentile(z))
})

// 差异率
const diffResult = computed<DiffResult>(() => {
  return calcDifferenceRate(
    latestAning.value[indicator.value] as number,
    latestAnran.value[indicator.value] as number,
    false, // 龙凤胎，不同性别
  )
})

// ============================================================
// ECharts 配置
// ============================================================

const chartOption = computed(() => {
  const indicatorLabel = indicator.value === 'weight' ? '体重 (kg)' : '身长/身高 (cm)'

  // WHO 百分位曲线
  const p3Boy = getPercentileCurve('male', indicator.value, 3)
  const p50Boy = getPercentileCurve('male', indicator.value, 50)
  const p97Boy = getPercentileCurve('male', indicator.value, 97)

  // 实测数据
  const boyData = indicator.value === 'weight' ? simulatedBoyWeight : simulatedBoyLength
  const girlData = indicator.value === 'weight' ? simulatedGirlWeight : simulatedGirlLength

  const boyPoints = boyData.map((d) => [d.ageMonths, d.value])
  const girlPoints = girlData.map((d) => [d.ageMonths, d.value])

  return {
    grid: {
      left: 12,
      right: 16,
      top: 20,
      bottom: 12,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '月龄',
      nameTextStyle: { fontSize: 10, color: '#A0AEC0' },
      min: 0,
      max: 48,
      axisLabel: { fontSize: 9, color: '#A0AEC0' },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: indicatorLabel,
      nameTextStyle: { fontSize: 10, color: '#A0AEC0' },
      axisLabel: { fontSize: 9, color: '#A0AEC0' },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      splitLine: { lineStyle: { color: '#EDF2F7', type: 'dashed' } },
    },
    series: [
      // WHO P3 参考带
      {
        type: 'line',
        name: 'P3 参考',
        data: p3Boy.points.map((p) => [p.x, p.y]),
        lineStyle: { color: '#CBD5E0', width: 0.5, type: 'dotted' },
        symbol: 'none',
        silent: true,
      },
      // WHO P50 参考线
      {
        type: 'line',
        name: 'P50 中位',
        data: p50Boy.points.map((p) => [p.x, p.y]),
        lineStyle: { color: '#E2E8F0', width: 1, type: 'dashed' },
        symbol: 'none',
        silent: true,
      },
      // WHO P97 参考带
      {
        type: 'line',
        name: 'P97 参考',
        data: p97Boy.points.map((p) => [p.x, p.y]),
        lineStyle: { color: '#CBD5E0', width: 0.5, type: 'dotted' },
        symbol: 'none',
        silent: true,
      },
      // 安宁实测
      {
        type: 'line',
        name: '安宁',
        data: boyPoints,
        lineStyle: { color: '#4299E1', width: 2.5 },
        itemStyle: { color: '#4299E1' },
        symbol: 'circle',
        symbolSize: 5,
        emphasis: { symbolSize: 8 },
      },
      // 安然实测
      {
        type: 'line',
        name: '安然',
        data: girlPoints,
        lineStyle: { color: '#F56565', width: 2.5 },
        itemStyle: { color: '#F56565' },
        symbol: 'circle',
        symbolSize: 5,
        emphasis: { symbolSize: 8 },
      },
    ],
    legend: { show: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textStyle: { color: '#2D3748', fontSize: 11 },
    },
  }
})

// ============================================================
// 方法
// ============================================================

function switchIndicator(ind: Indicator) {
  indicator.value = ind
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '生长曲线' })
})
</script>

<style scoped>
.growth-page {
  min-height: 100vh;
  background: #FFFBF5;
  padding: 16px 15px 40px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 16px;
}
.page-title {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #2D3748;
}
.page-subtitle {
  font-size: 12px;
  color: #A0AEC0;
  margin-top: 4px;
}

/* 指标切换 */
.indicator-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-radius: 10px;
  font-size: 14px;
  color: #A0AEC0;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  transition: all 0.2s;
}
.tab-item.active {
  background: #2D3748;
  color: #FFFFFF;
  border-color: #2D3748;
}

/* 图表卡片 */
.chart-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 14px 10px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 0 4px;
}
.legend-row {
  display: flex;
  gap: 16px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.legend-label {
  font-size: 13px;
  font-weight: 600;
  color: #2D3748;
}

/* 差异徽标 */
.diff-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.diff-green {
  background: #F0FFF4;
  color: #38A169;
}
.diff-yellow {
  background: #FFFAF0;
  color: #DD6B20;
}
.diff-red {
  background: #FFF5F5;
  color: #E53E3E;
}

/* 免责声明 */
.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 8px 4px;
  margin-top: 4px;
  border-top: 1px solid #EDF2F7;
}
.disclaimer-icon {
  font-size: 12px;
  flex-shrink: 0;
}
.disclaimer-text {
  font-size: 10px;
  color: #A0AEC0;
  line-height: 1.5;
}

/* 数据卡片 */
.data-cards {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.data-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.card-color-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 2px;
}
.card-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 2px;
}
.card-gender {
  font-size: 11px;
  color: #A0AEC0;
}
.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 10px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2D3748;
}
.stat-unit {
  font-size: 12px;
  color: #A0AEC0;
  margin-left: 3px;
}
.stat-label {
  display: block;
  font-size: 10px;
  color: #A0AEC0;
  margin-bottom: 2px;
}
.stat-value-sm {
  font-size: 16px;
  font-weight: 600;
  color: #48BB78;
}

/* 下一步 */
.next-actions {
  margin-top: 24px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 12px;
  text-align: center;
  border: 2px dashed #E2E8F0;
}
.next-hint {
  display: block;
  font-size: 13px;
  color: #2D3748;
  font-weight: 600;
}
.next-hint-sub {
  display: block;
  font-size: 11px;
  color: #A0AEC0;
  margin-top: 4px;
}
</style>
