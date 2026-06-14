/**
 * 萌芽日记 + 今天我做了什么 — 向后兼容导出
 * 已拆分为 sprout.ts + contribution.ts（单一职责）
 * 此文件保持旧 API 不变，内部委托给新 Store
 */
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useSproutStore, INTERACTION_TYPES, type InteractionType, type SproutEntry } from './sprout'
import { useContributionStore, CONTRIBUTION_TYPES, type ContributionCategory, type ContributionEntry } from './contribution'

// 重新导出类型和常量，保持旧导入路径可用
export { INTERACTION_TYPES, type InteractionType, type SproutEntry }
export { CONTRIBUTION_TYPES, type ContributionCategory, type ContributionEntry }

/**
 * 向后兼容的合并 Store
 * 内部委托给 sproutStore + contributionStore
 */
export const useInteractionsStore = defineStore('interactions', () => {
  const sprout = useSproutStore()
  const contrib = useContributionStore()

  return {
    sproutEntries: sprout.entries,
    contributionEntries: contrib.entries,
    recentSprouts: sprout.recent,
    recentContributions: contrib.recent,
    todayContributions: contrib.today,
    addSprout: sprout.add,
    addContribution: contrib.add,
  }
})
