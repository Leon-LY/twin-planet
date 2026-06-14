/**
 * 双胞胎组（家庭）状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export interface TwinGroup {
  id: string
  userId: string
  name: string
  babyIds: string[]
  createdAt: string
}

/** 获取当前用户 ID */
function getUserId(): string {
  try {
    const raw = uni.getStorageSync('tp_user')
    if (raw) {
      const profile = JSON.parse(raw)
      if (profile.id) return profile.id
    }
  } catch {}
  return 'local-' + Date.now()
}

export const useFamilyStore = defineStore('family', () => {
  const _p = createPersistence<TwinGroup>(PERSIST_KEYS.family)

  const currentGroup = ref<TwinGroup | null>(_p.load())

  const hasGroup = computed(() => currentGroup.value !== null)
  const groupName = computed(() => currentGroup.value?.name ?? '我的家庭')
  const babyCount = computed(() => currentGroup.value?.babyIds?.length ?? 0)

  function _save() {
    if (currentGroup.value) _p.save(currentGroup.value)
  }

  function createGroup(name: string) {
    currentGroup.value = {
      id: `group-${Date.now()}`,
      userId: getUserId(),
      name,
      babyIds: [],
      createdAt: new Date().toISOString(),
    }
    _save()
  }

  function updateName(name: string) {
    if (currentGroup.value) {
      currentGroup.value = { ...currentGroup.value, name }
      _save()
    }
  }

  function addBaby(babyId: string) {
    if (!currentGroup.value) return
    if (!currentGroup.value.babyIds.includes(babyId)) {
      currentGroup.value = {
        ...currentGroup.value,
        babyIds: [...currentGroup.value.babyIds, babyId],
      }
      _save()
    }
  }

  return {
    currentGroup, hasGroup, groupName, babyCount,
    createGroup, updateName, addBaby,
  }
})
