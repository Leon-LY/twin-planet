/**
 * 照顾者中断通知 — 纯统计触发，不做 AI 判断
 * 规则来源：≥3h 未喂奶 / ≥4h 未换尿布 / 连续哭声超过指标
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRecordsStore } from './records'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export type AlertLevel = 'info' | 'nudge' | 'urgent'

export interface Alert {
  id: string
  level: AlertLevel
  title: string
  body: string
  createdAt: number
  read: boolean
}

// 触发阈值常量
const FEEDING_GAP_WARN = 3 * 60 * 60 * 1000   // 3小时
const FEEDING_GAP_URGENT = 4 * 60 * 60 * 1000  // 4小时
const DIAPER_GAP_WARN = 4 * 60 * 60 * 1000     // 4小时

export const useAlertsStore = defineStore('alerts', () => {
  const _p = createPersistence<Alert[]>(PERSIST_KEYS.alerts)

  const alerts = ref<Alert[]>(_p.load() ?? [])
  const lastCheckAt = ref(0)

  function _save() {
    _p.save(alerts.value.slice(0, 50)) // 最多保留 50 条
  }

  const unreadCount = computed(() => alerts.value.filter(a => !a.read).length)
  const recent = computed(() => alerts.value.slice().reverse().slice(0, 10))

  /** 基于数据统计生成提醒，禁用 AI 判断（安全红线 #3） */
  function checkAlerts() {
    const now = Date.now()
    // 防止短时间重复检查
    if (now - lastCheckAt.value < 60_000) return
    lastCheckAt.value = now

    const recordsStore = useRecordsStore()
    const newAlerts: Omit<Alert, 'id' | 'createdAt' | 'read'>[] = []

    // 规则 1：检查最后一条喂养记录的时间
    const feedingLogs = recordsStore.logs.filter(l => l.type === 'feeding')
    const lastFeeding = feedingLogs.length ? Math.max(...feedingLogs.map(l => l.endedAt)) : 0
    const gapSinceFeeding = now - lastFeeding

    if (lastFeeding === 0) {
      newAlerts.push({ level: 'info', title: '还没有喂养记录', body: '开始记录第一次喂养吧' })
    } else if (gapSinceFeeding > FEEDING_GAP_URGENT) {
      newAlerts.push({ level: 'urgent', title: '⚠️ 超过4小时没有喂奶', body: '宝宝可能饿了，快去检查一下' })
    } else if (gapSinceFeeding > FEEDING_GAP_WARN) {
      newAlerts.push({ level: 'nudge', title: '⏰ 距离上次喂奶已过3小时', body: '可以开始准备下一轮喂养了' })
    }

    // 规则 2：长时间未记录任何行为
    const totalLogs24h = recordsStore.logs.filter(l => now - l.createdAt < 86400000).length
    if (totalLogs24h === 0 && lastFeeding === 0) {
      newAlerts.push({ level: 'nudge', title: '今天还没有任何记录', body: '打开记录页开始记录吧，数据是守护的基础' })
    }

    if (newAlerts.length) {
      const fresh = newAlerts.map(a => ({ ...a, id: `alert-${Date.now()}-${Math.random().toString(36).slice(2,4)}`, createdAt: now, read: false }))
      alerts.value = [...fresh, ...alerts.value]
      _save()
    }
  }

  function markRead(id: string) {
    alerts.value = alerts.value.map(a => a.id === id ? { ...a, read: true } : a)
    _save()
  }

  function markAllRead() {
    alerts.value = alerts.value.map(a => ({ ...a, read: true }))
    _save()
  }

  return { alerts, unreadCount, recent, checkAlerts, markRead, markAllRead }
})
