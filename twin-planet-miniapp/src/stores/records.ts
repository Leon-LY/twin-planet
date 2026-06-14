/**
 * 记录状态管理
 * 管理喂养/睡眠/换尿布计时器、最近记录、双轨时间轴
 * 支持双计时器同时运行 —— 两个宝宝可以同时计时
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabiesStore, type Baby } from './babies'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export type RecordType = 'feeding' | 'sleep' | 'diaper' | 'temperature' | 'medicine' | 'bath'

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
  /** 全局秒级 tick — 单向递增计数器，避免每 tick 重建对象树 */
  const _tick = ref(0)
  const logs = ref<RecordLog[]>(_p.load() ?? [])
  const selectedBabyId = ref<string | null>(null)
  let _tickHandle: ReturnType<typeof setInterval> | null = null

  /** 启动全局心跳（仅在首次 startTimer 时调用） */
  function _ensureTick() {
    if (_tickHandle) return
    _tickHandle = setInterval(() => { _tick.value++ }, TIMER_TICK_MS)
  }
  /** 停止全局心跳（无计时器时调用） */
  function _stopTick() {
    if (!_tickHandle) return
    clearInterval(_tickHandle)
    _tickHandle = null
  }

  // 恢复持久化的计时器（App 被杀后恢复）
  try {
    const raw = uni.getStorageSync('tp_active_timer')
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved.babyId && saved.type && saved.startedAt) {
        _timers.value = { [saved.babyId]: { babyId: saved.babyId, type: saved.type, startedAt: saved.startedAt, elapsed: 0, timerHandle: null as any } }
        _ensureTick()
        console.log('[records] Restored active timer for', saved.babyId)
      }
    }
  } catch {}

  function _saveLogs() {
    _p.save(logs.value.slice(-200)) // 只保留最近 200 条，控制存储体积
  }

  // ---- getters ----
  const babiesStore = useBabiesStore()

  /** 是否有任何计时器在运行 */
  const isRunning = computed(() => Object.keys(_timers.value).length > 0)

  /** 第一个运行中计时器的 elapsed（基于全局 _tick） */
  const runningTimer = computed(() => {
    _tick.value
    const ids = Object.keys(_timers.value)
    if (ids.length === 0) return null
    const t = _timers.value[ids[0]]
    const elapsed = Math.floor((Date.now() - t.startedAt) / 1000)
    return { ...t, elapsed }
  })

  /** 活跃计时器列表（elapsed 基于全局 tick 实时计算） */
  const runningTimers = computed(() => {
    _tick.value
    return Object.values(_timers.value).map(t => ({
      ...t,
      elapsed: Math.floor((Date.now() - t.startedAt) / 1000),
    }))
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
    const t = _timers.value[babyId]
    if (!t) return null
    _tick.value
    return { ...t, elapsed: Math.floor((Date.now() - t.startedAt) / 1000) }
  }

  // ---- actions ----

  /** 私有：停止单个宝宝的计时器并保存记录 */
  function _stopOne(babyId: string): RecordLog | null {
    const timer = _timers.value[babyId]
    if (!timer) return null

    const endedAt = Date.now()
    const durationMin = Math.round((endedAt - timer.startedAt) / 60000)

    // 至少 1 分钟才记录
    if (durationMin < 1) {
      const newTimers = { ..._timers.value }
      delete newTimers[babyId]
      _timers.value = newTimers
      if (Object.keys(newTimers).length === 0) _stopTick()
      return null
    }

    const baby = babiesStore.getBaby(timer.babyId)
    if (!baby) {
      const newTimers = { ..._timers.value }
      delete newTimers[babyId]
      _timers.value = newTimers
      if (Object.keys(newTimers).length === 0) _stopTick()
      return null
    }

    let detail = ''
    if (timer.type === 'feeding') {
      const sideLabel = timer.feedingSide === 'left' ? '左' : timer.feedingSide === 'right' ? '右' : timer.feedingSide === 'bottle' ? '瓶喂' : ''
      const amountStr = timer.amountMl ? ` ${timer.amountMl}ml` : ''
      detail = sideLabel ? `${sideLabel}${amountStr} ${durationMin}分钟` : `喂养 ${durationMin}分钟`
    } else if (timer.type === 'sleep') {
      detail = `睡眠 ${durationMin}分钟`
    } else if (timer.type === 'diaper') {
      const diaperLabel = timer.diaperType === 'wet' ? '💧' : timer.diaperType === 'dirty' ? '💩' : timer.diaperType === 'both' ? '💧💩' : ''
      detail = `换尿布${diaperLabel ? ' ' + diaperLabel : ''}`
    } else if (timer.type === 'temperature') {
      detail = '体温'
    } else if (timer.type === 'medicine') {
      detail = '用药'
    } else if (timer.type === 'bath') {
      detail = '洗澡'
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
    // 清除持久化的计时器 + 停止全局心跳
    if (Object.keys(newTimers).length === 0) {
      _stopTick()
      try { uni.removeStorageSync('tp_active_timer') } catch {}
    }

    return log
  }

  /** 启动计时器（1 tap）。只停止同一宝宝的旧计时器，允许不同宝宝同时跑 */
  function startTimer(babyId: string, type: RecordType) {
    // 只停止同一宝宝的旧计时器
    if (_timers.value[babyId]) {
      _stopOne(babyId)
    }

    _ensureTick() // 启动全局心跳（幂等）

    _timers.value = {
      ..._timers.value,
      [babyId]: {
        babyId,
        type,
        startedAt: Date.now(),
        elapsed: 0,
        timerHandle: null as any, // 不再使用独立 interval handle
      },
    }
    // 持久化计时器状态，防止 App 被杀后丢失
    try { uni.setStorageSync('tp_active_timer', JSON.stringify({ babyId, type, startedAt: Date.now() })) } catch {}
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

  /** 快速记录（无计时），支持回溯时间偏移 */
  function quickLog(babyId: string, type: RecordType, amountMl?: number, offsetMs?: number) {
    const baby = babiesStore.getBaby(babyId)
    if (!baby) return

    const now = Date.now() - (offsetMs || 0)
    let detail = ''
    if (type === 'feeding') detail = `快速记录${amountMl ? ` ${amountMl}ml` : ''}`
    else if (type === 'sleep') detail = '快速记录 · 睡眠'
    else if (type === 'diaper') detail = '快速记录 · 换尿布'
    else if (type === 'temperature') detail = '快速记录 · 体温'
    else if (type === 'medicine') detail = '快速记录 · 用药'
    else if (type === 'bath') detail = '快速记录 · 洗澡'

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

  /** 宇宙洞察 — 基于今日记录的诗意总结 */
  const cosmicInsight = computed(() => {
    const todayLogs = logs.value.filter(l => l.createdAt >= new Date().setHours(0,0,0,0))
    const total = todayLogs.length
    if (total === 0) return '两颗星球等待今天的第一次星际守护 ✦'
    const feedCount = todayLogs.filter(l => l.type === 'feeding').length
    const sleepCount = todayLogs.filter(l => l.type === 'sleep').length
    const parts: string[] = []
    if (feedCount > 0) parts.push(`${feedCount}次星光降临`)
    if (sleepCount > 0) parts.push(`${sleepCount}次休眠`)
    const runningCount = Object.keys(_timers.value).length
    if (runningCount > 0) parts.push(`${runningCount}颗星球正在接收星光`)
    if (parts.length === 0) parts.push(`${total}次星际守护`)
    return `今日：${parts.join(' · ')} ✦`
  })

  /** 双星同步率 — 30分钟内同类型记录的匹配比例 */
  const twinSyncRate = computed(() => {
    const todayLogs = logs.value.filter(l => l.createdAt >= new Date().setHours(0,0,0,0))
    if (todayLogs.length < 2) return 0
    const babiesStore = useBabiesStore()
    const aId = babiesStore.babyA?.id; const bId = babiesStore.babyB?.id
    if (!aId || !bId) return 0
    let syncCount = 0; let totalPairs = 0
    const aLogs = todayLogs.filter(l => l.babyId === aId)
    const bLogs = todayLogs.filter(l => l.babyId === bId)
    for (const al of aLogs) {
      const match = bLogs.find(bl => bl.type === al.type && Math.abs(bl.createdAt - al.createdAt) < 30 * 60000)
      if (match) syncCount++
      totalPairs++
    }
    return totalPairs > 0 ? Math.round((syncCount / totalPairs) * 100) : 0
  })

  /** 连胜天数 */
  const streakDays = computed(() => {
    if (!logs.value.length) return 0
    const dates = [...new Set(logs.value.map(l => new Date(l.createdAt).toISOString().slice(0,10)))].sort().reverse()
    const today = new Date().toISOString().slice(0,10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10)
    if (dates[0] !== today && dates[0] !== yesterday) return 0
    let streak = dates[0] === today ? 1 : 0
    for (let i = 1; i < dates.length; i++) {
      const d = new Date(dates[i-1]); d.setDate(d.getDate() - 1)
      if (dates[i] === d.toISOString().slice(0,10)) streak++
      else break
    }
    return streak
  })

  return {
    _timers, logs, selectedBabyId,
    isRunning, runningTimer, runningTimers, recentLogsByBaby,
    isBabyRunning, getTimer,
    startTimer, stopTimer, quickLog,
    cosmicInsight, twinSyncRate, streakDays,
  }
})
