/**
 * 节日配置
 * 节日贴纸触发逻辑 — 按公历日期判断
 * 农历节日用近似公历日期范围（每年会有偏差，后续可接入农历库精确计算）
 */

export interface FestivalConfig {
  /** 节日 key */
  key: string
  /** 节日名称 */
  name: string
  /** emoji */
  emoji: string
  /** 公历触发月份（1-12） */
  month: number
  /** 公历触发日期范围起始 */
  dayStart: number
  /** 公历触发日期范围结束 */
  dayEnd: number
  /** 节日类型 */
  type: 'solar' | 'lunar' | 'international'
}

/**
 * 节日配置表
 * 农历节日(lunar)用该月份前后的公历近似日期，实际触发可放宽范围避免错过
 */
export const FESTIVALS: FestivalConfig[] = [
  // === 公历固定节日 ===
  { key: 'new_year', name: '元旦', emoji: '🎆', month: 1, dayStart: 1, dayEnd: 1, type: 'solar' },
  { key: 'women_day', name: '妇女节', emoji: '🌷', month: 3, dayStart: 8, dayEnd: 8, type: 'international' },
  { key: 'labor_day', name: '劳动节', emoji: '🔨', month: 5, dayStart: 1, dayEnd: 1, type: 'solar' },
  { key: 'children_day', name: '儿童节', emoji: '🎈', month: 6, dayStart: 1, dayEnd: 1, type: 'international' },
  { key: 'national_day', name: '国庆节', emoji: '🇨🇳', month: 10, dayStart: 1, dayEnd: 7, type: 'solar' },
  { key: 'halloween', name: '万圣节', emoji: '🎃', month: 10, dayStart: 31, dayEnd: 31, type: 'international' },
  { key: 'christmas', name: '圣诞节', emoji: '🎄', month: 12, dayStart: 24, dayEnd: 25, type: 'international' },

  // === 农历节日（公历近似范围，放宽 7 天避免错过）===
  { key: 'spring_festival', name: '春节', emoji: '🧧', month: 2, dayStart: 1, dayEnd: 15, type: 'lunar' },
  { key: 'lantern_festival', name: '元宵节', emoji: '🏮', month: 2, dayStart: 15, dayEnd: 19, type: 'lunar' },
  { key: 'dragon_boat', name: '端午节', emoji: '🐲', month: 6, dayStart: 10, dayEnd: 20, type: 'lunar' },
  { key: 'qixi', name: '七夕节', emoji: '💕', month: 8, dayStart: 10, dayEnd: 20, type: 'lunar' },
  { key: 'mid_autumn', name: '中秋节', emoji: '🥮', month: 9, dayStart: 10, dayEnd: 20, type: 'lunar' },
  { key: 'chongyang', name: '重阳节', emoji: '🍂', month: 10, dayStart: 11, dayEnd: 20, type: 'lunar' },

  // === 计算型节日（母亲节/父亲节）===
  { key: 'mothers_day', name: '母亲节', emoji: '💐', month: 5, dayStart: 8, dayEnd: 14, type: 'solar' },
  { key: 'fathers_day', name: '父亲节', emoji: '👔', month: 6, dayStart: 15, dayEnd: 21, type: 'solar' },
]

/** 判断今天是否在某个节日的触发范围内，返回匹配的节日或 null */
export function getActiveFestival(date?: Date): FestivalConfig | null {
  const d = date || new Date()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return FESTIVALS.find(f => f.month === m && day >= f.dayStart && day <= f.dayEnd) || null
}
