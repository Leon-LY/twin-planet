/**
 * V5.0 生长测量 Store
 * 存储宝宝体重/身高测量记录，供生长曲线页使用
 * 本地持久化，后迁后端
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useBabiesStore } from '@/stores/babies'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export interface GrowthMeasurement {
  id: string
  babyId: string
  date: string        // 'YYYY-MM-DD'
  ageMonths: number   // 测量时月龄
  weight: number      // kg
  height: number      // cm
  headCirc?: number   // cm (optional)
  note?: string
}

export const useGrowthStore = defineStore('growth', () => {
  const _p = createPersistence<GrowthMeasurement[]>(PERSIST_KEYS.growth)

  const measurements = ref<GrowthMeasurement[]>(_p.load() ?? [])

  function _save() {
    _p.save(measurements.value.slice(-200)) // 保留最近 200 条
  }

  /** 按宝宝 ID 筛选 */
  function forBaby(babyId: string): GrowthMeasurement[] {
    return measurements.value
      .filter(m => m.babyId === babyId)
      .sort((a, b) => a.ageMonths - b.ageMonths)
  }

  /** 最近一次测量 */
  function latestForBaby(babyId: string): GrowthMeasurement | null {
    const list = forBaby(babyId)
    return list.length ? list[list.length - 1] : null
  }

  /** 添加测量记录 */
  function addMeasurement(m: Omit<GrowthMeasurement, 'id'>) {
    const entry: GrowthMeasurement = {
      ...m,
      id: `gm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }
    measurements.value = [...measurements.value, entry]
    _save()
    return entry
  }

  /** 删除一条记录 */
  function removeMeasurement(id: string) {
    measurements.value = measurements.value.filter(m => m.id !== id)
    _save()
  }

  /** 双宝最新数据摘要（供就诊速查卡使用） */
  const twinSummary = computed(() => {
    const babiesStore = useBabiesStore()
    const a = babiesStore.babyA
    const b = babiesStore.babyB
    return {
      babyA: a ? { name: a.nickname || a.name, latest: latestForBaby(a.id) } : null,
      babyB: b ? { name: b.nickname || b.name, latest: latestForBaby(b.id) } : null,
    }
  })

  /** 是否有真实数据 */
  const hasRealData = computed(() => measurements.value.length > 0)

  return {
    measurements,
    forBaby,
    latestForBaby,
    addMeasurement,
    removeMeasurement,
    twinSummary,
    hasRealData,
  }
})
