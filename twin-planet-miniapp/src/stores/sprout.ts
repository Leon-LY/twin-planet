/**
 * 萌芽日记 Store
 * 双胞胎互动记录：分享/争执/模仿/安慰/比赛/合作/第一次
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

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

export const useSproutStore = defineStore('sprout', () => {
  const _p = createPersistence<SproutEntry[]>(PERSIST_KEYS.sprout)

  const entries = ref<SproutEntry[]>(_p.load() ?? [])

  const recent = computed(() => entries.value.slice().reverse())

  function add(data: Omit<SproutEntry, 'id' | 'recordedAt'>) {
    entries.value = [...entries.value, {
      ...data,
      id: `sprout-${Date.now()}`,
      recordedAt: Date.now(),
    }]
    _p.save(entries.value)
  }

  return { entries, recent, add }
})
