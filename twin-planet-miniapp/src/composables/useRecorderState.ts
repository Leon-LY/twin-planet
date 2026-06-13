/**
 * useRecorderState — 记录页状态机
 * 替代 v-if 硬切：idle | running_single | running_dual | completing
 */
import { computed, type ComputedRef } from 'vue'

export type RecorderState = 'idle' | 'running_single' | 'running_dual' | 'completing'

export function useRecorderState(
  isRunning: ComputedRef<boolean>,
  timerCount: ComputedRef<number>,
) {
  const state = computed<RecorderState>(() => {
    if (!isRunning.value) return 'idle'
    if (timerCount.value >= 2) return 'running_dual'
    return 'running_single'
  })

  const stateClass = computed(() => `recorder-${state.value}`)

  return { state, stateClass }
}
