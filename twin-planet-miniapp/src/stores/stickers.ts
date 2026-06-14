/**
 * 贴纸收集 Store
 * 双宝手帐的核心游戏化系统 — 每次记录 = 收集贴纸
 * 纯客户端逻辑，零后端依赖
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export interface Sticker {
  id: string
  emoji: string
  label: string
  category: 'record' | 'milestone' | 'streak' | 'sync' | 'special'
  earnedAt: number
  babyId?: string
}

export interface StickerRule {
  trigger: string
  emoji: string
  label: string
  category: Sticker['category']
  check: (ctx: StickerContext) => boolean
}

export interface StickerContext {
  todayLogCount: number
  streakDays: number
  totalLogCount: number
  twinSyncCount: number
  sproutCount: number
  dutyDoneCount: number
  babyAHasRecord: boolean
  babyBHasRecord: boolean
  babyARecentRecord: boolean   // 1小时内
  babyBRecentRecord: boolean   // 1小时内
}

export const STICKER_RULES: StickerRule[] = [
  {
    trigger: 'first_record', emoji: '早安', label: '早安守护', category: 'record',
    check: (c) => c.todayLogCount === 1,
  },
  {
    trigger: 'record_5', emoji: '守护', label: '细心守护', category: 'record',
    check: (c) => c.todayLogCount === 5,
  },
  {
    trigger: 'record_10', emoji: '超级', label: '超级守护者', category: 'record',
    check: (c) => c.todayLogCount === 10,
  },
  {
    trigger: 'streak_3', emoji: '三日', label: '三日连续', category: 'streak',
    check: (c) => c.streakDays === 3,
  },
  {
    trigger: 'streak_7', emoji: '全勤', label: '一周全勤', category: 'streak',
    check: (c) => c.streakDays === 7,
  },
  {
    trigger: 'streak_30', emoji: '月度', label: '月度之星', category: 'streak',
    check: (c) => c.streakDays === 30,
  },
  {
    trigger: 'twin_sync', emoji: '同步', label: '双星同步', category: 'sync',
    check: (c) => c.twinSyncCount > 0,
  },
  {
    trigger: 'both_active', emoji: '双宝', label: '双宝活跃', category: 'sync',
    check: (c) => c.babyARecentRecord && c.babyBRecentRecord,
  },
  {
    trigger: 'first_sprout', emoji: '萌芽', label: '萌芽记录者', category: 'milestone',
    check: (c) => c.sproutCount === 1,
  },
  {
    trigger: 'total_10', emoji: '十次', label: '十次守护', category: 'special',
    check: (c) => c.totalLogCount === 10,
  },
  {
    trigger: 'total_50', emoji: '五十', label: '五十次守护', category: 'special',
    check: (c) => c.totalLogCount === 50,
  },
  {
    trigger: 'total_100', emoji: '百次', label: '百次守护', category: 'special',
    check: (c) => c.totalLogCount === 100,
  },
  {
    trigger: 'duty_done', emoji: '超人', label: '独自守护', category: 'special',
    check: (c) => c.dutyDoneCount > 0,
  },
]

export const useStickersStore = defineStore('stickers', () => {
  const _p = createPersistence<Sticker[]>(PERSIST_KEYS.stickers)

  const stickers = ref<Sticker[]>(_p.load() ?? [])
  const lastSyncAt = ref(0)

  function _save() {
    _p.save(stickers.value.slice(-200))
  }

  const todayStickers = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    return stickers.value.filter(s => s.earnedAt >= today)
  })

  const collectionCount = computed(() => stickers.value.length)
  const todayCount = computed(() => todayStickers.value.length)

  // 所有可用贴纸的总数
  const totalStickers = STICKER_RULES.length

  /** 同步贴纸：根据当前上下文检查哪些贴纸应该被解锁 */
  function sync(ctx: StickerContext) {
    const now = Date.now()
    const earnedLabels = new Set(stickers.value.map(s => s.label))
    const newStickers: Sticker[] = []

    for (const rule of STICKER_RULES) {
      if (earnedLabels.has(rule.label)) continue
      if (rule.check(ctx)) {
        newStickers.push({
          id: `sticker-${now}-${rule.trigger}-${Math.random().toString(36).slice(2, 5)}`,
          emoji: rule.emoji,
          label: rule.label,
          category: rule.category,
          earnedAt: now,
        })
      }
    }

    if (newStickers.length > 0) {
      stickers.value = [...stickers.value, ...newStickers]
      _save()
    }
    lastSyncAt.value = now
    return newStickers
  }

  return {
    stickers,
    todayStickers,
    collectionCount,
    todayCount,
    totalStickers,
    lastSyncAt,
    sync,
  }
})
