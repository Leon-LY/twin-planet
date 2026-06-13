/**
 * useLongPress — 长按手势
 * 三阶段：contact(0-150ms) → compression(150-600ms) → blossom(600ms+)
 * 松手 <600ms → 取消（弹性回弹）
 * 手指漂移 >20rpx → 取消
 */
import { ref, type Ref } from 'vue'

export interface LongPressState {
  pressing: Ref<boolean>       // 正在触摸
  progress: Ref<number>         // 0-1 (0=刚接触, 1=达到阈值)
  triggered: Ref<boolean>       // 是否已触发（跨过 600ms 阈值）
  startX: Ref<number>
  startY: Ref<number>
}

export function useLongPress(options?: {
  threshold?: number       // 触发阈值 ms, 默认 600
  cancelDistance?: number  // 取消距离 rpx, 默认 20
  onTrigger?: () => void
  onCancel?: () => void
}): LongPressState & {
  onTouchStart: (e: any) => void
  onTouchMove: (e: any) => void
  onTouchEnd: (e: any) => void
} {
  const threshold = options?.threshold ?? 600
  const cancelDist = options?.cancelDistance ?? 20

  const pressing = ref(false)
  const progress = ref(0)
  const triggered = ref(false)
  const startX = ref(0)
  const startY = ref(0)

  let pressStart = 0
  let progressHandle: ReturnType<typeof setInterval> | null = null
  let cancelled = false

  function clearProgress() {
    if (progressHandle) { clearInterval(progressHandle); progressHandle = null }
  }

  function onTouchStart(e: any) {
    const touch = e.touches?.[0] || e
    startX.value = touch.clientX || touch.pageX || 0
    startY.value = touch.clientY || touch.pageY || 0
    pressing.value = true
    progress.value = 0
    triggered.value = false
    cancelled = false
    pressStart = Date.now()

    clearProgress()
    progressHandle = setInterval(() => {
      const elapsed = Date.now() - pressStart
      progress.value = Math.min(1, elapsed / threshold)
      if (elapsed >= threshold && !cancelled) {
        triggered.value = true
        progress.value = 1
        clearProgress()
        options?.onTrigger?.()
      }
    }, 16) // ~60fps
  }

  function onTouchMove(e: any) {
    if (!pressing.value || triggered.value) return
    const touch = e.touches?.[0] || e
    const dx = (touch.clientX || touch.pageX || 0) - startX.value
    const dy = (touch.clientY || touch.pageY || 0) - startY.value
    if (Math.abs(dx) > cancelDist || Math.abs(dy) > cancelDist) {
      cancelled = true
      pressing.value = false
      progress.value = 0
      triggered.value = false
      clearProgress()
      options?.onCancel?.()
    }
  }

  function onTouchEnd(_e: any) {
    clearProgress()
    if (!triggered.value) {
      // 松手太早 — 取消
      cancelled = true
      options?.onCancel?.()
    }
    // 渐变回弹 (CSS transition 处理)
    setTimeout(() => {
      pressing.value = false
      progress.value = 0
      triggered.value = false
    }, 200)
  }

  return { pressing, progress, triggered, startX, startY, onTouchStart, onTouchMove, onTouchEnd }
}
