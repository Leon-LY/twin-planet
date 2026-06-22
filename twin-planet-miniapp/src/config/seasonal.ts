/**
 * 节气/季节配置
 * 24 节气数据表，用于首页季节提示行 + 节气贴纸规则
 */

export interface SeasonalTerm {
  name: string
  /** 起始月日 [month, day]，month 为 1-12 */
  start: [number, number]
  /** 结束月日 [month, day]，month 为 1-12 */
  end: [number, number]
  emoji: string
  hint: string
}

export const SEASONAL_TERMS: SeasonalTerm[] = [
  { name: '立春', start: [2, 3], end: [2, 18], emoji: '🌱', hint: '东风解冻 · 万物复苏的起点' },
  { name: '雨水', start: [2, 19], end: [3, 5], emoji: '💧', hint: '好雨知时节 · 滋润宝宝成长' },
  { name: '惊蛰', start: [3, 6], end: [3, 20], emoji: '⚡', hint: '春雷始鸣 · 小怪兽们蠢蠢欲动' },
  { name: '春分', start: [3, 21], end: [4, 4], emoji: '🌸', hint: '昼夜平分 · 平衡生长的好时节' },
  { name: '清明', start: [4, 5], end: [4, 19], emoji: '🪡', hint: '天清地明 · 带宝宝踏青去吧' },
  { name: '谷雨', start: [4, 20], end: [5, 5], emoji: '🌿', hint: '雨生百谷 · 滋养每一寸成长' },
  { name: '立夏', start: [5, 6], end: [5, 20], emoji: '☀️', hint: '万物繁茂 · 夏天来啦' },
  { name: '小满', start: [5, 21], end: [6, 5], emoji: '🌾', hint: '麦穗初满 · 小得盈满' },
  { name: '芒种', start: [6, 6], end: [6, 20], emoji: '🌾', hint: '风吹麦浪 · 播种希望的时节' },
  { name: '夏至', start: [6, 21], end: [7, 6], emoji: '☀️', hint: '一年中最长的白天 · 和宝宝多晒晒太阳' },
  { name: '小暑', start: [7, 7], end: [7, 22], emoji: '🔥', hint: '温风至 · 注意防暑哦' },
  { name: '大暑', start: [7, 23], end: [8, 6], emoji: '🏖️', hint: '炎炎夏日 · 给宝宝多喝水' },
  { name: '立秋', start: [8, 7], end: [8, 22], emoji: '🍂', hint: '一叶知秋 · 凉爽的日子近了' },
  { name: '处暑', start: [8, 23], end: [9, 7], emoji: '🌤️', hint: '暑气渐消 · 秋高气爽' },
  { name: '白露', start: [9, 8], end: [9, 22], emoji: '💧', hint: '露从今夜白 · 添件小衣服' },
  { name: '秋分', start: [9, 23], end: [10, 7], emoji: '🌕', hint: '秋色平分 · 丰收的季节' },
  { name: '寒露', start: [10, 8], end: [10, 22], emoji: '🍁', hint: '露气寒冷 · 给宝宝穿暖和' },
  { name: '霜降', start: [10, 23], end: [11, 6], emoji: '❄️', hint: '霜叶红于二月花 · 深秋已至' },
  { name: '立冬', start: [11, 7], end: [11, 21], emoji: '🧣', hint: '冬之始也 · 储备温暖' },
  { name: '小雪', start: [11, 22], end: [12, 6], emoji: '🌨️', hint: '初雪轻飘 · 和宝宝看第一场雪' },
  { name: '大雪', start: [12, 7], end: [12, 21], emoji: '⛄', hint: '瑞雪兆丰年 · 堆个雪人吧' },
  { name: '冬至', start: [12, 22], end: [1, 5], emoji: '🥟', hint: '冬至大如年 · 吃饺子咯' },
  { name: '小寒', start: [1, 6], end: [1, 20], emoji: '🧤', hint: '数九寒天 · 抱紧小棉袄' },
  { name: '大寒', start: [1, 21], end: [2, 2], emoji: '🏠', hint: '最后一个节气 · 春天不远了' },
]

/**
 * 判断给定日期是否落在某个节气的日期范围内
 * 返回匹配的节气，否则返回 null
 */
export function matchSeasonalTerm(date: Date): SeasonalTerm | null {
  const m = date.getMonth() + 1
  const d = date.getDate()
  for (const term of SEASONAL_TERMS) {
    const [sm, sd] = term.start
    const [em, ed] = term.end
    const afterStart = m > sm || (m === sm && d >= sd)
    const beforeEnd = m < em || (m === em && d <= ed)
    // 跨年区间：例如 冬至 12/22 ~ 小寒 1/5
    if (sm > em) {
      if (afterStart || beforeEnd) return term
    } else {
      if (afterStart && beforeEnd) return term
    }
  }
  return null
}

/**
 * 获取当前节气提示文本
 * 格式：{emoji} 今日{节气名} · {诗意文案}
 */
export function getSeasonalHint(date?: Date): string {
  const term = matchSeasonalTerm(date || new Date())
  if (!term) return ''
  return `${term.emoji} 今日${term.name} · ${term.hint}`
}
