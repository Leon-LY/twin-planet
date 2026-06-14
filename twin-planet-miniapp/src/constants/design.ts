/**
 * 双宝记 V4 · 设计令牌常量
 * 唯一 TS 颜色权威源。所有 TS 文件引用此文件，不再各自定义颜色。
 * CSS 变量定义在 App.vue 的 <style> 中，与此文件保持同步。
 */

export const TWIN_COLORS = {
  /** 大宝 — 姜黄/暖橙（按出生顺序，不按性别） */
  A: '#E07B3E',
  /** 二宝 — 豆沙/暖粉（按出生顺序，不按性别） */
  B: '#D48068',
} as const

export const SEMANTIC_COLORS = {
  /** 鼠尾草绿 — 完成/强调/CTA */
  success: '#5C9A6E',
  /** 暖金 — 成就/警告 */
  warning: '#C8993E',
  /** 柔红 — 危险/停止 */
  danger: '#D4706B',
} as const

export const SURFACE_COLORS = {
  /** 暖白纸 — 页面背景 */
  paper: '#FEF9F0',
  /** 暖奶油 — 卡片背景 */
  cream: '#FFF5E8',
  /** 墨色 — 主文字 */
  ink: '#2D2318',
  /** 中灰 — 次文字 */
  inkMd: '#9C8E7C',
  /** 浅灰 — 辅助文字 */
  inkLt: '#D4C8B8',
  /** 暖灰虚线 — 边框/分隔 */
  dot: '#E8DCC8',
} as const

/** 差异等级颜色（生长曲线对比用） */
export const DIFF_COLORS = {
  green: '#5C9A6E',
  yellow: '#C8993E',
  red: '#D4706B',
} as const

export type DiffLevel = 'green' | 'yellow' | 'red'
