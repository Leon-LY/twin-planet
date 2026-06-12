/**
 * 记录状态管理
 * 管理喂养/睡眠/换尿布计时器、最近记录、双轨时间轴
 * 支持双计时器同时运行 —— 两个宝宝可以同时计时
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabiesStore, type Baby } from './babies'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export type RecordType = 'feeding' | 'sleep' | 'diaper'

export interface TimerState {
  babyId: string
  type: RecordType
  startedAt: number         // Date.now()
  elapsed: number           // 秒
  timerHandle: ReturnType<typeof setInterval> | null
  // 喂养专用
  feedingSide?: 'left' | 'right' | 'bottle'
  amountMl?: number
  // 睡眠专用
  sleepQuality?: 1 | 2 | 3 | 4 | 5
  // 换尿布专用
  diaperType?: 'wet' | 'dirty' | 'both'
  diaperNote?: string
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
  detail: string          // "母乳左 120ml 20分钟" / "午睡 45分钟" / "湿尿布"
  createdAt: number
  // 扩展字段
  diaperType?: 'wet' | 'dirty' | 'both'
}

const TIMER_TICK_MS = 1000

export const useRecordsStore = defineStore('records', () => {
  // ---- state ----
  const _p = createPersistence<RecordLog[]>(PERSIST_KEYS.records)

  /** 活跃计时器 Map: babyId → TimerState，支持双宝同时计时 */
  const _timers = ref<Record<string, TimerState>>({})
  const logs = ref<RecordLog[]>(_p.load() ?? [])
  const selectedBabyId = ref<string | null>(null)

  function _saveLogs() {
    _p.save(logs.value.slice(-200)) // 只保留最近 200 条，控制存储体积
  }

  // ---- getters ----
  const babiesStore = useBabiesStore()

  /** 是否有任何计时器在运行 */
  const isRunning = computed(() => Object.keys(_timers.value).length > 0)

  /** 当前活跃计时器列表 */
  const runningTimers = computed(() => Object.values(_timers.value))

  /** 第一个运行中的计时器（向后兼容 snapshot 等页面） */
  const runningTimer = computed(() => {
    const ids = Object.keys(_timers.value)
    return ids.length > 0 ? _timers.value[ids[0]] : null
  })

  /** 按宝宝分组日志（最近30条） */
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
    return babyId in _timers.value
  }

  /** 获取某个宝宝当前的计时器 */
  function getTimer(babyId: string): TimerState | null {
    return _timers.value[babyId] ?? null
  }

  // ---- actions ----

  /** 私有：停止单个宝宝的计时器并保存记录 */
  function _stopOne(babyId: string): RecordLog | null {
    const timer = _timers.value[babyId]
    if (!timer) return null

    clearInterval(timer.timerHandle!)
    const endedAt = Date.now()
    const durationMin = Math.round((endedAt - timer.startedAt) / 60000)

    // 至少 1 分钟才记录
    if (durationMin < 1) {
      const newTimers = { ..._timers.value }
      delete newTimers[babyId]
      _timers.value = newTimers
      return null
    }

    const baby = babiesStore.getBaby(timer.babyId)
    if (!baby) {
      const newTimers = { ..._timers.value }
      delete newTimers[babyId]
      _timers.value = newTimers
      return null
    }

    let detail = ''
    if (timer.type === 'feeding') {
      const sideLabel = timer.feedingSide === 'left' ? '左' : timer.feedingSide === 'right' ? '右' : timer.feedingSide === 'bottle' ? '瓶喂' : ''
      const amountStr = timer.amountMl ? ` ${timer.amountMl}ml` : ''
      detail = sideLabel ? `${sideLabel}${amountStr} ${durationMin}分钟` : `喂养 ${durationMin}分钟`
    } else if (timer.type === 'sleep') {
      detail = `睡眠 ${durationMin}分钟`
    } else {
      const diaperLabel = timer.diaperType === 'wet' ? '💧' : timer.diaperType === 'dirty' ? '💩' : timer.diaperType === 'both' ? '💧💩' : ''
      detail = `换尿布${diaperLabel ? ' ' + diaperLabel : ''}`
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
      diaperType: timer.diaperType,
    }

    logs.value = [...logs.value, log]
    _saveLogs()

    // 从 Map 中移除（不可变更新）
    const newTimers = { ..._timers.value }
    delete newTimers[babyId]
    _timers.value = newTimers

    return log
  }

  /** 启动计时器（1 tap）。只停止同一宝宝的旧计时器，允许不同宝宝同时跑 */
  function startTimer(babyId: string, type: RecordType) {
    // 只停止同一宝宝的旧计时器
    if (_timers.value[babyId]) {
      _stopOne(babyId)
    }

    const handle = setInterval(() => {
      if (_timers.value[babyId]) {
        _timers.value = {
          ..._timers.value,
          [babyId]: {
            ..._timers.value[babyId],
            elapsed: _timers.value[babyId].elapsed + 1,
          },
        }
      }
    }, TIMER_TICK_MS)

    _timers.value = {
      ..._timers.value,
      [babyId]: {
        babyId,
        type,
        startedAt: Date.now(),
        elapsed: 0,
        timerHandle: handle,
      },
    }
    selectedBabyId.value = babyId
  }

  /** 停止计时器并保存记录。不传 babyId 则停止全部 */
  function stopTimer(babyId?: string): RecordLog | null {
    if (babyId) {
      return _stopOne(babyId)
    }
    // 停止全部
    const allIds = Object.keys(_timers.value)
    let lastLog: RecordLog | null = null
    for (const id of allIds) {
      const log = _stopOne(id)
      if (log) lastLog = log
    }
    return lastLog
  }

  /** 快速记录（无计时） */
  function quickLog(babyId: string, type: RecordType, amountMl?: number) {
    const baby = babiesStore.getBaby(babyId)
    if (!baby) return

    const now = Date.now()
    let detail = ''
    if (type === 'feeding') detail = `快速记录${amountMl ? ` ${amountMl}ml` : ''}`
    else if (type === 'sleep') detail = '快速记录'
    else detail = '快速记录 · 换尿布'

    const log: RecordLog = {
      id: `log-${now}`,
      babyId,
      babyName: baby.nickname || baby.name,
      babyColor: baby.color,
      type,
      startedAt: now,
      endedAt: now,
      durationMin: 0,
      detail,
      createdAt: now,
    }
    logs.value = [...logs.value, log]
    _saveLogs()
  }

  return {
    _timers, logs, selectedBabyId,
    isRunning, runningTimer, runningTimers, recentLogsByBaby,
    isBabyRunning, getTimer,
    startTimer, stopTimer, quickLog,
  }
})
