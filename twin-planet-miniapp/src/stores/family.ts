/**
 * 双胞胎组（家庭）状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TwinGroup {
  id: string
  userId: string
  name: string
  babyIds: string[]
  createdAt: string
}

export const useFamilyStore = defineStore('family', () => {
  const currentGroup = ref<TwinGroup | null>(null)

  const hasGroup = computed(() => currentGroup.value !== null)
  const groupName = computed(() => currentGroup.value?.name ?? '我的家庭')
  const babyCount = computed(() => currentGroup.value?.babyIds?.length ?? 0)

  function createGroup(name: string) {
    currentGroup.value = {
      id: `group-${Date.now()}`,
      userId: 'mock-user-001',
      name,
      babyIds: [],
      createdAt: new Date().toISOString(),
    }
  }

  function updateName(name: string) {
    if (currentGroup.value) {
      currentGroup.value = { ...currentGroup.value, name }
    }
  }

  function addBaby(babyId: string) {
    if (!currentGroup.value) return
    if (!currentGroup.value.babyIds.includes(babyId)) {
      currentGroup.value = {
        ...currentGroup.value,
        babyIds: [...currentGroup.value.babyIds, babyId],
      }
    }
  }

  return {
    currentGroup, hasGroup, groupName, babyCount,
    createGroup, updateName, addBaby,
  }
})
