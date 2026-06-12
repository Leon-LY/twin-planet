/**
 * 萌芽日记 + 今天我做了什么 — 状态管理
 * 双胞胎互动记录 + 宝爸/家人贡献日志
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ============================================================
// 萌芽日记
// ============================================================

export type InteractionType =
  | 'share' | 'fight' | 'imitate' | 'comfort'
  | 'compete' | 'cooperate' | 'first'

export interface SproutEntry {
  id: string
  twinGroupId: string
  type: InteractionType
  babyAName: string
  babyBName: string
  note: string
  recordedAt: number
}

export const INTERACTION_TYPES: Record<InteractionType, { emoji: string; label: string; desc: string }> = {
  share:     { emoji: '🤝', label: '分享', desc: '谁分享了东西给对方' },
  fight:     { emoji: '⚡', label: '争执', desc: '抢玩具、推搡、哭闹' },
  imitate:   { emoji: '🔄', label: '模仿', desc: '一个学另一个的动作' },
  comfort:   { emoji: '💚', label: '安慰', desc: '一个哭了，另一个去安抚' },
  compete:   { emoji: '🏃', label: '比赛', desc: '谁先吃完、谁跑得快' },
  cooperate: { emoji: '🤲', label: '合作', desc: '一起搭积木、一起捣乱' },
  first:     { emoji: '🌟', label: '第一次', desc: '第一次叫名字、第一次牵手' },
}

// ============================================================
// 今天我做了什么
// ============================================================

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

// ============================================================
// Store
// ============================================================

export const useInteractionsStore = defineStore('interactions', () => {
  const sproutEntries = ref<SproutEntry[]>([])
  const contributionEntries = ref<ContributionEntry[]>([])

  // ---- 萌芽日记 ----

  const recentSprouts = computed(() => sproutEntries.value.slice().reverse())

  function addSprout(data: Omit<SproutEntry, 'id' | 'recordedAt'>) {
    sproutEntries.value = [...sproutEntries.value, {
      ...data,
      id: `sprout-${Date.now()}`,
      recordedAt: Date.now(),
    }]
  }

  // ---- 今天我做了什么 ----

  const recentContributions = computed(() => contributionEntries.value.slice().reverse())
  const todayContributions = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return contributionEntries.value.filter(e =>
      new Date(e.recordedAt).toISOString().slice(0, 10) === today
    ).reverse()
  })

  function addContribution(data: Omit<ContributionEntry, 'id' | 'recordedAt'>) {
    contributionEntries.value = [...contributionEntries.value, {
      ...data,
      id: `contrib-${Date.now()}`,
      recordedAt: Date.now(),
    }]
  }

  return {
    sproutEntries, contributionEntries,
    recentSprouts, recentContributions, todayContributions,
    addSprout, addContribution,
  }
})
