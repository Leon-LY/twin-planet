/**
 * 宝宝状态管理
 * 管理宝宝 CRUD、生长发育数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFamilyStore } from './family'

export interface Baby {
  id: string
  userId: string
  twinGroupId: string
  name: string
  nickname: string
  gender: 'male' | 'female'
  birthDate: string         // ISO date
  birthOrder: 1 | 2         // 1=大宝, 2=二宝
  color: string             // 品牌色 hex
  avatar: string
  birthWeight: number       // kg
  birthHeight: number       // cm
  isActive: boolean
}

// 双胞胎默认色（与 twin-design 一致）
const DEFAULT_COLORS = {
  1: '#4299E1',  // 大宝 — Sky Blue
  2: '#F56565',  // 二宝 — Soft Pink
}

export const useBabiesStore = defineStore('babies', () => {
  // ---- state ----
  const babies = ref<Baby[]>([])
  const activeBabyId = ref<string | null>(null)

  // ---- getters ----
  const count = computed(() => babies.value.length)
  const activeBaby = computed(() => babies.value.find(b => b.id === activeBabyId.value) ?? null)
  const babyA = computed(() => babies.value.find(b => b.birthOrder === 1) ?? null)  // 大宝
  const babyB = computed(() => babies.value.find(b => b.birthOrder === 2) ?? null)  // 二宝
  const areSameGender = computed(() => {
    if (!babyA.value || !babyB.value) return false
    return babyA.value.gender === babyB.value.gender
  })
  const isTwinsComplete = computed(() => count.value >= 2)

  // ---- actions ----
  /** 添加宝宝 */
  function addBaby(data: Omit<Baby, 'id' | 'userId' | 'twinGroupId' | 'color'>) {
    const familyStore = useFamilyStore()
    const id = `baby-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const baby: Baby = {
      ...data,
      id,
      userId: 'mock-user-001',
      twinGroupId: familyStore.currentGroup?.id ?? '',
      color: DEFAULT_COLORS[data.birthOrder as 1 | 2] ?? '#4299E1',
      avatar: '',
    }

    babies.value.push(baby)
    familyStore.addBaby(id)

    // 第一个宝宝自动激活
    if (!activeBabyId.value) activeBabyId.value = id

    return baby
  }

  /** 切换活跃宝宝 */
  function setActive(id: string) {
    if (babies.value.some(b => b.id === id)) {
      activeBabyId.value = id
    }
  }

  /** 更新宝宝信息 */
  function updateBaby(id: string, data: Partial<Baby>) {
    const idx = babies.value.findIndex(b => b.id === id)
    if (idx >= 0) {
      babies.value[idx] = { ...babies.value[idx], ...data }
    }
  }

  /** 获取指定宝宝 */
  function getBaby(id: string): Baby | undefined {
    return babies.value.find(b => b.id === id)
  }

  return {
    babies, activeBabyId, count, activeBaby, babyA, babyB,
    areSameGender, isTwinsComplete,
    addBaby, setActive, updateBaby, getBaby,
  }
})
