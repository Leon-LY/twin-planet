/**
 * 一人时光 Store — 双宝一对一陪伴记录
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabiesStore } from './babies'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

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

const ACTIVE_SESSION_KEY = 'tp_active_session'

export const useOneOnOneStore = defineStore('oneOnOne', () => {
  const _p = createPersistence<OneOnOneSession[]>(PERSIST_KEYS.guardian + '_sessions')

  const sessions = ref<OneOnOneSession[]>(_p.load() ?? [])
  const activeSession = ref<OneOnOneSession | null>(null)

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

  function _restoreSession() {
    try {
      const raw = uni.getStorageSync(ACTIVE_SESSION_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved?.startedAt && !saved.endedAt) activeSession.value = saved
      }
    } catch {}
  }
  function _saveActiveSession() {
    try { uni.setStorageSync(ACTIVE_SESSION_KEY, JSON.stringify(activeSession.value)) } catch {}
  }
  function _clearActiveSession() {
    try { uni.removeStorageSync(ACTIVE_SESSION_KEY) } catch {}
  }

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
    _p.save(sessions.value)
    _clearActiveSession()
    return finished
  }

  return { sessions, activeSession, timeGapWarning, timeWithBaby, startSession, endSession }
})
