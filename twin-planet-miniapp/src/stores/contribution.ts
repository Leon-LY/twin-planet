/**
 * 今天我做了什么 — 贡献日志 Store
 * 记录每位家人的付出：夜奶/换尿布/洗澡/陪玩/做饭/打扫/跑腿/其他
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { useUserStore } from '@/stores/user'

export type ContributionCategory =
  | 'night_feed' | 'diaper' | 'bath' | 'play'
  | 'cook' | 'clean' | 'errand' | 'other'

export interface ContributionEntry {
  id: string
  userId: string
  userName: string
  category: ContributionCategory
  note: string
  recordedAt: number
}

export const CONTRIBUTION_TYPES: Record<ContributionCategory, { emoji: string; label: string }> = {
  night_feed: { emoji: '🌙', label: '夜奶' },
  diaper:     { emoji: '🧷', label: '换尿布' },
  bath:       { emoji: '🛁', label: '洗澡' },
  play:       { emoji: '🎮', label: '陪玩' },
  cook:       { emoji: '🍳', label: '做饭' },
  clean:      { emoji: '🧹', label: '打扫' },
  errand:     { emoji: '🛒', label: '跑腿' },
  other:      { emoji: '✨', label: '其他' },
}

export const useContributionStore = defineStore('contribution', () => {
  const _p = createPersistence<ContributionEntry[]>(PERSIST_KEYS.contribution)

  const entries = ref<ContributionEntry[]>(_p.load() ?? [])

  const recent = computed(() => entries.value.slice().reverse())
  const today = computed(() => {
    const t = new Date().toISOString().slice(0, 10)
    return entries.value.filter(e =>
      new Date(e.recordedAt).toISOString().slice(0, 10) === t
    ).reverse()
  })

  function add(data: Omit<ContributionEntry, 'id' | 'recordedAt' | 'userName'> & { userName?: string }) {
    let userName = data.userName
    if (!userName) {
      try {
        const userStore = useUserStore()
        userName = userStore.profile?.nickname || userStore.roleLabel
      } catch {
        userName = '家人'
      }
    }
    entries.value = [...entries.value, {
      ...data,
      id: `contrib-${Date.now()}`,
      userName,
      recordedAt: Date.now(),
    }]
    _p.save(entries.value)
  }

  return { entries, recent, today, add }
})
