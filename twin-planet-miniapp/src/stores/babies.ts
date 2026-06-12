/**
 * 宝宝状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

// 颜色按出生顺序分配（不按性别）：大宝=蓝，二宝=粉，适用于任何性别组合
const BABY_COLORS = { 1: '#4299E1', 2: '#F56565' } as const

export interface Baby {
  id: string
  userId: string
  twinGroupId: string
  name: string
  nickname: string
  gender: 'male' | 'female'
  birthDate: string
  birthOrder: 1 | 2
  color: string
  avatar: string
  birthWeight: number
  birthHeight: number
  isActive: boolean
}

export const useBabiesStore = defineStore('babies', () => {
  const _p = createPersistence<Baby[]>(PERSIST_KEYS.babies)

  const babies = ref<Baby[]>(_p.load() ?? [])
  const activeBabyId = ref<string | null>(null)

  const count = computed(() => babies.value.length)
  const activeBaby = computed(() => babies.value.find(b => b.id === activeBabyId.value) ?? null)
  const babyA = computed(() => babies.value.find(b => b.birthOrder === 1) ?? null)
  const babyB = computed(() => babies.value.find(b => b.birthOrder === 2) ?? null)
  const areSameGender = computed(() => babyA.value?.gender === babyB.value?.gender)
  const isTwinsComplete = computed(() => count.value >= 2)

  function _save() {
    _p.save(babies.value)
  }

  function addBaby(data: Omit<Baby, 'id' | 'userId' | 'twinGroupId' | 'color'>) {
    const id = `baby-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const baby: Baby = {
      ...data,
      id,
      userId: 'mock-user-001',
      twinGroupId: '',
      color: BABY_COLORS[data.birthOrder],
      avatar: '',
    }
    babies.value = [...babies.value, baby]
    if (!activeBabyId.value) activeBabyId.value = id
    _save()
    return baby
  }

  function setActive(id: string) {
    if (babies.value.some(b => b.id === id)) activeBabyId.value = id
  }

  function updateBaby(id: string, data: Partial<Baby>) {
    babies.value = babies.value.map(b => b.id === id ? { ...b, ...data } : b)
    _save()
  }

  function getBaby(id: string): Baby | undefined {
    return babies.value.find(b => b.id === id)
  }

  return {
    babies, activeBabyId, count, activeBaby, babyA, babyB,
    areSameGender, isTwinsComplete,
    addBaby, setActive, updateBaby, getBaby,
  }
})
