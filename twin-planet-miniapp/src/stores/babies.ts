/**
 * 宝宝状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

// V4 暖纸手帐：大宝=姜黄，二宝=豆沙。按出生顺序，不按性别。
import { TWIN_COLORS } from '@/constants/design'
const BABY_COLORS = { 1: TWIN_COLORS.A, 2: TWIN_COLORS.B } as const
const ACTIVE_BABY_KEY = 'tp_active_baby'

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
  const activeBabyId = ref<string | null>(loadActiveBaby())

  function loadActiveBaby(): string | null {
    try { return uni.getStorageSync(ACTIVE_BABY_KEY) || null } catch { return null }
  }
  function saveActiveBaby() {
    try { uni.setStorageSync(ACTIVE_BABY_KEY, activeBabyId.value) } catch {}
  }

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
    if (!activeBabyId.value) { activeBabyId.value = id; saveActiveBaby() }
    _save()
    return baby
  }

  function setActive(id: string) {
    if (babies.value.some(b => b.id === id)) {
      activeBabyId.value = id
      saveActiveBaby()
    }
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
