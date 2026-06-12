<template>
  <view class="ec-canvas-container" :style="containerStyle">
    <canvas
      v-if="canvasId"
      type="2d"
      :id="canvasId"
      :canvas-id="canvasId"
      :style="canvasStyle"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

defineProps<{
  canvasId?: string
  width?: number
  height?: number
  option?: any
}>()

const emit = defineEmits<{ (e: 'inited', chart: any): void }>()

let chartInstance: any = null
const canvasWidth = ref(375)
const canvasHeight = ref(300)

const containerStyle = computed(() => ({
  width: canvasWidth.value + 'px',
  height: canvasHeight.value + 'px',
}))
const canvasStyle = computed(() => ({
  width: canvasWidth.value + 'px',
  height: canvasHeight.value + 'px',
}))

function getDpr() {
  const sysInfo = uni.getSystemInfoSync()
  return sysInfo.pixelRatio ?? 2
}

/**
 * 加载 ECharts —— 微信小程序用分包静态文件 require.async 避免打入 vendor.js
 * 其他平台保持 npm 动态 import（支持 tree-shaking）
 */
async function loadEcharts(): Promise<any> {
  // #ifdef MP-WEIXIN
  return new Promise((resolve, reject) => {
    // 从 static/echarts/ 加载预置的 echarts.simple.min.js（~500KB）
    // require.async 仅在访问生长曲线页面时才加载，不影响首页启动
    ;(require as any).async?.('/static/echarts/echarts.min.js', (mod: any) => {
      resolve(mod)
    }, (err: any) => {
      reject(new Error('ECharts load failed: ' + JSON.stringify(err)))
    })
  })
  // #endif

  // #ifndef MP-WEIXIN
  const [echarts, { LineChart }, {
    TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  }, { CanvasRenderer }] = await Promise.all([
    (await import('echarts/core')).default || (await import('echarts/core')),
    import('echarts/charts'),
    import('echarts/components'),
    import('echarts/renderers'),
  ])

  const mod = echarts as any
  mod.use([
    (LineChart as any).default ?? LineChart,
    (TitleComponent as any).default ?? TitleComponent,
    (TooltipComponent as any).default ?? TooltipComponent,
    (GridComponent as any).default ?? GridComponent,
    (LegendComponent as any).default ?? LegendComponent,
    (CanvasRenderer as any).default ?? CanvasRenderer,
  ])
  return mod
  // #endif
}

async function initChart() {
  if (!(props as any).canvasId) return

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  try {
    const echarts = await loadEcharts()
    if (!echarts) return

    const dpr = getDpr()
    const query = uni.createSelectorQuery()
    const res: any = await new Promise((resolve) => {
      query.select(`#${(props as any).canvasId}`).fields({ node: true, size: true }).exec(resolve)
    })

    const canvasNode = res[0]?.node
    if (!canvasNode) {
      setTimeout(initChart, 300)
      return
    }

    canvasNode.width = canvasWidth.value * dpr
    canvasNode.height = canvasHeight.value * dpr

    chartInstance = echarts.init(canvasNode, undefined, {
      width: canvasWidth.value,
      height: canvasHeight.value,
      devicePixelRatio: dpr,
    })

    if ((props as any).option) {
      chartInstance.setOption((props as any).option)
    }
    emit('inited', chartInstance)
  } catch (err) {
    console.error('[ec-canvas] Init failed:', err)
  }
}

function onTouchStart() {}
function onTouchEnd() {}

watch(() => (props as any).option, (newOpt: any) => {
  if (chartInstance && newOpt) chartInstance.setOption(newOpt, true)
}, { deep: true })

onMounted(() => {
  setTimeout(initChart, 200)
})

onUnmounted(() => {
  if (chartInstance) { chartInstance.dispose(); chartInstance = null }
})

defineExpose({
  getChart: () => chartInstance,
  refresh: () => {
    if (chartInstance && (props as any).option) chartInstance.setOption((props as any).option, true)
  },
})
</script>

<style scoped>
.ec-canvas-container { position: relative; overflow: hidden; }
</style>
