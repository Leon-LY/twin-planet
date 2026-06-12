<template>
  <view class="ec-canvas-container" :style="containerStyle">
    <canvas
      v-if="canvasId"
      type="2d"
      :id="canvasId"
      :canvas-id="canvasId"
      :style="canvasStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  canvasId?: string
  width?: number
  height?: number
  option?: echarts.EChartsOption
}>()

const emit = defineEmits<{
  (e: 'inited', chart: ReturnType<typeof echarts.init>): void
}>()

let chartInstance: ReturnType<typeof echarts.init> | null = null
const canvasWidth = ref(props.width ?? 375)
const canvasHeight = ref(props.height ?? 300)

const containerStyle = computed(() => ({
  width: canvasWidth.value + 'px',
  height: canvasHeight.value + 'px',
}))

const canvasStyle = computed(() => ({
  width: canvasWidth.value + 'px',
  height: canvasHeight.value + 'px',
}))

function getDpr(): number {
  // uni-app 小程序环境
  const sysInfo = uni.getSystemInfoSync()
  return sysInfo.pixelRatio ?? 2
}

async function initChart() {
  if (!props.canvasId) return

  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  try {
    const dpr = getDpr()

    // 获取 Canvas 节点
    const query = uni.createSelectorQuery()
    const res = await new Promise<UniApp.NodeInfo[]>((resolve) => {
      query
        .select(`#${props.canvasId}`)
        .fields({ node: true, size: true })
        .exec((data) => resolve(data as UniApp.NodeInfo[]))
    })

    const canvasNode = res[0]?.node
    if (!canvasNode) {
      console.warn('[ec-canvas] Canvas node not found, retrying...')
      setTimeout(initChart, 300)
      return
    }

    const canvas = canvasNode as unknown as HTMLCanvasElement
    canvas.width = canvasWidth.value * dpr
    canvas.height = canvasHeight.value * dpr

    chartInstance = echarts.init(canvas, undefined, {
      width: canvasWidth.value,
      height: canvasHeight.value,
      devicePixelRatio: dpr,
    })

    if (props.option) {
      chartInstance.setOption(props.option)
    }

    emit('inited', chartInstance)
  } catch (err) {
    console.error('[ec-canvas] Init failed:', err)
  }
}

function onTouchStart(e: any) {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'growthChart',
      action: 'showTip',
      dataIndex: 0,
    })
  }
}

function onTouchMove(e: any) {
  // ECharts tooltip 跟随
}

function onTouchEnd(e: any) {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'growthChart',
      action: 'hideTip',
    })
  }
}

watch(
  () => props.option,
  (newOpt) => {
    if (chartInstance && newOpt) {
      chartInstance.setOption(newOpt, true)
    }
  },
  { deep: true }
)

onMounted(() => {
  setTimeout(initChart, 200)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

defineExpose({
  getChart: () => chartInstance,
  refresh: () => {
    if (chartInstance && props.option) {
      chartInstance.setOption(props.option, true)
    }
  },
})
</script>

<style scoped>
.ec-canvas-container {
  position: relative;
  overflow: hidden;
}
</style>
