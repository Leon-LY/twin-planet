/**
 * 记录状态管理
 * 管理喂养/睡眠/换尿布计时器、最近记录、双轨时间轴
 * 支持双计时器同时运行 —— 两个宝宝可以同时计时
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabiesStore, type Baby } from './babies'
import { useStickersStore, type StickerContext } from './stickers'
import { useUserStore } from './user'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { FULL_MOON_DATES } from '@/constants/dates'

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
  feedingMode?: 'breast' | 'bottle' | 'mixed'
  // 睡眠专用
  sleepQuality?: 1 | 2 | 3 | 4 | 5
  // 换尿布专用
  diaperType?: 'wet' | 'dirty' | 'both'
  diaperNote?: string
  // 体温专用
  temperatureValue?: number
  // 用药专用
  medicineName?: string
  medicineDosage?: string
  medicineUnit?: string
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
  /** 记录者角色：mom/dad/grandma/grandpa/nanny，用于判断信息可靠性 */
  recordedBy?: string
  // 扩展字段
  diaperType?: 'wet' | 'dirty' | 'both'
  temperatureValue?: number
  medicineName?: string
  medicineDosage?: string
  feedingMode?: 'breast' | 'bottle' | 'mixed'
  feedingSide?: 'left' | 'right' | 'bottle'
  amountMl?: number
}

const TIMER_TICK_MS = 1000
/** 最大计时时长（分钟），超时自动停止，防止忘记关闭导致垃圾数据 */
const MAX_TIMER_MINUTES: Record<string, number> = {
  feeding: 90,   // 1.5 小时（亲喂单次通常在 10-30 分钟，90分钟是极端上限）
  sleep: 240,    // 4 小时（新生儿单次睡眠通常在 30 分钟-4 小时）
}
/** 最小记录时长（分钟），少于此值不保存（避免误触） */
const MIN_RECORD_MINUTES = 0.5  // 30 秒

export const useRecordsStore = defineStore('records', () => {
  // ---- state ----
  const _p = createPersistence<RecordLog[]>(PERSIST_KEYS.records)

  /** 活跃计时器 Map: babyId → TimerState，支持双宝同时计时 */
  const _timers = ref<Record<string, TimerState>>({})
  const logs = ref<RecordLog[]>(_p.load() ?? [])
  const selectedBabyId = ref<string | null>(null)

  // 恢复持久化的计时器（App 被杀后恢复）—— 支持双计时器
  try {
    const raw = uni.getStorageSync('tp_active_timers')
    if (raw) {
      const savedList: Array<{ babyId: string; type: RecordType; startedAt: number }> = JSON.parse(raw)
      if (Array.isArray(savedList) && savedList.length) {
        const restored: Record<string, TimerState> = {}
        for (const saved of savedList) {
          if (!saved.babyId || !saved.type || !saved.startedAt) continue
          const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000)
          const handle = setInterval(() => {
            if (_timers.value[saved.babyId]) {
              _timers.value = { ..._timers.value, [saved.babyId]: { ..._timers.value[saved.babyId], elapsed: _timers.value[saved.babyId].elapsed + 1 } }
            }
          }, 1000)
          restored[saved.babyId] = {
            babyId: saved.babyId, type: saved.type, startedAt: saved.startedAt, elapsed, timerHandle: handle,
            feedingSide: (saved as any).feedingSide || undefined,
            amountMl: (saved as any).amountMl || undefined,
            feedingMode: (saved as any).feedingMode || undefined,
            sleepQuality: (saved as any).sleepQuality || undefined,
            diaperType: (saved as any).diaperType || undefined,
            diaperNote: (saved as any).diaperNote || undefined,
            temperatureValue: (saved as any).temperatureValue ?? undefined,
            medicineName: (saved as any).medicineName || undefined,
            medicineDosage: (saved as any).medicineDosage || undefined,
            medicineUnit: (saved as any).medicineUnit || undefined,
          }
          console.log('[records] Restored active timer for', saved.babyId)
        }
        _timers.value = restored
      }
    }
  } catch {}

  /** 持久化所有活跃计时器（支持双计时器同时运行，含上下文字段） */
  function _saveActiveTimers() {
    try {
      const activeTimers = Object.values(_timers.value).map(t => ({
        babyId: t.babyId,
        type: t.type,
        startedAt: t.startedAt,
        feedingSide: t.feedingSide || null,
        amountMl: t.amountMl || null,
        feedingMode: t.feedingMode || null,
        sleepQuality: t.sleepQuality || null,
        diaperType: t.diaperType || null,
        diaperNote: t.diaperNote || null,
        temperatureValue: t.temperatureValue ?? null,
        medicineName: t.medicineName || null,
        medicineDosage: t.medicineDosage || null,
        medicineUnit: t.medicineUnit || null,
      }))
      if (activeTimers.length) {
        uni.setStorageSync('tp_active_timers', JSON.stringify(activeTimers))
      } else {
        uni.removeStorageSync('tp_active_timers')
      }
    } catch {}
  }

  function _saveLogs() {
    _p.save(logs.value.slice(-200)) // 只保留最近 200 条，控制存储体积
  }

  /** 自动同步贴纸 —— 每次记录后自动检查解锁 */
  function _syncStickersAuto() {
    try {
      const stickersStore = useStickersStore()
      const t0 = new Date().setHours(0, 0, 0, 0)
      const today = logs.value.filter(l => l.createdAt >= t0)
      const aId = babiesStore.babyA?.id
      const bId = babiesStore.babyB?.id
      const n = Date.now()

      const now = new Date()
      // 生日检测：遍历所有宝宝，任一宝今天生日即触发
      const todayMonth = now.getMonth() + 1
      const todayDate = now.getDate()
      let isBirthday = false
      let birthdayAge: number | undefined
      for (const baby of babiesStore.babies) {
        if (!baby?.birthDate) continue
        const bday = new Date(baby.birthDate)
        if (bday.getMonth() + 1 === todayMonth && bday.getDate() === todayDate) {
          isBirthday = true
          const age = now.getFullYear() - bday.getFullYear()
          if (age >= 1 && age <= 6 && birthdayAge === undefined) birthdayAge = age
        }
      }

      const babyAHasRecord = aId ? today.some(l => l.babyId === aId) : false
      const babyBHasRecord = bId ? today.some(l => l.babyId === bId) : false

      // v2.0 补全上下文字段：萌芽/里程碑/测量/满月
      let bothSproutToday = false
      let bothMilestoneToday = false
      let bothMeasureToday = false
      try {
        // 惰性加载子包 store（growth/milestones），避免循环依赖
        const sproutMod = require('@/stores/sprout')
        const sproutStore = sproutMod.useSproutStore()
        bothSproutToday = sproutStore.entries.some((e: any) => e.recordedAt >= t0)

        const msMod = require('@/pages/milestones/store')
        const msStore = msMod.useMilestonesStore()
        if (aId && bId) {
          const todayMs = msStore.milestones.filter((m: any) =>
            m.status === 'achieved' && m.achievedAt >= t0
          )
          bothMilestoneToday = todayMs.some((m: any) => m.babyId === aId) &&
            todayMs.some((m: any) => m.babyId === bId)
        }

        const growthMod = require('@/pages/growth/store')
        const growthStore = growthMod.useGrowthStore()
        if (aId && bId) {
          const todayMeasure = (growthStore.measurements || []).filter((m: any) => {
            const md = new Date(m.date)
            const mt0 = new Date(md.getFullYear(), md.getMonth(), md.getDate()).getTime()
            return mt0 >= t0
          })
          bothMeasureToday = todayMeasure.some((m: any) => m.babyId === aId) &&
            todayMeasure.some((m: any) => m.babyId === bId)
        }
      } catch { /* 子包未加载则跳过 */ }

      // 满月检测（农历十五速查表，引用共享常量）
      const fmKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      const isFullMoonNight = FULL_MOON_DATES.has(fmKey) && now.getHours() >= 18

      // 惰性加载 dutyStore 获取累计值班次数
      let dutyDoneTotalCount = 0
      try {
        const dutyMod = require('@/stores/duty')
        const dutyStore = dutyMod.useDutyStore()
        dutyDoneTotalCount = dutyStore.dutyDoneTotalCount ?? 0
      } catch { /* duty store 未加载则跳过 */ }

      const ctx: StickerContext = {
        todayLogCount: today.length,
        streakDays: streakDays.value,
        totalLogCount: logs.value.length,
        twinSyncCount: (babyAHasRecord && babyBHasRecord) ? 1 : 0,
        sproutCount: sproutStore.entries.filter((e: any) => e.recordedAt >= t0).length,
        dutyDoneCount: 0,
        babyAHasRecord,
        babyBHasRecord,
        babyARecentRecord: aId
          ? today.some(l => l.babyId === aId && n - l.createdAt < 3600000)
          : false,
        babyBRecentRecord: bId
          ? today.some(l => l.babyId === bId && n - l.createdAt < 3600000)
          : false,
        // v2.0 新增上下文
        currentHour: now.getHours(),
        isWeekend: now.getDay() === 0 || now.getDay() === 6,
        isBirthday,
        birthdayAge,
        bothSproutToday,
        bothMilestoneToday,
        bothMeasureToday,
        dutyDoneTotalCount,
        isFullMoonNight,
      }

      return stickersStore.sync(ctx)
    } catch { /* 贴纸同步失败不影响记录功能 */ }
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

  /** 私有：检查是否超过最大计时时长，超时自动停止 */
  function _checkMaxDuration(babyId: string): boolean {
    const timer = _timers.value[babyId]
    if (!timer) return false
    const maxMin = MAX_TIMER_MINUTES[timer.type]
    if (!maxMin) return false
    const elapsedMin = (Date.now() - timer.startedAt) / 60000
    if (elapsedMin >= maxMin) {
      _stopOne(babyId)
      console.log(`[records] Auto-stopped ${timer.type} timer for ${babyId} after ${Math.round(elapsedMin)}min (max=${maxMin}min)`)
      return true
    }
    return false
  }

  /** 私有：停止单个宝宝的计时器并保存记录 */
  function _stopOne(babyId: string): RecordLog | null {
    const timer = _timers.value[babyId]
    if (!timer) return null

    clearInterval(timer.timerHandle!)
    const endedAt = Date.now()
    const durationMin = Math.round((endedAt - timer.startedAt) / 60000)

    // 少于最小记录时长不保存（防误触），但从 Map 中移除计时器
    if (durationMin < MIN_RECORD_MINUTES) {
      const newTimers = { ..._timers.value }
      delete newTimers[babyId]
      _timers.value = newTimers
      _saveActiveTimers()
      return null
    }

    const baby = babiesStore.getBaby(timer.babyId)
    if (!baby) {
      const newTimers = { ..._timers.value }
      delete newTimers[babyId]
      _timers.value = newTimers
      _saveActiveTimers()
      return null
    }

    // 生成可读详情
    let detail = ''
    if (timer.type === 'feeding') {
      const sideLabel = timer.feedingSide === 'left' ? '左' : timer.feedingSide === 'right' ? '右' : timer.feedingSide === 'bottle' ? '瓶喂' : ''
      const amountStr = timer.amountMl ? `${timer.amountMl}ml` : ''
      const modeLabel = timer.feedingMode === 'bottle' ? '🍼' : timer.feedingMode === 'mixed' ? '🤱+🍼' : ''
      const parts = [sideLabel, amountStr, modeLabel, durationMin > 0 ? `${durationMin}分钟` : ''].filter(Boolean)
      detail = parts.length > 0 ? parts.join(' ') : '喂养'
    } else if (timer.type === 'sleep') {
      detail = durationMin > 0 ? `睡眠 ${durationMin}分钟` : '睡眠'
    } else if (timer.type === 'diaper') {
      const diaperLabel = timer.diaperType === 'wet' ? '💧小便' : timer.diaperType === 'dirty' ? '💩大便' : timer.diaperType === 'both' ? '💧💩都有' : '换尿布'
      detail = diaperLabel
    } else if (timer.type === 'temperature') {
      detail = timer.temperatureValue ? `体温 ${timer.temperatureValue}°C` : '体温'
    } else if (timer.type === 'medicine') {
      const medParts = [timer.medicineName, timer.medicineDosage].filter(Boolean)
      detail = medParts.length > 0 ? `用药 ${medParts.join(' ')}` : '用药'
    } else if (timer.type === 'bath') {
      detail = '洗澡 🛁'
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
      recordedBy: useUserStore().profile?.role,
      diaperType: timer.diaperType,
      temperatureValue: timer.temperatureValue,
      medicineName: timer.medicineName,
      medicineDosage: timer.medicineDosage,
      feedingMode: timer.feedingMode,
      feedingSide: timer.feedingSide,
      amountMl: timer.amountMl,
    }

    logs.value = [...logs.value, log]
    _saveLogs()
    _syncStickersAuto()  // 自动检查贴纸解锁

    // 从 Map 中移除（不可变更新）
    const newTimers = { ..._timers.value }
    delete newTimers[babyId]
    _timers.value = newTimers
    // 更新持久化的计时器列表
    _saveActiveTimers()

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
        // 每 30 秒检查一次是否超过最大计时时长
        if (_timers.value[babyId]?.elapsed % 30 === 0) {
          _checkMaxDuration(babyId)
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
    // 持久化所有活跃计时器，防止 App 被杀后丢失
    _saveActiveTimers()
    selectedBabyId.value = babyId
  }

  /** 运行时更新计时器字段（喂养侧、奶量等） */
  function setTimerField(babyId: string, field: keyof TimerState, value: any) {
    const t = _timers.value[babyId]
    if (!t) return
    _timers.value = { ..._timers.value, [babyId]: { ...t, [field]: value } }
    _saveActiveTimers()
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

  /** 快速记录（无计时），支持回溯时间偏移 + 完整上下文字段。返回创建的日志，用于撤销等操作 */
  function quickLog(
    babyId: string,
    type: RecordType,
    opts?: {
      amountMl?: number
      offsetMs?: number
      feedingSide?: 'left' | 'right' | 'bottle'
      feedingMode?: 'breast' | 'bottle' | 'mixed'
      diaperType?: 'wet' | 'dirty' | 'both'
      temperatureValue?: number
      medicineName?: string
      medicineDosage?: string
      medicineUnit?: string
    }
  ): RecordLog | undefined {
    const baby = babiesStore.getBaby(babyId)
    if (!baby) return

    const now = Date.now() - (opts?.offsetMs || 0)
    let detail = ''
    if (type === 'feeding') {
      const sideLabel = opts?.feedingSide === 'left' ? '左' : opts?.feedingSide === 'right' ? '右' : opts?.feedingSide === 'bottle' ? '瓶喂' : ''
      const amountStr = opts?.amountMl ? `${opts.amountMl}ml` : ''
      const parts = [sideLabel, amountStr].filter(Boolean)
      detail = parts.length > 0 ? parts.join(' ') : '喂养'
    } else if (type === 'sleep') {
      detail = '睡眠'
    } else if (type === 'diaper') {
      detail = opts?.diaperType === 'wet' ? '💧小便' : opts?.diaperType === 'dirty' ? '💩大便' : opts?.diaperType === 'both' ? '💧💩都有' : '换尿布'
    } else if (type === 'temperature') {
      detail = opts?.temperatureValue ? `体温 ${opts.temperatureValue}°C` : '体温'
    } else if (type === 'medicine') {
      const medParts = [opts?.medicineName, opts?.medicineDosage].filter(Boolean)
      detail = medParts.length > 0 ? `用药 ${medParts.join(' ')}` : '用药'
    } else if (type === 'bath') {
      detail = '洗澡 🛁'
    }

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
      recordedBy: useUserStore().profile?.role,
      diaperType: opts?.diaperType,
      temperatureValue: opts?.temperatureValue,
      medicineName: opts?.medicineName,
      medicineDosage: opts?.medicineDosage,
      feedingMode: opts?.feedingMode,
      feedingSide: opts?.feedingSide,
      amountMl: opts?.amountMl,
    }
    logs.value = [...logs.value, log]
    _saveLogs()
    _syncStickersAuto()  // 自动检查贴纸解锁
    return log
  }

  /** 更新已有日志的指定字段（不可变替换），用于编辑/补录上下文 */
  function updateLog(id: string, patch: Partial<RecordLog>) {
    logs.value = logs.value.map(l => l.id === id ? { ...l, ...patch } : l)
    _saveLogs()
  }

  /** 删除指定日志，用于撤销等操作 */
  function removeLog(id: string) {
    logs.value = logs.value.filter(l => l.id !== id)
    _saveLogs()
  }

  /** 从服务器合并日志（保留本地唯一记录，避免外部直接赋值绕过持久化） */
  function mergeServerLogs(serverLogs: Array<{
    id: string; baby_id: string; type: RecordType; started_at: string
    duration_min: number; detail: string; created_at: string
  }>) {
    const existingIds = new Set(logs.value.map(l => l.id))
    const newLogs: RecordLog[] = []
    for (const r of serverLogs) {
      if (existingIds.has(r.id)) continue
      newLogs.push({
        id: r.id, babyId: r.baby_id, babyName: '', babyColor: '',
        type: r.type, startedAt: new Date(r.started_at).getTime(),
        endedAt: 0, durationMin: r.duration_min, detail: r.detail,
        createdAt: new Date(r.created_at).getTime(),
        recordedBy: (r as any).recorded_by,
      })
    }
    if (newLogs.length) {
      logs.value = [...logs.value, ...newLogs]
      _saveLogs()
      _syncStickersAuto()
    }
    return newLogs.length
  }

  const journalInsight = computed(() => {
    const todayLogs = logs.value.filter(l => l.createdAt >= new Date().setHours(0,0,0,0))
    const total = todayLogs.length
    if (total === 0) return '今天的手帐本还是空白，等第一笔记录 ✦'
    const feedCount = todayLogs.filter(l => l.type === 'feeding').length
    const sleepCount = todayLogs.filter(l => l.type === 'sleep').length
    const parts: string[] = []
    if (feedCount > 0) parts.push(`${feedCount}次喂奶`)
    if (sleepCount > 0) parts.push(`${sleepCount}次安睡`)
    const runningCount = Object.keys(_timers.value).length
    if (runningCount > 0) parts.push(`${runningCount}个小怪兽正在计时`)
    if (parts.length === 0) parts.push(`${total}次记录`)
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

  /** 连胜天数（使用本地日期，避免 UTC 时区偏移） */
  const streakDays = computed(() => {
    if (!logs.value.length) return 0
    const localDateStr = (ts: number) => {
      const d = new Date(ts)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const dates = [...new Set(logs.value.map(l => localDateStr(l.createdAt)))].sort().reverse()
    const today = localDateStr(Date.now())
    const yesterday = localDateStr(Date.now() - 86400000)
    // 最近记录日必须是今天或昨天，否则连续已断
    if (dates[0] !== today && dates[0] !== yesterday) return 0
    // 修复 off-by-one：最近记录日是今天或昨天，都应该从 1 开始计数
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]); prev.setDate(prev.getDate() - 1)
      if (dates[i] === localDateStr(prev.getTime())) streak++
      else break
    }
    return streak
  })

  return {
    _timers, logs, selectedBabyId,
    isRunning, runningTimer, runningTimers, recentLogsByBaby,
    isBabyRunning, getTimer,
    startTimer, stopTimer, quickLog, updateLog, removeLog, mergeServerLogs, setTimerField,
    journalInsight, twinSyncRate, streakDays,
  }
})
