/**
 * WHO 儿童生长标准 — LMS 参数与 Z 值计算
 * 数据来源: WHO Child Growth Standards (2006)
 * 适用于: 0-60 月龄婴幼儿
 */

// ============================================================
// 类型定义
// ============================================================

export interface LMSRecord {
  month: number
  L: number
  M: number
  S: number
}

export interface GrowthDataPoint {
  ageMonths: number
  value: number
}

export interface PercentileCurve {
  percentile: number
  points: Array<{ x: number; y: number }>
}

export type Gender = 'male' | 'female'
export type Indicator = 'weight' | 'length' | 'head_circumference'

// ============================================================
// WHO 体重-for-age L/M/S 参数 (0-60个月，按月度)
// ============================================================

const WHO_WEIGHT_BOYS: LMSRecord[] = [
  { month: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { month: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { month: 2, L: 0.1970, M: 5.5675, S: 0.12385 },
  { month: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { month: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
  { month: 5, L: 0.1395, M: 7.5105, S: 0.11080 },
  { month: 6, L: 0.1257, M: 7.9340, S: 0.10958 },
  { month: 7, L: 0.1134, M: 8.2970, S: 0.10902 },
  { month: 8, L: 0.1021, M: 8.6151, S: 0.10882 },
  { month: 9, L: 0.0917, M: 8.9014, S: 0.10881 },
  { month: 10, L: 0.0820, M: 9.1649, S: 0.10891 },
  { month: 11, L: 0.0730, M: 9.4122, S: 0.10906 },
  { month: 12, L: 0.0644, M: 9.6479, S: 0.10925 },
  { month: 13, L: 0.0563, M: 9.8749, S: 0.10949 },
  { month: 14, L: 0.0487, M: 10.0953, S: 0.10976 },
  { month: 15, L: 0.0413, M: 10.3108, S: 0.11007 },
  { month: 16, L: 0.0343, M: 10.5228, S: 0.11041 },
  { month: 17, L: 0.0275, M: 10.7319, S: 0.11079 },
  { month: 18, L: 0.0211, M: 10.9385, S: 0.11119 },
  { month: 19, L: 0.0148, M: 11.1430, S: 0.11164 },
  { month: 20, L: 0.0087, M: 11.3462, S: 0.11211 },
  { month: 21, L: 0.0029, M: 11.5486, S: 0.11261 },
  { month: 22, L: -0.0028, M: 11.7504, S: 0.11314 },
  { month: 23, L: -0.0083, M: 11.9514, S: 0.11369 },
  { month: 24, L: -0.0137, M: 12.1515, S: 0.11426 },
  { month: 25, L: -0.0189, M: 12.3502, S: 0.11485 },
  { month: 26, L: -0.0240, M: 12.5466, S: 0.11544 },
  { month: 27, L: -0.0289, M: 12.7401, S: 0.11604 },
  { month: 28, L: -0.0337, M: 12.9303, S: 0.11664 },
  { month: 29, L: -0.0385, M: 13.1169, S: 0.11723 },
  { month: 30, L: -0.0431, M: 13.3000, S: 0.11781 },
  { month: 31, L: -0.0476, M: 13.4798, S: 0.11839 },
  { month: 32, L: -0.0520, M: 13.6567, S: 0.11896 },
  { month: 33, L: -0.0564, M: 13.8309, S: 0.11953 },
  { month: 34, L: -0.0606, M: 14.0031, S: 0.12008 },
  { month: 35, L: -0.0648, M: 14.1736, S: 0.12062 },
  { month: 36, L: -0.0689, M: 14.3429, S: 0.12116 },
  { month: 37, L: -0.0729, M: 14.5113, S: 0.12168 },
  { month: 38, L: -0.0769, M: 14.6791, S: 0.12220 },
  { month: 39, L: -0.0808, M: 14.8466, S: 0.12271 },
  { month: 40, L: -0.0846, M: 15.0140, S: 0.12322 },
  { month: 41, L: -0.0884, M: 15.1813, S: 0.12373 },
  { month: 42, L: -0.0921, M: 15.3486, S: 0.12425 },
  { month: 43, L: -0.0957, M: 15.5157, S: 0.12478 },
  { month: 44, L: -0.0993, M: 15.6824, S: 0.12531 },
  { month: 45, L: -0.1028, M: 15.8487, S: 0.12586 },
  { month: 46, L: -0.1063, M: 16.0143, S: 0.12643 },
  { month: 47, L: -0.1097, M: 16.1791, S: 0.12700 },
  { month: 48, L: -0.1131, M: 16.3429, S: 0.12759 },
  { month: 49, L: -0.1165, M: 16.5052, S: 0.12817 },
  { month: 50, L: -0.1198, M: 16.6659, S: 0.12875 },
  { month: 51, L: -0.1230, M: 16.8247, S: 0.12933 },
  { month: 52, L: -0.1262, M: 16.9814, S: 0.12991 },
  { month: 53, L: -0.1294, M: 17.1359, S: 0.13048 },
  { month: 54, L: -0.1325, M: 17.2880, S: 0.13105 },
  { month: 55, L: -0.1356, M: 17.4377, S: 0.13161 },
  { month: 56, L: -0.1387, M: 17.5850, S: 0.13217 },
  { month: 57, L: -0.1417, M: 17.7301, S: 0.13272 },
  { month: 58, L: -0.1447, M: 17.8729, S: 0.13326 },
  { month: 59, L: -0.1477, M: 18.0136, S: 0.13380 },
  { month: 60, L: -0.1506, M: 18.1524, S: 0.13433 },
]

const WHO_WEIGHT_GIRLS: LMSRecord[] = [
  { month: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { month: 1, L: 0.2671, M: 4.1873, S: 0.13724 },
  { month: 2, L: 0.2084, M: 5.1282, S: 0.13000 },
  { month: 3, L: 0.1686, M: 5.8458, S: 0.12619 },
  { month: 4, L: 0.1400, M: 6.4237, S: 0.12402 },
  { month: 5, L: 0.1184, M: 6.8985, S: 0.12274 },
  { month: 6, L: 0.1009, M: 7.2970, S: 0.12204 },
  { month: 7, L: 0.0863, M: 7.6422, S: 0.12178 },
  { month: 8, L: 0.0736, M: 7.9487, S: 0.12181 },
  { month: 9, L: 0.0624, M: 8.2254, S: 0.12199 },
  { month: 10, L: 0.0523, M: 8.4800, S: 0.12223 },
  { month: 11, L: 0.0431, M: 8.7192, S: 0.12247 },
  { month: 12, L: 0.0346, M: 8.9481, S: 0.12268 },
  { month: 13, L: 0.0266, M: 9.1699, S: 0.12283 },
  { month: 14, L: 0.0192, M: 9.3870, S: 0.12294 },
  { month: 15, L: 0.0121, M: 9.6008, S: 0.12299 },
  { month: 16, L: 0.0054, M: 9.8124, S: 0.12303 },
  { month: 17, L: -0.0010, M: 10.0226, S: 0.12306 },
  { month: 18, L: -0.0071, M: 10.2315, S: 0.12309 },
  { month: 19, L: -0.0129, M: 10.4393, S: 0.12315 },
  { month: 20, L: -0.0186, M: 10.6464, S: 0.12323 },
  { month: 21, L: -0.0240, M: 10.8534, S: 0.12335 },
  { month: 22, L: -0.0292, M: 11.0608, S: 0.12350 },
  { month: 23, L: -0.0343, M: 11.2688, S: 0.12369 },
  { month: 24, L: -0.0392, M: 11.4775, S: 0.12390 },
  { month: 25, L: -0.0440, M: 11.6864, S: 0.12414 },
  { month: 26, L: -0.0486, M: 11.8947, S: 0.12441 },
  { month: 27, L: -0.0532, M: 12.1015, S: 0.12472 },
  { month: 28, L: -0.0576, M: 12.3059, S: 0.12506 },
  { month: 29, L: -0.0619, M: 12.5073, S: 0.12545 },
  { month: 30, L: -0.0661, M: 12.7055, S: 0.12587 },
  { month: 31, L: -0.0703, M: 12.9006, S: 0.12633 },
  { month: 32, L: -0.0744, M: 13.0930, S: 0.12683 },
  { month: 33, L: -0.0784, M: 13.2837, S: 0.12737 },
  { month: 34, L: -0.0823, M: 13.4731, S: 0.12794 },
  { month: 35, L: -0.0862, M: 13.6618, S: 0.12855 },
  { month: 36, L: -0.0900, M: 13.8503, S: 0.12919 },
  { month: 37, L: -0.0938, M: 14.0385, S: 0.12988 },
  { month: 38, L: -0.0975, M: 14.2265, S: 0.13059 },
  { month: 39, L: -0.1012, M: 14.4140, S: 0.13135 },
  { month: 40, L: -0.1048, M: 14.6010, S: 0.13213 },
  { month: 41, L: -0.1084, M: 14.7873, S: 0.13293 },
  { month: 42, L: -0.1119, M: 14.9727, S: 0.13376 },
  { month: 43, L: -0.1154, M: 15.1573, S: 0.13460 },
  { month: 44, L: -0.1188, M: 15.3410, S: 0.13545 },
  { month: 45, L: -0.1222, M: 15.5239, S: 0.13630 },
  { month: 46, L: -0.1256, M: 15.7063, S: 0.13716 },
  { month: 47, L: -0.1290, M: 15.8881, S: 0.13800 },
  { month: 48, L: -0.1323, M: 16.0694, S: 0.13884 },
  { month: 49, L: -0.1356, M: 16.2499, S: 0.13968 },
  { month: 50, L: -0.1389, M: 16.4297, S: 0.14051 },
  { month: 51, L: -0.1421, M: 16.6087, S: 0.14132 },
  { month: 52, L: -0.1453, M: 16.7868, S: 0.14213 },
  { month: 53, L: -0.1485, M: 16.9639, S: 0.14293 },
  { month: 54, L: -0.1517, M: 17.1397, S: 0.14371 },
  { month: 55, L: -0.1549, M: 17.3144, S: 0.14448 },
  { month: 56, L: -0.1580, M: 17.4879, S: 0.14525 },
  { month: 57, L: -0.1611, M: 17.6601, S: 0.14600 },
  { month: 58, L: -0.1642, M: 17.8311, S: 0.14675 },
  { month: 59, L: -0.1673, M: 18.0009, S: 0.14748 },
  { month: 60, L: -0.1703, M: 18.1697, S: 0.14821 },
]

// ============================================================
// WHO 身长/身高-for-age L/M/S 参数 (0-24个月身长)
// ============================================================

const WHO_LENGTH_BOYS: LMSRecord[] = [
  { month: 0, L: 1, M: 49.8842, S: 0.03795 },
  { month: 1, L: 1, M: 54.7244, S: 0.03557 },
  { month: 2, L: 1, M: 58.4249, S: 0.03424 },
  { month: 3, L: 1, M: 61.4292, S: 0.03328 },
  { month: 4, L: 1, M: 63.8860, S: 0.03257 },
  { month: 5, L: 1, M: 65.9026, S: 0.03204 },
  { month: 6, L: 1, M: 67.6236, S: 0.03165 },
  { month: 7, L: 1, M: 69.1645, S: 0.03139 },
  { month: 8, L: 1, M: 70.5994, S: 0.03124 },
  { month: 9, L: 1, M: 71.9687, S: 0.03117 },
  { month: 10, L: 1, M: 73.2812, S: 0.03118 },
  { month: 11, L: 1, M: 74.5388, S: 0.03125 },
  { month: 12, L: 1, M: 75.7488, S: 0.03137 },
  { month: 13, L: 1, M: 76.9186, S: 0.03154 },
  { month: 14, L: 1, M: 78.0497, S: 0.03174 },
  { month: 15, L: 1, M: 79.1458, S: 0.03197 },
  { month: 16, L: 1, M: 80.2113, S: 0.03222 },
  { month: 17, L: 1, M: 81.2487, S: 0.03250 },
  { month: 18, L: 1, M: 82.2587, S: 0.03279 },
  { month: 19, L: 1, M: 83.2418, S: 0.03310 },
  { month: 20, L: 1, M: 84.1996, S: 0.03342 },
  { month: 21, L: 1, M: 85.1348, S: 0.03376 },
  { month: 22, L: 1, M: 86.0477, S: 0.03410 },
  { month: 23, L: 1, M: 86.9410, S: 0.03445 },
  { month: 24, L: 1, M: 87.8161, S: 0.03479 },
]

const WHO_LENGTH_GIRLS: LMSRecord[] = [
  { month: 0, L: 1, M: 49.1477, S: 0.03790 },
  { month: 1, L: 1, M: 53.6872, S: 0.03640 },
  { month: 2, L: 1, M: 57.0673, S: 0.03568 },
  { month: 3, L: 1, M: 59.8029, S: 0.03520 },
  { month: 4, L: 1, M: 62.0899, S: 0.03486 },
  { month: 5, L: 1, M: 64.0301, S: 0.03463 },
  { month: 6, L: 1, M: 65.7311, S: 0.03448 },
  { month: 7, L: 1, M: 67.2873, S: 0.03441 },
  { month: 8, L: 1, M: 68.7498, S: 0.03440 },
  { month: 9, L: 1, M: 70.1435, S: 0.03444 },
  { month: 10, L: 1, M: 71.4818, S: 0.03452 },
  { month: 11, L: 1, M: 72.7710, S: 0.03464 },
  { month: 12, L: 1, M: 74.0150, S: 0.03479 },
  { month: 13, L: 1, M: 75.2176, S: 0.03496 },
  { month: 14, L: 1, M: 76.3817, S: 0.03514 },
  { month: 15, L: 1, M: 77.5099, S: 0.03534 },
  { month: 16, L: 1, M: 78.6055, S: 0.03555 },
  { month: 17, L: 1, M: 79.6710, S: 0.03576 },
  { month: 18, L: 1, M: 80.7079, S: 0.03598 },
  { month: 19, L: 1, M: 81.7182, S: 0.03620 },
  { month: 20, L: 1, M: 82.7036, S: 0.03643 },
  { month: 21, L: 1, M: 83.6654, S: 0.03666 },
  { month: 22, L: 1, M: 84.6040, S: 0.03688 },
  { month: 23, L: 1, M: 85.5202, S: 0.03711 },
  { month: 24, L: 1, M: 86.4153, S: 0.03734 },
]

// ============================================================
// 数据访问
// ============================================================

const DATA_MAP: Record<string, Record<string, LMSRecord[]>> = {
  weight: { male: WHO_WEIGHT_BOYS, female: WHO_WEIGHT_GIRLS },
  length: { male: WHO_LENGTH_BOYS, female: WHO_LENGTH_GIRLS },
}

export function getWHOData(gender: Gender, indicator: Indicator): LMSRecord[] {
  return DATA_MAP[indicator]?.[gender] ?? []
}

export function getLMS(gender: Gender, indicator: Indicator, ageMonths: number): LMSRecord | null {
  const data = getWHOData(gender, indicator)
  if (!data.length) return null

  // 精确匹配
  const exact = data.find((d) => d.month === ageMonths)
  if (exact) return exact

  // 超出范围取边界
  if (ageMonths < data[0].month) return data[0]
  if (ageMonths > data[data.length - 1].month) return data[data.length - 1]

  // 线性插值
  const lower = [...data].reverse().find((d) => d.month <= ageMonths)!
  const upper = data.find((d) => d.month >= ageMonths)!
  if (lower.month === upper.month) return lower

  const t = (ageMonths - lower.month) / (upper.month - lower.month)
  return {
    month: ageMonths,
    L: lower.L + (upper.L - lower.L) * t,
    M: lower.M + (upper.M - lower.M) * t,
    S: lower.S + (upper.S - lower.S) * t,
  }
}

// ============================================================
// Z 值计算
// ============================================================

/**
 * 计算 WHO Z-score
 * Z = ((X/M)^L - 1) / (L * S)  当 L ≠ 0
 * Z = ln(X/M) / S              当 L = 0
 */
export function calcZScore(value: number, L: number, M: number, S: number): number {
  if (S === 0) return 0
  if (L === 0) return Math.log(value / M) / S
  return (Math.pow(value / M, L) - 1) / (L * S)
}

/**
 * Z-score → 百分位 (标准正态累积分布)
 */
export function zScoreToPercentile(z: number): number {
  // 使用近似公式计算标准正态 CDF
  return normalCDF(z) * 100
}

function normalCDF(x: number): number {
  // Abramowitz & Stegun 近似
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * x)
  const erf = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1.0 + sign * erf)
}

// ============================================================
// 百分位曲线生成
// ============================================================

/**
 * 生成指定百分位的生长曲线
 */
export function getPercentileCurve(
  gender: Gender,
  indicator: Indicator,
  percentile: number,
): PercentileCurve {
  const data = getWHOData(gender, indicator)
  const z = percentileToZ(percentile)

  return {
    percentile,
    points: data.map((record) => ({
      x: record.month,
      y: lmsToValue(z, record.L, record.M, record.S),
    })),
  }
}

function percentileToZ(percentile: number): number {
  // 使用逆正态近似
  const p = percentile / 100
  return inverseNormalCDF(p)
}

function inverseNormalCDF(p: number): number {
  // Moro 逆正态近似
  const a0 = 2.50662823884
  const a1 = -18.61500062529
  const a2 = 41.39119773534
  const a3 = -25.44106049637
  const b1 = -8.47351093090
  const b2 = 23.08336743743
  const b3 = -21.06224101826
  const b4 = 3.13082909833
  const c0 = 0.3374754822726147
  const c1 = 0.9761690190917186
  const c2 = 0.1607979714918209
  const c3 = 0.0276438810333863
  const c4 = 0.0038405729373609
  const c5 = 0.0003951896511919
  const c6 = 0.0000321767881768
  const c7 = 0.0000002888167364
  const c8 = 0.0000003960315187

  const y = p - 0.5
  if (Math.abs(y) < 0.42) {
    const r = y * y
    return (
      y *
      (((a3 * r + a2) * r + a1) * r + a0) /
      ((((b4 * r + b3) * r + b2) * r + b1) * r + 1)
    )
  }
  const r = p < 0.5 ? p : 1 - p
  const s = Math.log(-Math.log(r))
  const z =
    c0 +
    s * (c1 + s * (c2 + s * (c3 + s * (c4 + s * (c5 + s * (c6 + s * (c7 + s * c8)))))))
  return p < 0.5 ? -z : z
}

function lmsToValue(z: number, L: number, M: number, S: number): number {
  if (L === 0) return M * Math.exp(S * z)
  return M * Math.pow(1 + L * S * z, 1 / L)
}

// ============================================================
// 差异率计算（双胞胎对比专用）
// ============================================================

export type DiffLevel = 'green' | 'yellow' | 'red'

export interface DiffResult {
  /** 差异率百分比 */
  rate: number
  /** 差异等级 */
  level: DiffLevel
  /** 说明文字 */
  label: string
}

/**
 * 计算两个宝宝在同一指标上的差异率
 * 龙凤胎阈值更宽松（同性别 <10% 绿 / 10-20% 黄 / >20% 红，异性别 <15% / 15-30% / >30%）
 */
export function calcDifferenceRate(
  valueA: number,
  valueB: number,
  sameGender: boolean,
): DiffResult {
  if (valueA === 0 || valueB === 0) {
    return { rate: 0, level: 'green', label: '数据不足' }
  }

  const rate = (Math.abs(valueA - valueB) / Math.max(valueA, valueB)) * 100
  const green = sameGender ? 10 : 15
  const yellow = sameGender ? 20 : 30

  let level: DiffLevel
  let label: string
  if (rate < green) {
    level = 'green'
    label = '差异正常'
  } else if (rate < yellow) {
    level = 'yellow'
    label = '略有关注'
  } else {
    level = 'red'
    label = '差异较大'
  }

  return { rate, level, label }
}

// ============================================================
// 颜色常量（与 twin-design 对齐）
// ============================================================

import { TWIN_COLORS, DIFF_COLORS as DESIGN_DIFF_COLORS } from '@/constants/design'

export const BABY_COLORS = {
  babyA: TWIN_COLORS.A, // 大宝 — 姜黄
  babyB: TWIN_COLORS.B, // 二宝 — 豆沙
} as const

export const DIFF_COLORS: Record<DiffLevel, string> = {
  green: DESIGN_DIFF_COLORS.green,
  yellow: DESIGN_DIFF_COLORS.yellow,
  red: DESIGN_DIFF_COLORS.red,
}
