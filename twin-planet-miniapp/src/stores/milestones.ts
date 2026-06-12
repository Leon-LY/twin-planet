/**
 * 发展里程碑 + 入园决策 — 3-6 岁核心数据层
 * 2026-06-12 六角色论证新增
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { useBabiesStore } from './babies'
import { useInteractionsStore, type InteractionType } from './interactions'

// ============================================================
// 能力观察 (发展里程碑)
// ============================================================

export type MilestoneDomain = 'cognitive' | 'physical' | 'social' | 'language' | 'creative'

export interface Milestone {
  id: string
  babyId: string
  domain: MilestoneDomain
  title: string
  note: string
  achievedAt: number
  ageNorm: [number, number]  // [最早达标月龄, 最晚达标月龄]，0=不适用
}

export const MILESTONE_DOMAINS: Record<MilestoneDomain, { emoji: string; label: string; examples: string }> = {
  cognitive: { emoji: '🧠', label: '认知', examples: '数数、分类、问为什么、认识颜色形状' },
  physical:  { emoji: '🤸', label: '体能', examples: '双脚跳、骑三轮车、用剪刀、拍球' },
  social:    { emoji: '🤝', label: '社交', examples: '轮流、分享、交朋友、理解他人情绪' },
  language:  { emoji: '💬', label: '语言', examples: '完整句子、讲故事、问复杂问题、理解指令' },
  creative:  { emoji: '🎨', label: '创造', examples: '画画、搭积木、角色扮演、编故事' },
}

// CDC 标准：各月龄典型里程碑
export const MILESTONE_NORMS: Record<MilestoneDomain, Array<{ ageMonths: number; title: string; desc: string }>> = {
  cognitive: [
    { ageMonths: 30, title: '能数到 3', desc: '理解 1-3 的对应关系' },
    { ageMonths: 36, title: '知道自己的名字', desc: '能说出自己的全名' },
    { ageMonths: 42, title: '能分类大小', desc: '理解大/小、多/少' },
    { ageMonths: 48, title: '知道 4-5 种颜色', desc: '能正确说出颜色名字' },
    { ageMonths: 54, title: '能数到 10', desc: '一一对应点数' },
    { ageMonths: 60, title: '理解时间概念', desc: '知道今天/明天/昨天' },
  ],
  physical: [
    { ageMonths: 30, title: '双脚跳', desc: '能双脚同时离地跳起' },
    { ageMonths: 36, title: '上下楼梯交替', desc: '双脚交替上下楼梯' },
    { ageMonths: 42, title: '骑三轮车', desc: '能独立骑儿童三轮车' },
    { ageMonths: 48, title: '单脚站 5 秒', desc: '单脚站立保持平衡' },
    { ageMonths: 54, title: '画圆圈', desc: '能画出闭合的圆圈' },
    { ageMonths: 60, title: '跳绳 5 次', desc: '能连续跳绳' },
  ],
  social: [
    { ageMonths: 30, title: '模仿同伴', desc: '观察并模仿其他小朋友的行为' },
    { ageMonths: 36, title: '情绪表达', desc: '能用语言表达开心/生气/难过' },
    { ageMonths: 42, title: '轮流等待', desc: '在游戏中能等待轮到自己的顺序' },
    { ageMonths: 48, title: '交朋友', desc: '有自己的好朋友，能说出朋友名字' },
    { ageMonths: 54, title: '合作游戏', desc: '能与其他小朋友合作完成一件事' },
    { ageMonths: 60, title: '理解规则', desc: '理解并遵守简单的集体规则' },
  ],
  language: [
    { ageMonths: 30, title: '说 3-4 字短句', desc: '主谓宾完整短句' },
    { ageMonths: 36, title: '用"我"指自己', desc: '正确使用人称代词' },
    { ageMonths: 42, title: '讲故事', desc: '能简单复述一件发生过的事' },
    { ageMonths: 48, title: '问为什么', desc: '开始频繁提探索性问题' },
    { ageMonths: 54, title: '理解反义词', desc: '如大/小、冷/热、快/慢' },
    { ageMonths: 60, title: '用复杂句', desc: '包含"因为...所以..."的因果表达' },
  ],
  creative: [
    { ageMonths: 30, title: '涂鸦', desc: '用画笔画线条和圆圈' },
    { ageMonths: 36, title: '角色扮演', desc: '假装煮饭/当医生/打电话' },
    { ageMonths: 42, title: '搭积木', desc: '用积木搭建简单结构' },
    { ageMonths: 48, title: '画人', desc: '画出有头/身体/四肢的简笔画' },
    { ageMonths: 54, title: '编故事', desc: '自己编简单的故事或剧情' },
    { ageMonths: 60, title: '独立创作', desc: '不照说明书，自己创造作品' },
  ],
}

// ============================================================
// 入园决策
// ============================================================

export interface SchoolDecision {
  id: string
  term: string               // 学期：2026-春
  sameClass: boolean
  couplingScore: {            // 双生耦合度 (0-100)
    emotional: number         // 情绪依赖
    social: number            // 社交重叠
    identity: number          // 身份认同
  }
  note: string
  createdAt: number
}

// 耦合度评分辅助
export function calcCouplingScores(
  sproutTypes: InteractionType[],
  babyAgeMonths: number,
): { emotional: number; social: number; identity: number } {
  // 基于萌芽日记的互动类型统计
  const total = sproutTypes.length || 1
  const comfort = sproutTypes.filter(t => t === 'comfort').length
  const imitate = sproutTypes.filter(t => t === 'imitate').length
  const compete = sproutTypes.filter(t => t === 'compete').length
  const cooperate = sproutTypes.filter(t => t === 'cooperate').length
  const share = sproutTypes.filter(t => t === 'share').length
  const first = sproutTypes.filter(t => t === 'first').length

  // 情绪依赖：依赖型互动（安慰+模仿）占比高=耦合高
  const emotional = Math.min(100, Math.round(((comfort + imitate) / total) * 100))
  // 社交重叠：合作+分享占比高=共同社交度高
  const social = Math.min(100, Math.round(((cooperate + share) / total) * 100))
  // 身份认同：竞争+第一次独立行为占比高=个体意识强=耦合低
  const identity = Math.min(100, Math.round(100 - ((compete + first) / total) * 100))

  return { emotional, social, identity }
}

// ============================================================
// Store
// ============================================================

export const useMilestonesStore = defineStore('milestones', () => {
  const _pMS = createPersistence<Milestone[]>(PERSIST_KEYS.milestones)
  const _pSC = createPersistence<SchoolDecision[]>(PERSIST_KEYS.school_decision)

  const milestones = ref<Milestone[]>(_pMS.load() ?? [])
  const schoolDecisions = ref<SchoolDecision[]>(_pSC.load() ?? [])

  // ---- 能力观察 ----

  function getMilestonesByBaby(babyId: string): Milestone[] {
    return milestones.value.filter(m => m.babyId === babyId).sort((a, b) => b.achievedAt - a.achievedAt)
  }

  /** 某个宝宝在某领域达标了哪些里程碑 */
  function getDomainProgress(babyId: string, domain: MilestoneDomain): Milestone[] {
    return milestones.value.filter(m => m.babyId === babyId && m.domain === domain)
  }

  function addMilestone(data: Omit<Milestone, 'id'>) {
    milestones.value = [...milestones.value, { ...data, id: `ms-${Date.now()}` }]
    _pMS.save(milestones.value)
  }

  // ---- 入园决策 ----

  function getLatestCoupling(): { emotional: number; social: number; identity: number } | null {
    const latest = schoolDecisions.value.slice().reverse()[0]
    return latest?.couplingScore ?? null
  }

  function addSchoolDecision(data: Omit<SchoolDecision, 'id' | 'createdAt'>) {
    schoolDecisions.value = [...schoolDecisions.value, { ...data, id: `sc-${Date.now()}`, createdAt: Date.now() }]
    _pSC.save(schoolDecisions.value)
  }

  return {
    milestones, schoolDecisions,
    getMilestonesByBaby, getDomainProgress, addMilestone,
    getLatestCoupling, addSchoolDecision,
  }
})
