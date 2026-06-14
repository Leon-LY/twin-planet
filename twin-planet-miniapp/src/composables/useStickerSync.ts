/**
 * useStickerSync — 统一的贴纸同步逻辑
 * 消除 index/record/duty/sprout 4 处重复代码
 */
import { useRecordsStore } from '@/stores/records'
import { useBabiesStore } from '@/stores/babies'
import { useStickersStore, type StickerContext } from '@/stores/stickers'

export interface StickerSyncOverrides {
  sproutCount?: number
  dutyDoneCount?: number
}

export function useStickerSync() {
  const recordsStore = useRecordsStore()
  const babiesStore = useBabiesStore()
  const stickersStore = useStickersStore()

  /** 同步贴纸：根据当前上下文检查解锁 */
  function syncStickers(overrides?: StickerSyncOverrides) {
    const t0 = new Date().setHours(0, 0, 0, 0)
    const today = recordsStore.logs.filter(l => l.createdAt >= t0)
    const aId = babiesStore.babyA?.id
    const bId = babiesStore.babyB?.id
    const n = Date.now()

    const ctx: StickerContext = {
      todayLogCount: today.length,
      streakDays: recordsStore.streakDays,
      totalLogCount: recordsStore.logs.length,
      twinSyncCount: today.filter(l =>
        l.type === 'feeding' || l.type === 'sleep'
      ).length >= 2 ? 1 : 0,
      sproutCount: overrides?.sproutCount ?? 0,
      dutyDoneCount: overrides?.dutyDoneCount ?? 0,
      babyAHasRecord: aId ? today.some(l => l.babyId === aId) : false,
      babyBHasRecord: bId ? today.some(l => l.babyId === bId) : false,
      babyARecentRecord: aId
        ? today.some(l => l.babyId === aId && n - l.createdAt < 3600000)
        : false,
      babyBRecentRecord: bId
        ? today.some(l => l.babyId === bId && n - l.createdAt < 3600000)
        : false,
    }

    return stickersStore.sync(ctx)
  }

  return { syncStickers }
}
