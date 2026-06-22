/**
 * useStickerSync — 统一的贴纸同步逻辑
 * 消除 index/record/duty/sprout 4 处重复代码
 */
import { useRecordsStore } from '@/stores/records'
import { useBabiesStore } from '@/stores/babies'
import { useSproutStore } from '@/stores/sprout'
import { useDutyStore } from '@/stores/duty'
import { useStickersStore, type StickerContext } from '@/stores/stickers'
import { FULL_MOON_DATES } from '@/constants/dates'

export interface StickerSyncOverrides {
  sproutCount?: number
  dutyDoneCount?: number
  /** 累计完成值班次数（用于独当一面贴纸） */
  dutyDoneTotalCount?: number
  /** 双宝今日是否都有萌芽日记 */
  bothSproutToday?: boolean
  /** 双宝今日是否都有里程碑 */
  bothMilestoneToday?: boolean
  /** 双宝今日是否都有身高测量 */
  bothMeasureToday?: boolean
}


function isFullMoonNight(): boolean {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const key = `${y}-${m}-${d}`
  return FULL_MOON_DATES.has(key) && now.getHours() >= 18
}

// 惰性引用（避免循环依赖）
let _growthStore: any = null
function _getGrowthStore() {
  if (!_growthStore) {
    try {
      const mod = require('@/pages/growth/store')
      _growthStore = mod.useGrowthStore()
    } catch { /* growth 子包未加载 */ }
  }
  return _growthStore
}

let _milestonesStore: any = null
function _getMilestonesStore() {
  if (!_milestonesStore) {
    try {
      const mod = require('@/pages/milestones/store')
      _milestonesStore = mod.useMilestonesStore()
    } catch { /* milestones 子包未加载 */ }
  }
  return _milestonesStore
}

export function useStickerSync() {
  const recordsStore = useRecordsStore()
  const babiesStore = useBabiesStore()
  const sproutStore = useSproutStore()
  const dutyStore = useDutyStore()
  const stickersStore = useStickersStore()

  /** 同步贴纸：根据当前上下文检查解锁 */
  function syncStickers(overrides?: StickerSyncOverrides) {
    const t0 = new Date().setHours(0, 0, 0, 0)
    const today = recordsStore.logs.filter(l => l.createdAt >= t0)
    const aId = babiesStore.babyA?.id
    const bId = babiesStore.babyB?.id
    const n = Date.now()
    const now = new Date()

    // 生日检测：双宝中任一宝今天生日即触发（月日匹配），遍历所有宝宝
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

    // 双宝今日萌芽日记：萌芽日记以双宝对为单位，今日有即双方都有
    const bothSproutToday = overrides?.bothSproutToday ??
      sproutStore.entries.some(e => e.recordedAt >= t0)

    // 双宝今日里程碑：检查 milestones store
    let bothMilestoneToday = overrides?.bothMilestoneToday ?? false
    if (!overrides?.bothMilestoneToday) {
      const msStore = _getMilestonesStore()
      if (msStore && aId && bId) {
        const todayMs = msStore.milestones.filter((m: any) =>
          m.status === 'achieved' && m.achievedAt >= t0
        )
        bothMilestoneToday = todayMs.some((m: any) => m.babyId === aId) &&
          todayMs.some((m: any) => m.babyId === bId)
      }
    }

    // 双宝今日身高测量：检查 growth store
    let bothMeasureToday = overrides?.bothMeasureToday ?? false
    if (!overrides?.bothMeasureToday) {
      const gStore = _getGrowthStore()
      if (gStore && aId && bId) {
        const todayMeasure = (gStore.measurements || []).filter((m: any) => {
          const md = new Date(m.date)
          const mt0 = new Date(md.getFullYear(), md.getMonth(), md.getDate()).getTime()
          return mt0 >= t0
        })
        bothMeasureToday = todayMeasure.some((m: any) => m.babyId === aId) &&
          todayMeasure.some((m: any) => m.babyId === bId)
      }
    }

    // 累计值班完成次数：优先使用外部传入值，否则从 dutyStore 推算
    const dutyDoneTotalCount = overrides?.dutyDoneTotalCount ?? (dutyStore.dutyDoneTotalCount ?? 0)

    const ctx: StickerContext = {
      todayLogCount: today.length,
      streakDays: recordsStore.streakDays,
      totalLogCount: recordsStore.logs.length,
      twinSyncCount: (babyAHasRecord && babyBHasRecord) ? 1 : 0,
      sproutCount: overrides?.sproutCount ?? sproutStore.entries.length,
      dutyDoneCount: overrides?.dutyDoneCount ?? 0,
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
      isFullMoonNight: isFullMoonNight(),
    }

    return stickersStore.sync(ctx)
  }

  return { syncStickers }
}
