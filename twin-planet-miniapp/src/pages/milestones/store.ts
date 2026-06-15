/**
 * 发展里程碑 + 入园决策 — 0-6 岁核心数据层
 * 2026-06-12 六角色论证新增
 * 2026-06-15 补充 0-30 月龄 CDC 里程碑 + 三态支持
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'
import { useBabiesStore } from '@/stores/babies'
import { useInteractionsStore, type InteractionType } from '@/stores/interactions'

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
  status: 'not_yet' | 'emerging' | 'achieved'  // 三态：未开始 → 发展中 → 已达标
}

export const MILESTONE_DOMAINS: Record<MilestoneDomain, { emoji: string; label: string; examples: string }> = {
  cognitive: { emoji: '🧠', label: '认知', examples: '✅已达标 · 🌱发展中 · ⬜未开始 — 点击三态切换' },
  physical:  { emoji: '🤸', label: '体能', examples: '✅已达标 · 🌱发展中 · ⬜未开始 — 点击三态切换' },
  social:    { emoji: '🤝', label: '社交', examples: '✅已达标 · 🌱发展中 · ⬜未开始 — 点击三态切换' },
  language:  { emoji: '💬', label: '语言', examples: '✅已达标 · 🌱发展中 · ⬜未开始 — 点击三态切换' },
  creative:  { emoji: '🎨', label: '创造', examples: '✅已达标 · 🌱发展中 · ⬜未开始 — 点击三态切换' },
}

// CDC "Learn the Signs. Act Early." 标准：0-60 月龄各领域里程碑
export const MILESTONE_NORMS: Record<MilestoneDomain, Array<{ ageMonths: number; title: string; desc: string }>> = {
  cognitive: [
    { ageMonths: 2, title: '短暂注视人脸或玩具', desc: '能短暂注视眼前的人脸或玩具几秒钟' },
    { ageMonths: 4, title: '眼睛追随移动物体', desc: '用眼睛跟随缓慢移动的物体或人脸' },
    { ageMonths: 6, title: '将东西放到嘴里探索', desc: '用手抓握物品并放入口中探索' },
    { ageMonths: 9, title: '寻找掉落的物品', desc: '当玩具掉落时，会低头寻找' },
    { ageMonths: 12, title: '模仿动作', desc: '模仿拍手、挥手等简单动作' },
    { ageMonths: 15, title: '指认身体部位', desc: '能指出 1-2 个身体部位（如鼻子、眼睛）' },
    { ageMonths: 18, title: '模仿做家务', desc: '模仿大人扫地、擦桌子等简单家务' },
    { ageMonths: 24, title: '知道常见物品用途', desc: '知道杯子用来喝水、电话用来说话等' },
    { ageMonths: 30, title: '能数到 3', desc: '理解 1-3 的对应关系' },
    { ageMonths: 36, title: '知道自己的名字', desc: '能说出自己的全名' },
    { ageMonths: 42, title: '能分类大小', desc: '理解大/小、多/少' },
    { ageMonths: 48, title: '知道 4-5 种颜色', desc: '能正确说出颜色名字' },
    { ageMonths: 54, title: '能数到 10', desc: '一一对应点数' },
    { ageMonths: 60, title: '理解时间概念', desc: '知道今天/明天/昨天' },
  ],
  physical: [
    { ageMonths: 2, title: '俯卧时能短暂抬头', desc: '趴着时能短暂抬起头部' },
    { ageMonths: 4, title: '从俯卧翻到仰卧', desc: '能从趴着翻成躺着' },
    { ageMonths: 6, title: '独立坐（有支撑）', desc: '有支撑时能独立坐着' },
    { ageMonths: 9, title: '爬行', desc: '能用手膝协调向前爬行' },
    { ageMonths: 12, title: '扶着家具走', desc: '能扶着沙发或桌子边缘走几步' },
    { ageMonths: 15, title: '独立行走', desc: '不用扶着东西独立行走' },
    { ageMonths: 18, title: '扶着栏杆上下楼梯', desc: '手扶栏杆能上下台阶' },
    { ageMonths: 24, title: '跑、踢球', desc: '能跑起来并用脚踢球' },
    { ageMonths: 30, title: '双脚跳', desc: '能双脚同时离地跳起' },
    { ageMonths: 36, title: '上下楼梯交替', desc: '双脚交替上下楼梯' },
    { ageMonths: 42, title: '骑三轮车', desc: '能独立骑儿童三轮车' },
    { ageMonths: 48, title: '单脚站 5 秒', desc: '单脚站立保持平衡' },
    { ageMonths: 54, title: '画圆圈', desc: '能画出闭合的圆圈' },
    { ageMonths: 60, title: '跳绳 5 次', desc: '能连续跳绳' },
  ],
  social: [
    { ageMonths: 2, title: '对人微笑', desc: '看到人脸时会自发微笑' },
    { ageMonths: 4, title: '笑出声', desc: '会咯咯笑出声来' },
    { ageMonths: 6, title: '认识熟悉的人', desc: '能区分熟人和陌生人' },
    { ageMonths: 9, title: '对陌生人害羞或紧张', desc: '见到陌生人会躲到家长怀里' },
    { ageMonths: 12, title: '玩躲猫猫等互动游戏', desc: '喜欢躲猫猫、拍手歌等互动' },
    { ageMonths: 15, title: '模仿其他小朋友', desc: '会观察并模仿同伴的行为' },
    { ageMonths: 18, title: '有喜欢的玩具/人', desc: '表现出对特定玩具或人的偏好' },
    { ageMonths: 24, title: '与其他小朋友平行玩耍', desc: '能在别的小朋友旁边各自玩' },
    { ageMonths: 30, title: '模仿同伴', desc: '观察并模仿其他小朋友的行为' },
    { ageMonths: 36, title: '情绪表达', desc: '能用语言表达开心/生气/难过' },
    { ageMonths: 42, title: '轮流等待', desc: '在游戏中能等待轮到自己的顺序' },
    { ageMonths: 48, title: '交朋友', desc: '有自己的好朋友，能说出朋友名字' },
    { ageMonths: 54, title: '合作游戏', desc: '能与其他小朋友合作完成一件事' },
    { ageMonths: 60, title: '理解规则', desc: '理解并遵守简单的集体规则' },
  ],
  language: [
    { ageMonths: 2, title: '发出咕咕声', desc: '发出"咕咕""啊啊"等元音' },
    { ageMonths: 4, title: '咿呀学语', desc: '发出"咿咿呀呀"的重复音节' },
    { ageMonths: 6, title: '对声音有反应、转头', desc: '听到声音会转头寻找声源' },
    { ageMonths: 9, title: '理解"不"', desc: '听到"不"会暂停动作' },
    { ageMonths: 12, title: '说"妈妈"或"爸爸"', desc: '有指向性地叫爸爸妈妈' },
    { ageMonths: 15, title: '说 1-2 个词（除爸妈外）', desc: '会说"奶奶""抱抱"等实义词' },
    { ageMonths: 18, title: '说 3-5 个词', desc: '主动使用 3-5 个有意义的词' },
    { ageMonths: 24, title: '说 2-3 词短句', desc: '能组合 2-3 个词表达意思，如"妈妈抱"' },
    { ageMonths: 30, title: '说 3-4 字短句', desc: '主谓宾完整短句' },
    { ageMonths: 36, title: '用"我"指自己', desc: '正确使用人称代词' },
    { ageMonths: 42, title: '讲故事', desc: '能简单复述一件发生过的事' },
    { ageMonths: 48, title: '问为什么', desc: '开始频繁提探索性问题' },
    { ageMonths: 54, title: '理解反义词', desc: '如大/小、冷/热、快/慢' },
    { ageMonths: 60, title: '用复杂句', desc: '包含"因为...所以..."的因果表达' },
  ],
  creative: [
    { ageMonths: 2, title: '对鲜艳颜色/图案有反应', desc: '注视鲜艳的颜色或高对比图案' },
    { ageMonths: 4, title: '伸手够悬挂的玩具', desc: '尝试伸手抓取眼前晃动的玩具' },
    { ageMonths: 6, title: '摇晃/敲打玩具发出声音', desc: '通过摇晃或敲击让玩具发声' },
    { ageMonths: 9, title: '用双手各拿一个玩具', desc: '两只手各拿一件东西' },
    { ageMonths: 12, title: '用蜡笔乱涂（有示范）', desc: '在大人示范后能用蜡笔画出痕迹' },
    { ageMonths: 15, title: '堆积木（2-3 块）', desc: '能叠起 2-3 块积木' },
    { ageMonths: 18, title: '假装游戏', desc: '假装喂娃娃、假装打电话等象征性游戏' },
    { ageMonths: 24, title: '搭建积木结构（4+块）', desc: '用 4 块以上积木搭建简单结构' },
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

  // 加载时迁移旧数据：无 status 字段的记录默认为 'achieved'
  function migrateLegacy(list: Milestone[]): Milestone[] {
    return list.map(m => ('status' in m && m.status) ? m : { ...m, status: 'achieved' as const })
  }

  const milestones = ref<Milestone[]>(migrateLegacy(_pMS.load() ?? []))
  const schoolDecisions = ref<SchoolDecision[]>(_pSC.load() ?? [])

  // ---- 能力观察 ----

  function getMilestonesByBaby(babyId: string): Milestone[] {
    return milestones.value.filter(m => m.babyId === babyId).sort((a, b) => b.achievedAt - a.achievedAt)
  }

  /** 某个宝宝在某领域达标了哪些里程碑（含 emerging 和 achieved） */
  function getDomainProgress(babyId: string, domain: MilestoneDomain): Milestone[] {
    return milestones.value.filter(m => m.babyId === babyId && m.domain === domain)
  }

  /** 查找特定里程碑记录（按宝宝+领域+标题） */
  function findMilestone(babyId: string, domain: MilestoneDomain, title: string): Milestone | undefined {
    return milestones.value.find(m => m.babyId === babyId && m.domain === domain && m.title === title)
  }

  /** 获取某个里程碑的三态状态，无记录时返回 'not_yet' */
  function getMilestoneStatus(babyId: string, domain: MilestoneDomain, title: string): Milestone['status'] {
    const m = findMilestone(babyId, domain, title)
    if (!m) return 'not_yet'
    // 兼容旧数据：无 status 字段视为 achieved
    return (m as any).status || 'achieved'
  }

  function addMilestone(data: Omit<Milestone, 'id'>) {
    milestones.value = [...milestones.value, { ...data, id: `ms-${Date.now()}` }]
    _pMS.save(milestones.value)
  }

  /** 更新里程碑状态（不可变） */
  function updateMilestoneStatus(id: string, status: Milestone['status']) {
    milestones.value = milestones.value.map(m =>
      m.id === id
        ? { ...m, status, achievedAt: status === 'achieved' ? Date.now() : m.achievedAt }
        : m
    )
    _pMS.save(milestones.value)
  }

  /** 删除里程碑记录（回到 not_yet 态） */
  function removeMilestone(id: string) {
    milestones.value = milestones.value.filter(m => m.id !== id)
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
    getMilestonesByBaby, getDomainProgress, findMilestone, getMilestoneStatus,
    addMilestone, updateMilestoneStatus, removeMilestone,
    getLatestCoupling, addSchoolDecision,
  }
})
