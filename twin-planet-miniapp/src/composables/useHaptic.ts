/**
 * useHaptic — 触觉模式库
 * 每个模式映射到一个物理隐喻，与视觉动画同步
 */
import { ref, onUnmounted } from 'vue'

type HapticType = 'light' | 'medium' | 'heavy'

export function useHaptic() {
  const enabled = ref(true)
  let intervalHandle: ReturnType<typeof setInterval> | null = null

  function vibrate(type: HapticType) {
    if (!enabled.value) return
    // #ifdef MP-WEIXIN
    uni.vibrateShort({ type } as any)
    // #endif
  }

  function clearInterval_() {
    if (intervalHandle) { clearInterval(intervalHandle); intervalHandle = null }
  }

  /** 心跳 — 持续轻触脉冲 (长按压缩阶段) */
  function heartbeatStart() {
    clearInterval_()
    vibrate('light')
    intervalHandle = setInterval(() => vibrate('light'), 80)
  }
  function heartbeatStop() { clearInterval_() }

  /** 锁定 — 单次重击 (阈值触发) */
  function lock() { vibrate('heavy') }

  /** 刻度 — 单次轻触 (轨道环每段/时间回溯每分) */
  function tick() { vibrate('light') }

  /** 关门 — 单次重击 (停止计时) */
  function thump() { vibrate('heavy') }

  /** 贴纸 — 两次快速轻触 (完成粒子峰值) */
  function sparkle() {
    vibrate('light')
    setTimeout(() => vibrate('light'), 50)
  }

  /** 液滴 — 单次中触 (快记 flick) */
  function droplet() { vibrate('medium') }

  /** 双星同步 — 两次重击 80ms 间隔 */
  function doubleBeat() {
    vibrate('heavy')
    setTimeout(() => vibrate('heavy'), 80)
  }

  onUnmounted(() => clearInterval_())

  return { enabled, heartbeatStart, heartbeatStop, lock, tick, thump, sparkle, droplet, doubleBeat }
}
