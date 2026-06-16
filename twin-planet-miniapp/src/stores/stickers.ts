/**
 * 贴纸收集 Store
 * 双宝记的贴纸收集系统 — 每次记录 = 收集贴纸
 * 纯客户端逻辑，零后端依赖
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { isSolarTermStartDay } from '@/config/seasonal'

export interface Sticker {
  id: string
  emoji: string
  /** 可选：对应的 iconfont CSS 类名 */
  iconClass?: string
  label: string
  category: 'record' | 'milestone' | 'streak' | 'sync' | 'special'
  earnedAt: number
  babyId?: string
}

export interface StickerRule {
  trigger: string
  emoji: string
  /** 可选：对应的 iconfont CSS 类名，用于渲染时替代 emoji */
  iconClass?: string
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
  babyARecentRecord: boolean
  babyBRecentRecord: boolean
  totalSproutCount?: number
  milestoneCount?: number
  schoolAssessmentCount?: number
  inviteSent?: boolean
  inviteAccepted?: boolean
}

export const STICKER_RULES: StickerRule[] = [
  {
    trigger: 'first_record', emoji: '☀️', label: '早安守护', category: 'record',
    check: (c) => c.todayLogCount === 1,
  },
  {
    trigger: 'record_5', emoji: '👀', label: '细心守护', category: 'record',
    check: (c) => c.todayLogCount === 5,
  },
  {
    trigger: 'record_10', emoji: '🦸', iconClass: 'icon-hero', label: '超级守护者', category: 'record',
    check: (c) => c.todayLogCount === 10,
  },
  {
    trigger: 'streak_3', emoji: '3️⃣', label: '三日连续', category: 'streak',
    check: (c) => c.streakDays === 3,
  },
  {
    trigger: 'streak_7', emoji: '📅', iconClass: 'icon-calendar', label: '一周全勤', category: 'streak',
    check: (c) => c.streakDays === 7,
  },
  {
    trigger: 'streak_30', emoji: '⭐', iconClass: 'icon-star', label: '月度之星', category: 'streak',
    check: (c) => c.streakDays === 30,
  },
  {
    trigger: 'twin_sync', emoji: '🔗', iconClass: 'icon-link', label: '双星同步', category: 'sync',
    check: (c) => c.twinSyncCount > 0,
  },
  {
    trigger: 'both_active', emoji: '💫', label: '双宝活跃', category: 'sync',
    check: (c) => c.babyARecentRecord && c.babyBRecentRecord,
  },
  {
    trigger: 'first_sprout', emoji: '🌱', iconClass: 'icon-sprout', label: '萌芽记录者', category: 'milestone',
    check: (c) => c.sproutCount === 1,
  },
  {
    trigger: 'total_10', emoji: '🔟', label: '十次守护', category: 'special',
    check: (c) => c.totalLogCount === 10,
  },
  {
    trigger: 'total_50', emoji: '🎯', label: '五十次守护', category: 'special',
    check: (c) => c.totalLogCount === 50,
  },
  {
    trigger: 'total_100', emoji: '💯', label: '百次守护', category: 'special',
    check: (c) => c.totalLogCount === 100,
  },
  {
    trigger: 'duty_done', emoji: '💪', iconClass: 'icon-strength', label: '独自守护', category: 'special',
    check: (c) => c.dutyDoneCount > 0,
  },
  // === 3-6 岁专属贴纸 ===
  {
    trigger: 'sprout_10', emoji: '🔍', label: '细心观察者', category: 'milestone',
    check: (c) => (c.totalSproutCount ?? c.sproutCount) >= 10,
  },
  {
    trigger: 'sprout_30', emoji: '📖', iconClass: 'icon-book', label: '成长记录家', category: 'milestone',
    check: (c) => (c.totalSproutCount ?? c.sproutCount) >= 30,
  },
  {
    trigger: 'milestone_5', emoji: '🎪', label: '五个里程碑', category: 'milestone',
    check: (c) => (c.milestoneCount ?? 0) >= 5,
  },
  {
    trigger: 'first_school', emoji: '🏫', label: '入园纪念', category: 'special',
    check: (c) => (c.schoolAssessmentCount ?? 0) >= 1,
  },
  // === 邀请贴纸（P2-4） ===
  {
    trigger: 'invite_sent', emoji: '📨', label: '召集者', category: 'special',
    check: (c) => !!c.inviteSent,
  },
  {
    trigger: 'invite_accepted', emoji: '🎁', label: '欢迎加入', category: 'special',
    check: (c) => !!c.inviteAccepted,
  },
  // === 节气贴纸（P2-6） ===
  {
    trigger: 'solar_term', emoji: '🗓️', iconClass: 'icon-calendar', label: '节气守护', category: 'special',
    check: (c) => c.todayLogCount >= 1 && isSolarTermStartDay(),
  },
  // === 隐藏惊喜贴纸（5% 概率触发） ===
  {
    trigger: 'lucky_rainbow', emoji: '🌈', label: '幸运彩虹', category: 'special',
    check: () => Math.random() < 0.05,
  },
]

export const useStickersStore = defineStore('stickers', () => {
  const _p = createPersistence<Sticker[]>(PERSIST_KEYS.stickers)

  const stickers = ref<Sticker[]>(_p.load() ?? [])
  const lastSyncAt = ref(0)
  /** 最近一次解锁的贴纸（供 UI 播放动画用） */
  const lastUnlocked = ref<Sticker[]>([])

  /** 邀请状态跟踪（P2-4：双边贴纸奖励） */
  const _inviteSent = ref(false)
  const _inviteAccepted = ref(false)

  /** 构建默认上下文（用于邀请等独立触发场景） */
  function _defaultCtx(): StickerContext {
    return {
      todayLogCount: 0, streakDays: 0, totalLogCount: 0,
      twinSyncCount: 0, sproutCount: 0, dutyDoneCount: 0,
      babyAHasRecord: false, babyBHasRecord: false,
      babyARecentRecord: false, babyBRecentRecord: false,
    }
  }

  function _save() {
    _p.save(stickers.value.slice(-200))
  }

  const todayStickers = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    return stickers.value.filter(s => s.earnedAt >= today)
  })

  const collectionCount = computed(() => stickers.value.length)
  const todayCount = computed(() => todayStickers.value.length)

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
          iconClass: rule.iconClass,
          label: rule.label,
          category: rule.category,
          earnedAt: now,
        })
        earnedLabels.add(rule.label)
      }
    }

    if (newStickers.length > 0) {
      stickers.value = [...stickers.value, ...newStickers]
      lastUnlocked.value = newStickers
      _save()
    }
    lastSyncAt.value = now
    return newStickers
  }

  /** 距离集齐全套贴纸还差多少（百分比） */
  const completionRate = computed(() =>
    Math.round((stickers.value.length / STICKER_RULES.length) * 100)
  )

  /** 标记已发出邀请（P2-4：召唤者贴纸） */
  function markInviteSent() {
    if (_inviteSent.value) return
    _inviteSent.value = true
    sync({ ..._defaultCtx(), inviteSent: true })
  }

  /** 标记邀请已被接受（P2-4：欢迎加入贴纸） */
  function markInviteAccepted() {
    if (_inviteAccepted.value) return
    _inviteAccepted.value = true
    sync({ ..._defaultCtx(), inviteAccepted: true })
  }

  return {
    stickers, lastUnlocked,
    todayStickers,
    collectionCount, todayCount, totalStickers, completionRate,
    lastSyncAt,
    sync,
    markInviteSent, markInviteAccepted,
  }
})
