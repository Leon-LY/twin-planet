/**
 * 记录状态管理
 * 管理喂养/睡眠计时器、最近记录、双轨时间轴
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabiesStore, type Baby } from './babies'

export type RecordType = 'feeding' | 'sleep'

export interface TimerState {
  babyId: string
  type: RecordType
  startedAt: number        // Date.now()
  elapsed: number          // 秒
  timerHandle: ReturnType<typeof setInterval> | null
  // 喂养专用
  feedingSide?: 'left' | 'right' | 'bottle'
  amountMl?: number
  // 睡眠专用
  sleepQuality?: 1 | 2 | 3 | 4 | 5
}

export interface RecordLog {
  id: string
  babyId: string
  babyName: string
  babyColor: string
  type: RecordType
  startedAt: number
  endedAt: number
  durationMin: number
  detail: string          // "母乳左 120ml 20分钟" / "午睡 45分钟"
  createdAt: number
}

const TIMER_TICK_MS = 1000

export const useRecordsStore = defineStore('records', () => {
  // ---- state ----
  const activeTimer = ref<TimerState | null>(null)
  const logs = ref<RecordLog[]>([])
  const selectedBabyId = ref<string | null>(null)

  // ---- getters ----
  const babiesStore = useBabiesStore()

  const isRunning = computed(() => activeTimer.value !== null)
  const runningTimer = computed(() => activeTimer.value)

  // 按宝宝分组日志（最近20条）
  const recentLogsByBaby = computed(() => {
    const map: Record<string, RecordLog[]> = {}
    for (const log of logs.value.slice(-30)) {
      if (!map[log.babyId]) map[log.babyId] = []
      map[log.babyId].push(log)
    }
    return map
  })

  /** 某个宝宝当前是否在计时中 */
  function isBabyRunning(babyId: string): boolean {
    return activeTimer.value?.babyId === babyId
  }

  // ---- actions ----

  /** 启动计时器（1 tap） */
  function startTimer(babyId: string, type: RecordType) {
    // 如果已有计时器在跑，先停止
    if (activeTimer.value) {
      stopTimer()
    }

    const handle = setInterval(() => {
      if (activeTimer.value) {
        activeTimer.value = {
          ...activeTimer.value,
          elapsed: activeTimer.value.elapsed + 1,
        }
      }
    }, TIMER_TICK_MS)

    activeTimer.value = {
      babyId,
      type,
      startedAt: Date.now(),
      elapsed: 0,
      timerHandle: handle,
    }
    selectedBabyId.value = babyId
  }

  /** 停止计时器并保存记录（第 2 tap） */
  function stopTimer(): RecordLog | null {
    if (!activeTimer.value) return null

    const timer = activeTimer.value
    clearInterval(timer.timerHandle!)
    const endedAt = Date.now()
    const durationMin = Math.round((endedAt - timer.startedAt) / 60000)

    // 至少 1 分钟才记录
    if (durationMin < 1) {
      activeTimer.value = null
      return null
    }

    const baby = babiesStore.getBaby(timer.babyId)
    if (!baby) {
      activeTimer.value = null
      return null
    }

    let detail = ''
    if (timer.type === 'feeding') {
      const sideLabel = timer.feedingSide === 'left' ? '左' : timer.feedingSide === 'right' ? '右' : timer.feedingSide === 'bottle' ? '瓶喂' : ''
      const amountStr = timer.amountMl ? ` ${timer.amountMl}ml` : ''
      detail = sideLabel ? `${sideLabel}${amountStr} ${durationMin}分钟` : `喂养 ${durationMin}分钟`
    } else {
      detail = `睡眠 ${durationMin}分钟`
    }

    const log: RecordLog = {
      id: `log-${Date.now()}`,
      babyId: timer.babyId,
      babyName: baby.nickname || baby.name,
      babyColor: baby.color,
      type: timer.type,
      startedAt: timer.startedAt,
      endedAt,
      durationMin,
      detail,
      createdAt: endedAt,
    }

    logs.value = [...logs.value, log]
    activeTimer.value = null
    return log
  }

  /** 快速记录（无计时） */
  function quickLog(babyId: string, type: RecordType, amountMl?: number) {
    const baby = babiesStore.getBaby(babyId)
    if (!baby) return

    const now = Date.now()
    const log: RecordLog = {
      id: `log-${now}`,
      babyId,
      babyName: baby.nickname || baby.name,
      babyColor: baby.color,
      type,
      startedAt: now,
      endedAt: now,
      durationMin: 0,
      detail: type === 'feeding' ? `快速记录${amountMl ? ` ${amountMl}ml` : ''}` : '快速记录',
      createdAt: now,
    }
    logs.value = [...logs.value, log]
  }

  return {
    activeTimer, logs, selectedBabyId,
    isRunning, runningTimer, recentLogsByBaby,
    isBabyRunning,
    startTimer, stopTimer, quickLog,
  }
})
