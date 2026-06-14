/**
 * 守护系统 — 电量表 + 一人时光守护者
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRecordsStore } from './records'
import { useBabiesStore } from './babies'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

// ---- 电量表 ----
export interface EnergyState {
  level: number       // 1-10
  reason: string
  updatedAt: number
}

// ---- 一人时光 ----
export interface OneOnOneSession {
  id: string
  babyId: string
  babyName: string
  babyColor: string
  startedAt: number
  endedAt: number | null
  durationMin: number | null
  note: string
}

export const useGuardianStore = defineStore('guardian', () => {
  const _pEnergy = createPersistence<{ mom: EnergyState; dad: EnergyState }>(PERSIST_KEYS.guardian + '_energy')
  const _pSessions = createPersistence<OneOnOneSession[]>(PERSIST_KEYS.guardian + '_sessions')
  const _savedEnergy = _pEnergy.load()

  // ---- 电量表 ----
  const momEnergy = ref<EnergyState>(_savedEnergy?.mom ?? { level: 5, reason: '还没开始记录', updatedAt: Date.now() })
  const dadEnergy = ref<EnergyState>(_savedEnergy?.dad ?? { level: 5, reason: '还没开始记录', updatedAt: Date.now() })

  function setEnergy(who: 'mom' | 'dad', level: number, reason: string) {
    const clamped = Math.max(1, Math.min(10, Math.round(level)))
    const target = who === 'mom' ? momEnergy : dadEnergy
    target.value = { level: clamped, reason, updatedAt: Date.now() }
    _pEnergy.save({ mom: momEnergy.value, dad: dadEnergy.value })
  }

  function autoCalcEnergy(who: 'mom' | 'dad') {
    const rs = useRecordsStore()
    const today = new Date().toISOString().slice(0, 10)
    const todayLogs = rs.logs.filter(l => new Date(l.createdAt).toISOString().slice(0, 10) === today)
    const cnt = todayLogs.length

    let level = 5, reason = ''
    if (cnt === 0) { level = 5; reason = '今天还没有记录' }
    else if (cnt < 3) { level = 4; reason = '只记了 ' + cnt + ' 次，看起来比较轻松' }
    else if (cnt < 8) { level = 3; reason = '记了 ' + cnt + ' 次，你辛苦了' }
    else if (cnt < 15) { level = 2; reason = '记了 ' + cnt + ' 次，电量告急' }
    else { level = 1; reason = '记了 ' + cnt + ' 次！快去休息' }
    setEnergy(who, level, reason)
  }

  // ---- 一人时光 ----
  const sessions = ref<OneOnOneSession[]>(_pSessions.load() ?? [])
  const activeSession = ref<OneOnOneSession | null>(null)

  // babyATimeToday 已移除 — 原实现存在重复比较 bug (s.endedAt > today 写了两次) 且未按 babyId 过滤
  // 请使用 timeWithBaby(babyId) 替代

  function timeWithBaby(babyId: string): number {
    const today = Date.now() - 86400000
    return sessions.value
      .filter(s => s.babyId === babyId && s.endedAt && s.endedAt > today)
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0)
  }

  const timeGapWarning = computed(() => {
    const bs = useBabiesStore()
    if (!bs.isTwinsComplete) return null
    const a = timeWithBaby(bs.babyA?.id ?? '')
    const b = timeWithBaby(bs.babyB?.id ?? '')
    if (a === 0 && b === 0) return null
    const gap = Math.abs(a - b)
    if (gap > 60) return { babyA: a, babyB: b, gap, msg: '两个宝宝的陪伴时间差距超过1小时' }
    if (a === 0 && b > 30) return { babyA: a, babyB: b, gap, msg: '今天还没陪过大宝' }
    if (b === 0 && a > 30) return { babyA: a, babyB: b, gap, msg: '今天还没陪过二宝' }
    return null
  })

  const ACTIVE_SESSION_KEY = 'tp_active_session'

  /** 恢复未完成的一对一时光（app 杀掉后重启） */
  function _restoreSession() {
    try {
      const raw = uni.getStorageSync(ACTIVE_SESSION_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved && saved.startedAt && !saved.endedAt) {
          activeSession.value = saved
        }
      }
    } catch {}
  }
  function _saveActiveSession() {
    try { uni.setStorageSync(ACTIVE_SESSION_KEY, JSON.stringify(activeSession.value)) } catch {}
  }
  function _clearActiveSession() {
    try { uni.removeStorageSync(ACTIVE_SESSION_KEY) } catch {}
  }

  // 初始化时恢复 session
  _restoreSession()

  function startSession(babyId: string, babyName: string, babyColor: string) {
    if (activeSession.value) endSession()
    activeSession.value = { id: `os-${Date.now()}`, babyId, babyName, babyColor, startedAt: Date.now(), endedAt: null, durationMin: null, note: '' }
    _saveActiveSession()
  }

  function endSession(): OneOnOneSession | null {
    if (!activeSession.value) return null
    const ended = Date.now()
    const dur = Math.round((ended - activeSession.value.startedAt) / 60000)
    if (dur < 1) { activeSession.value = null; _clearActiveSession(); return null }
    const finished: OneOnOneSession = { ...activeSession.value, endedAt: ended, durationMin: dur }
    sessions.value = [...sessions.value, finished]
    activeSession.value = null
    _pSessions.save(sessions.value)
    _clearActiveSession()
    return finished
  }

  return {
    momEnergy, dadEnergy,
    setEnergy, autoCalcEnergy,
    sessions, activeSession,
    timeGapWarning,
    timeWithBaby,
    startSession, endSession,
  }
})
