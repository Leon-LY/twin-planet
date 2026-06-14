/**
 * usePoeticTime — 诗意时间标签
 * 将计时器秒数映射为手帐诗意标签
 */
import { computed, type ComputedRef } from 'vue'

type TimerType = 'feeding' | 'sleep'

interface PoeticPhase {
  maxMin: number
  label: string
}

const FEEDING_PHASES: PoeticPhase[] = [
  { maxMin: 2, label: '刚刚开始' },
  { maxMin: 5, label: '刚开始 ✦' },
  { maxMin: 10, label: '航行中' },
  { maxMin: 15, label: '渐入佳境' },
  { maxMin: 20, label: '即将圆满' },
  { maxMin: Infinity, label: '满满记录' },
]

const SLEEP_PHASES: PoeticPhase[] = [
  { maxMin: 2, label: '刚刚入眠' },
  { maxMin: 5, label: '渐入佳境' },
  { maxMin: 10, label: '梦乡深处' },
  { maxMin: 15, label: '深度时光' },
  { maxMin: 20, label: '安心航行' },
  { maxMin: 30, label: '深空长夜' },
  { maxMin: 45, label: '星河漫渡' },
  { maxMin: Infinity, label: '继续守护' },
]

export function usePoeticTime(elapsedSec: ComputedRef<number>, type: ComputedRef<TimerType | undefined>) {
  const label = computed(() => {
    const phases = type.value === 'sleep' ? SLEEP_PHASES : FEEDING_PHASES
    const min = elapsedSec.value / 60
    for (const p of phases) {
      if (min < p.maxMin) return p.label
    }
    return phases[phases.length - 1].label
  })

  /** 轨道环目标圈数 (0-1)，超出后开始第二圈 */
  const orbitProgress = computed(() => {
    const targetMin = type.value === 'sleep' ? 60 : 20
    const min = elapsedSec.value / 60
    return (min % targetMin) / targetMin
  })

  /** 是否超出一圈（第二圈用金色） */
  const isSecondLap = computed(() => {
    const targetMin = type.value === 'sleep' ? 60 : 20
    return (elapsedSec.value / 60) >= targetMin
  })

  return { label, orbitProgress, isSecondLap }
}
