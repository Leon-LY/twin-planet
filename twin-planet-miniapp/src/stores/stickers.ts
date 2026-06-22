/**
 * 贴纸收集 Store v2.0
 * 双宝记的贴纸收集系统 — 每次记录 = 收集贴纸
 * 纯客户端逻辑，零后端依赖
 *
 * 2026-06-18 v2.0 重设计：
 * - 74 张手绘水彩双狐贴纸（旧版 21 张 emoji/iconfont）
 *   · 27 张可见收藏册贴纸（晨昏6+成长5+双宝5+里程碑6+守护5）
 *   · 24 张节气限定贴纸
 *   · 15 张节日限定贴纸
 *   · 8 张隐藏彩蛋（幸运彩虹+生日1~6+满月双狐）
 * - 4 级稀有度：common / rare / epic / legendary
 * - 8 个主题收藏册（含隐藏彩蛋册）
 * - 保留 emoji/iconClass 降级兼容
 * - 旧数据自动迁移（label 映射 + 字段补全）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { SEASONAL_TERMS } from '@/config/seasonal'
import { FESTIVALS } from '@/config/festivals'

// ============================================
// 类型定义
// ============================================

export type StickerRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type StickerCollection = 'daynight' | 'growth' | 'twin' | 'milestone' | 'honor' | 'solar' | 'festival' | 'hidden'

export interface Sticker {
  id: string
  /** emoji 降级方案（插画加载失败时） */
  emoji: string
  /** iconfont 降级方案（优先级高于 emoji） */
  iconClass?: string
  /** 手绘插画资产路径（优先级最高，有则用插画） */
  illustration?: string
  label: string
  /** 稀有度 */
  rarity: StickerRarity
  /** 所属收藏册 */
  collection: StickerCollection
  /** 节气贴纸专用：对应节气名 */
  solarTerm?: string
  /** 是否为隐藏贴纸（不在图鉴显示直到获得） */
  hidden?: boolean
  /** 旧分类（内部逻辑用，不影响 UI 展示） */
  category: 'record' | 'milestone' | 'streak' | 'sync' | 'special'
  earnedAt: number
  babyId?: string
}

export interface StickerRule {
  trigger: string
  emoji: string
  iconClass?: string
  illustration?: string
  label: string
  rarity: StickerRarity
  collection: StickerCollection
  solarTerm?: string
  hidden?: boolean
  category: Sticker['category']
  /** 获取线索（未解锁时的模糊提示） */
  hint?: string
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
  // === v2.0 新增上下文 ===
  /** 当前小时（0-23），用于守夜贴纸 */
  currentHour?: number
  /** 是否周末，用于偷闲贴纸 */
  isWeekend?: boolean
  /** 双宝今日是否都有萌芽日记 */
  bothSproutToday?: boolean
  /** 双宝今日是否都有里程碑 */
  bothMilestoneToday?: boolean
  /** 双宝今日是否都有身高测量 */
  bothMeasureToday?: boolean
  /** 独自完成值班累计次数 */
  dutyDoneTotalCount?: number
  /** 今日是否双宝生日（月日匹配） */
  isBirthday?: boolean
  /** 双宝今日满几岁（仅 isBirthday 时有意义） */
  birthdayAge?: number
  /** 今日是否农历十五且夜间 */
  isFullMoonNight?: boolean
}

// ============================================
// 辅助函数
// ============================================

/** 插画路径生成器 */
const IMG = (collection: string, name: string) => `/static/stickers/${collection}/${name}.png`

/** 判断今天是否是某个节气的起始日，返回节气名或 null */
function getTodaySolarTermStart(): string | null {
  const d = new Date()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const found = SEASONAL_TERMS.find(t => t.start[0] === m && t.start[1] === day)
  return found ? found.name : null
}

/** 节气贴纸规则生成器（避免 24 条重复代码） */
function solarTermRule(termName: string, emoji: string, illustration: string): StickerRule {
  return {
    trigger: `solar_${termName}`,
    emoji,
    illustration,
    label: `${termName}守护`,
    rarity: 'legendary',
    collection: 'solar',
    solarTerm: termName,
    category: 'special',
    hint: `${termName}节气当天记录`,
    check: (c) => c.todayLogCount >= 1 && getTodaySolarTermStart() === termName,
  }
}

// ============================================
// 贴纸规则定义（54 张）
// ============================================

export const STICKER_RULES: StickerRule[] = [
  // ============================
  // 册 1 · 晨昏守护（C 日常, 6 张）
  // ============================
  {
    trigger: 'dawn_fox', emoji: '☀️', iconClass: 'icon-sticker-sunrise',
    illustration: IMG('daynight', 'dawn-fox'),
    label: '晨光小狐', rarity: 'common', collection: 'daynight',
    category: 'record', hint: '每天第一次记录',
    check: (c) => c.todayLogCount === 1,
  },
  {
    trigger: 'watch_fox', emoji: '👀', iconClass: 'icon-sticker-watchful',
    illustration: IMG('daynight', 'watch-fox'),
    label: '守望小狐', rarity: 'common', collection: 'daynight',
    category: 'record', hint: '当日第 5 次记录',
    check: (c) => c.todayLogCount === 5,
  },
  {
    trigger: 'hero_fox', emoji: '🦸', iconClass: 'icon-hero',
    illustration: IMG('daynight', 'hero-fox'),
    label: '超人小狐', rarity: 'common', collection: 'daynight',
    category: 'record', hint: '当日第 10 次记录',
    check: (c) => c.todayLogCount === 10,
  },
  {
    trigger: 'night_fox', emoji: '🌙',
    illustration: IMG('daynight', 'night-fox'),
    label: '守夜小狐', rarity: 'common', collection: 'daynight',
    category: 'record', hint: '夜晚 9 点后记录',
    check: (c) => (c.currentHour ?? 0) >= 21 && c.todayLogCount >= 1,
  },
  {
    trigger: 'duty_fox', emoji: '✅', iconClass: 'icon-strength',
    illustration: IMG('daynight', 'duty-fox'),
    label: '值日小狐', rarity: 'common', collection: 'daynight',
    category: 'special', hint: '完成值班清单',
    check: (c) => c.dutyDoneCount > 0,
  },
  {
    trigger: 'lazy_fox', emoji: '😴',
    illustration: IMG('daynight', 'lazy-fox'),
    label: '偷闲小狐', rarity: 'common', collection: 'daynight',
    category: 'record', hint: '周末记录',
    check: (c) => !!c.isWeekend && c.todayLogCount >= 1,
  },

  // ============================
  // 册 2 · 成长刻度（R 稀有, 5 张）
  // ============================
  {
    trigger: 'sprout_3', emoji: '🌱', iconClass: 'icon-sticker-three-day',
    illustration: IMG('growth', 'sprout-3'),
    label: '三日萌芽', rarity: 'rare', collection: 'growth',
    category: 'streak', hint: '连续记录 3 天',
    check: (c) => c.streakDays === 3,
  },
  {
    trigger: 'bloom_7', emoji: '🌼', iconClass: 'icon-calendar',
    illustration: IMG('growth', 'bloom-7'),
    label: '七日花开', rarity: 'rare', collection: 'growth',
    category: 'streak', hint: '连续记录 7 天',
    check: (c) => c.streakDays === 7,
  },
  {
    trigger: 'laurel_30', emoji: '🏅', iconClass: 'icon-star',
    illustration: IMG('growth', 'laurel-30'),
    label: '月桂冠冕', rarity: 'rare', collection: 'growth',
    category: 'streak', hint: '连续记录 30 天',
    check: (c) => c.streakDays === 30,
  },
  {
    trigger: 'tree_100', emoji: '🌳',
    illustration: IMG('growth', 'tree-100'),
    label: '百日长青', rarity: 'rare', collection: 'growth',
    category: 'streak', hint: '连续记录 100 天',
    check: (c) => c.streakDays === 100,
  },
  {
    trigger: 'lotus_365', emoji: '💮',
    illustration: IMG('growth', 'lotus-365'),
    label: '周年并蒂', rarity: 'rare', collection: 'growth',
    category: 'streak', hint: '连续记录 365 天',
    check: (c) => c.streakDays === 365,
  },

  // ============================
  // 册 3 · 双宝同行（R 稀有, 5 张）
  // ============================
  {
    trigger: 'twin_back', emoji: '🔗', iconClass: 'icon-link',
    illustration: IMG('twin', 'twin-back'),
    label: '并蒂双狐', rarity: 'rare', collection: 'twin',
    category: 'sync', hint: '当日双宝同步记录',
    check: (c) => c.twinSyncCount > 0,
  },
  {
    trigger: 'twin_chase', emoji: '💫', iconClass: 'icon-sticker-twin-spark',
    illustration: IMG('twin', 'twin-chase'),
    label: '追尾双狐', rarity: 'rare', collection: 'twin',
    category: 'sync', hint: '两宝 1 小时内都有记录',
    check: (c) => c.babyARecentRecord && c.babyBRecentRecord,
  },
  {
    trigger: 'twin_read', emoji: '📖', iconClass: 'icon-book',
    illustration: IMG('twin', 'twin-read'),
    label: '共读小狐', rarity: 'rare', collection: 'twin',
    category: 'sync', hint: '双宝同日萌芽日记',
    check: (c) => !!c.bothSproutToday,
  },
  {
    trigger: 'twin_hand', emoji: '🤝',
    illustration: IMG('twin', 'twin-hand'),
    label: '拉手小狐', rarity: 'rare', collection: 'twin',
    category: 'sync', hint: '双宝同日里程碑',
    check: (c) => !!c.bothMilestoneToday,
  },
  {
    trigger: 'twin_mirror', emoji: '🪞',
    illustration: IMG('twin', 'twin-mirror'),
    label: '镜像双狐', rarity: 'rare', collection: 'twin',
    category: 'sync', hint: '双宝同日身高测量',
    check: (c) => !!c.bothMeasureToday,
  },

  // ============================
  // 册 4 · 里程碑纪事（E 史诗, 6 张）
  // ============================
  {
    trigger: 'first_sprout', emoji: '🌱', iconClass: 'icon-sprout',
    illustration: IMG('milestone', 'first-sprout'),
    label: '初萌之印', rarity: 'epic', collection: 'milestone',
    category: 'milestone', hint: '第一条萌芽日记',
    check: (c) => c.sproutCount === 1,
  },
  {
    trigger: 'observer', emoji: '🔍', iconClass: 'icon-sticker-observe',
    illustration: IMG('milestone', 'observer'),
    label: '观察之眼', rarity: 'epic', collection: 'milestone',
    category: 'milestone', hint: '萌芽日记累计 10 条',
    check: (c) => (c.totalSproutCount ?? c.sproutCount) >= 10,
  },
  {
    trigger: 'chronicle', emoji: '📕', iconClass: 'icon-book',
    illustration: IMG('milestone', 'chronicle'),
    label: '记录之书', rarity: 'epic', collection: 'milestone',
    category: 'milestone', hint: '萌芽日记累计 30 条',
    check: (c) => (c.totalSproutCount ?? c.sproutCount) >= 30,
  },
  {
    trigger: 'five_peaks', emoji: '🏔️', iconClass: 'icon-sticker-milestone5',
    illustration: IMG('milestone', 'five-peaks'),
    label: '五星峰顶', rarity: 'epic', collection: 'milestone',
    category: 'milestone', hint: '里程碑累计 5 个',
    check: (c) => (c.milestoneCount ?? 0) >= 5,
  },
  {
    trigger: 'school_gate', emoji: '🏫', iconClass: 'icon-sticker-school',
    illustration: IMG('milestone', 'school-gate'),
    label: '入园门扉', rarity: 'epic', collection: 'milestone',
    category: 'special', hint: '入园评估 1 次',
    check: (c) => (c.schoolAssessmentCount ?? 0) >= 1,
  },
  {
    trigger: 'solo_guard', emoji: '🛡️',
    illustration: IMG('milestone', 'solo-guard'),
    label: '独当一面', rarity: 'epic', collection: 'milestone',
    category: 'special', hint: '独自完成值班 10 次',
    check: (c) => (c.dutyDoneTotalCount ?? 0) >= 10,
  },

  // ============================
  // 册 5 · 守护勋章（E 史诗, 5 张）
  // ============================
  {
    trigger: 'bronze_10', emoji: '🥉', iconClass: 'icon-sticker-ten',
    illustration: IMG('honor', 'bronze-10'),
    label: '十步铜印', rarity: 'epic', collection: 'honor',
    category: 'special', hint: '累计 10 次记录',
    check: (c) => c.totalLogCount >= 10,
  },
  {
    trigger: 'silver_50', emoji: '🥈', iconClass: 'icon-sticker-fifty',
    illustration: IMG('honor', 'silver-50'),
    label: '半百银印', rarity: 'epic', collection: 'honor',
    category: 'special', hint: '累计 50 次记录',
    check: (c) => c.totalLogCount >= 50,
  },
  {
    trigger: 'gold_100', emoji: '🥇', iconClass: 'icon-sticker-hundred',
    illustration: IMG('honor', 'gold-100'),
    label: '百日金印', rarity: 'epic', collection: 'honor',
    category: 'special', hint: '累计 100 次记录',
    check: (c) => c.totalLogCount >= 100,
  },
  {
    trigger: 'jade_1000', emoji: '💚',
    illustration: IMG('honor', 'jade-1000'),
    label: '千日玉印', rarity: 'epic', collection: 'honor',
    category: 'special', hint: '累计 1000 次记录',
    check: (c) => c.totalLogCount >= 1000,
  },
  {
    trigger: 'horn_call', emoji: '📨', iconClass: 'icon-sticker-inviter',
    illustration: IMG('honor', 'horn-call'),
    label: '召集令牌', rarity: 'epic', collection: 'honor',
    category: 'special', hint: '发出家庭邀请',
    check: (c) => !!c.inviteSent,
  },

  // ============================
  // 册 6 · 节气限定（L 传说, 24 张）
  // ============================
  ...SEASONAL_TERMS.map((t, i) => solarTermRule(
    t.name,
    t.emoji,
    IMG('solar', `solar-${String(i).padStart(2, '0')}`),
  )),

  // ============================
  // 册 7 · 节日限定（L 传说, 15 张）
  // ============================
  ...FESTIVALS.map((f) => ({
    trigger: `festival_${f.key}`,
    emoji: f.emoji,
    illustration: IMG('festival', `festival-${f.key}`),
    label: `${f.name}双狐`,
    rarity: 'legendary' as StickerRarity,
    collection: 'festival' as StickerCollection,
    category: 'special' as Sticker['category'],
    hint: `${f.name}期间记录`,
    check: (c: StickerContext) => {
      const d = new Date()
      const m = d.getMonth() + 1
      const day = d.getDate()
      return c.todayLogCount >= 1 && m === f.month && day >= f.dayStart && day <= f.dayEnd
    },
  })),

  // ============================
  // 隐藏彩蛋（L 传说, 3 张）
  // ============================
  {
    trigger: 'lucky_rainbow', emoji: '🌈', iconClass: 'icon-sticker-rainbow',
    illustration: IMG('hidden', 'lucky-rainbow'),
    label: '幸运彩虹', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => c.todayLogCount >= 1 && Math.random() < 0.05,
  },
  {
    trigger: 'birthday_1', emoji: '🎂',
    illustration: IMG('birthday', 'birthday-1'),
    label: '一岁初见', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isBirthday && c.birthdayAge === 1 && c.todayLogCount >= 1,
  },
  {
    trigger: 'birthday_2', emoji: '🎂',
    illustration: IMG('birthday', 'birthday-2'),
    label: '两岁蹒跚', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isBirthday && c.birthdayAge === 2 && c.todayLogCount >= 1,
  },
  {
    trigger: 'birthday_3', emoji: '🎂',
    illustration: IMG('birthday', 'birthday-3'),
    label: '三岁好奇', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isBirthday && c.birthdayAge === 3 && c.todayLogCount >= 1,
  },
  {
    trigger: 'birthday_4', emoji: '🎂',
    illustration: IMG('birthday', 'birthday-4'),
    label: '四岁探索', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isBirthday && c.birthdayAge === 4 && c.todayLogCount >= 1,
  },
  {
    trigger: 'birthday_5', emoji: '🎂',
    illustration: IMG('birthday', 'birthday-5'),
    label: '五岁入园', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isBirthday && c.birthdayAge === 5 && c.todayLogCount >= 1,
  },
  {
    trigger: 'birthday_6', emoji: '🎂',
    illustration: IMG('birthday', 'birthday-6'),
    label: '六岁启航', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isBirthday && c.birthdayAge === 6 && c.todayLogCount >= 1,
  },
  {
    trigger: 'moon_fox', emoji: '🌕',
    illustration: IMG('hidden', 'moon-fox'),
    label: '满月双狐', rarity: 'legendary', collection: 'hidden',
    hidden: true, category: 'special',
    check: (c) => !!c.isFullMoonNight && c.todayLogCount >= 1,
  },
]

// ============================================
// 收藏册与稀有度配置
// ============================================

export const STICKER_COLLECTIONS: { key: StickerCollection; title: string; subtitle: string; icon: string }[] = [
  { key: 'daynight', title: '晨昏守护', subtitle: '每一天的陪伴', icon: '🌅' },
  { key: 'growth', title: '成长刻度', subtitle: '坚持的力量', icon: '🌱' },
  { key: 'twin', title: '双宝同行', subtitle: '双胞胎的默契', icon: '🦊' },
  { key: 'milestone', title: '里程碑纪事', subtitle: '值得纪念的时刻', icon: '🏆' },
  { key: 'honor', title: '守护勋章', subtitle: '守护者的坚持', icon: '🎖️' },
  { key: 'solar', title: '节气限定', subtitle: '二十四节气 · 年度限定', icon: '🌿' },
  { key: 'festival', title: '节日限定', subtitle: '每一个值得庆祝的日子', icon: '🎉' },
  { key: 'hidden', title: '隐藏彩蛋', subtitle: '惊喜等你发现', icon: '✨' },
]

export const RARITY_CONFIG: Record<StickerRarity, { label: string; icon: string; color: string }> = {
  common: { label: '日常', icon: '🌰', color: '#9C8E7C' },
  rare: { label: '稀有', icon: '🌿', color: '#C08552' },
  epic: { label: '史诗', icon: '🌟', color: '#C8993E' },
  legendary: { label: '传说', icon: '🦊', color: '#E07B3E' },
}

// ============================================
// 旧数据迁移（v1 → v2）
// ============================================

const LABEL_MIGRATION: Record<string, string> = {
  '早安守护': '晨光小狐',
  '细心守护': '守望小狐',
  '超级守护者': '超人小狐',
  '三日连续': '三日萌芽',
  '一周全勤': '七日花开',
  '月度之星': '月桂冠冕',
  '双星同步': '并蒂双狐',
  '双宝活跃': '追尾双狐',
  '萌芽记录者': '初萌之印',
  '十次守护': '十步铜印',
  '五十次守护': '半百银印',
  '百次守护': '百日金印',
  '独自守护': '值日小狐',
  '细心观察者': '观察之眼',
  '成长记录家': '记录之书',
  '五个里程碑': '五星峰顶',
  '入园纪念': '入园门扉',
  '召集者': '召集令牌',
  // '欢迎加入' 已移除，保留原样不迁移
  // '节气守护' 旧版单一贴纸，新版拆为 24 个，旧的保留不迁移
  // '幸运彩虹' label 未变
}

/** v1 → v2 数据迁移：label 映射 + 新字段补全 */
function _migrate(raw: any): Sticker {
  const oldLabel = raw?.label as string | undefined
  const newLabel = oldLabel ? (LABEL_MIGRATION[oldLabel] || oldLabel) : ''
  const rule = STICKER_RULES.find(r => r.label === newLabel)
  return {
    ...raw,
    label: newLabel,
    rarity: raw.rarity || rule?.rarity || 'common',
    collection: raw.collection || rule?.collection || 'daynight',
    illustration: raw.illustration || rule?.illustration,
    solarTerm: raw.solarTerm || rule?.solarTerm,
    hidden: raw.hidden || rule?.hidden || false,
  }
}

// ============================================
// Store
// ============================================

export const useStickersStore = defineStore('stickers', () => {
  const _p = createPersistence<Sticker[]>(PERSIST_KEYS.stickers)

  // 加载时自动迁移旧数据
  const _loaded = _p.load() ?? []
  const stickers = ref<Sticker[]>(_loaded.map(s => _migrate(s)))
  const lastSyncAt = ref(0)
  /** 最近一次解锁的贴纸（供 UI 播放动画用） */
  const lastUnlocked = ref<Sticker[]>([])

  /** 邀请状态跟踪 */
  const _inviteSent = ref(false)
  const _inviteAccepted = ref(false)

  function _defaultCtx(): StickerContext {
    return {
      todayLogCount: 0, streakDays: 0, totalLogCount: 0,
      twinSyncCount: 0, sproutCount: 0, dutyDoneCount: 0,
      babyAHasRecord: false, babyBHasRecord: false,
      babyARecentRecord: false, babyBRecentRecord: false,
      // v2.0 新增字段默认值，调用方按需覆盖
      currentHour: 0,
      isWeekend: false,
      bothSproutToday: false,
      bothMilestoneToday: false,
      bothMeasureToday: false,
      dutyDoneTotalCount: 0,
      isBirthday: false,
      birthdayAge: undefined,
      isFullMoonNight: false,
    }
  }

  /** 持久化贴纸，最多保留最近 200 张（最旧贴纸静默丢弃，边界远大于 74 张贴纸总量） */
  function _save() {
    _p.save(stickers.value.slice(-200))
  }

  // === 可见图鉴规则（不含隐藏贴纸） ===
  const visibleRules = computed(() => STICKER_RULES.filter(r => !r.hidden))

  const todayStickers = computed(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    return stickers.value.filter(s => s.earnedAt >= today)
  })

  const collectionCount = computed(() => stickers.value.length)
  const todayCount = computed(() => todayStickers.value.length)

  /** 总贴纸数（不含隐藏，图鉴展示用） */
  const totalStickers = computed(() => visibleRules.value.length)

  /** 完成度百分比（不含隐藏） */
  const completionRate = computed(() => {
    const earnedVisible = stickers.value.filter(s => !s.hidden).length
    return Math.round((earnedVisible / visibleRules.value.length) * 100)
  })

  // === 收藏册进度 ===
  const collectionProgress = computed(() => {
    return STICKER_COLLECTIONS.map(col => {
      const rulesInCol = STICKER_RULES.filter(r => r.collection === col.key)
      // hidden 收藏册包含所有规则（含 hidden），其他册不含 hidden 规则
      const countedRules = col.key === 'hidden' ? rulesInCol : rulesInCol.filter(r => !r.hidden)
      const earnedInCol = stickers.value.filter(s => s.collection === col.key)
      return {
        collection: col.key,
        title: col.title,
        subtitle: col.subtitle,
        icon: col.icon,
        total: countedRules.length,
        earned: earnedInCol.length,
        completed: earnedInCol.length >= countedRules.length && countedRules.length > 0,
      }
    })
  })

  // === 按收藏册分组的规则（供 UI 渲染图鉴） ===
  const rulesByCollection = computed(() => {
    const map: Record<string, StickerRule[]> = {}
    for (const col of STICKER_COLLECTIONS) {
      // hidden 收藏册保留所有规则（含 hidden），UI 中未解锁的显示为神秘剪影
      if (col.key === 'hidden') {
        map[col.key] = STICKER_RULES.filter(r => r.collection === col.key)
      } else {
        map[col.key] = STICKER_RULES.filter(r => r.collection === col.key && !r.hidden)
      }
    }
    return map
  })

  // === 已解锁 label 集合（快速查询） ===
  const earnedLabels = computed(() => new Set(stickers.value.map(s => s.label)))

  /** 同步贴纸：根据当前上下文检查哪些贴纸应该被解锁 */
  function sync(ctx: StickerContext) {
    const now = Date.now()
    const earnedSet = new Set(stickers.value.map(s => s.label))
    const newStickers: Sticker[] = []

    for (const rule of STICKER_RULES) {
      if (earnedSet.has(rule.label)) continue
      if (rule.check(ctx)) {
        newStickers.push({
          id: `sticker-${now}-${rule.trigger}-${Math.random().toString(36).slice(2, 5)}`,
          emoji: rule.emoji,
          iconClass: rule.iconClass,
          illustration: rule.illustration,
          label: rule.label,
          rarity: rule.rarity,
          collection: rule.collection,
          solarTerm: rule.solarTerm,
          hidden: rule.hidden,
          category: rule.category,
          earnedAt: now,
        })
        earnedSet.add(rule.label)
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

  /** TODO: 邀请功能尚未接入，届时启用此函数；或下次重构时移除 */
  /** 标记已发出邀请 */
  function markInviteSent() {
    if (_inviteSent.value) return
    _inviteSent.value = true
    sync({ ..._defaultCtx(), inviteSent: true })
  }

  /** 标记邀请已被接受 */
  function markInviteAccepted() {
    if (_inviteAccepted.value) return
    _inviteAccepted.value = true
    sync({ ..._defaultCtx(), inviteAccepted: true })
  }

  return {
    // 状态
    stickers, lastUnlocked,
    // 计算属性
    todayStickers,
    collectionCount, todayCount, totalStickers, completionRate,
    collectionProgress, rulesByCollection,
    visibleRules, earnedLabels,
    lastSyncAt,
    // 方法
    sync,
    markInviteSent, markInviteAccepted,
  }
})
