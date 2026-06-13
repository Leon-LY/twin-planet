/**
 * 触觉反馈工具 — 并蒂星球
 * 统一管理 mini-app haptic 反馈，确保全局一致的交互体验
 */
export function tapLight() {
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif
}

export function tapMedium() {
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'medium' })
  // #endif
}

export function tapHeavy() {
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'heavy' })
  // #endif
}

export function tapLong() {
  // #ifdef MP-WEIXIN
  uni.vibrateLong()
  // #endif
}
