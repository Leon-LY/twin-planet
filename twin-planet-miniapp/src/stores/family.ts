/**
 * 双胞胎组（家庭）状态管理
 * 管理 twin_group CRUD、成员管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TwinGroup {
  id: string
  userId: string
  name: string
  babyIds: string[]      // 关联的宝宝 ID 列表
  createdAt: string
}

export const useFamilyStore = defineStore('family', () => {
  // ---- state ----
  const currentGroup = ref<TwinGroup | null>(null)

  // ---- getters ----
  const hasGroup = computed(() => currentGroup.value !== null)
  const groupName = computed(() => currentGroup.value?.name ?? '我的家庭')
  const babyCount = computed(() => currentGroup.value?.babyIds?.length ?? 0)

  // ---- actions ----
  /** 创建双胞胎家庭 */
  function createGroup(name: string) {
    currentGroup.value = {
      id: `group-${Date.now()}`,
      userId: 'mock-user-001',
      name,
      babyIds: [],
      createdAt: new Date().toISOString(),
    }
  }

  /** 更新家庭名称 */
  function updateName(name: string) {
    if (currentGroup.value) currentGroup.value.name = name
  }

  /** 添加宝宝到家庭 */
  function addBaby(babyId: string) {
    if (currentGroup.value && !currentGroup.value.babyIds.includes(babyId)) {
      currentGroup.value.babyIds.push(babyId)
    }
  }

  return {
    currentGroup, hasGroup, groupName, babyCount,
    createGroup, updateName, addBaby,
  }
})
