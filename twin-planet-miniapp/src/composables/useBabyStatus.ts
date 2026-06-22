/**
 * useBabyStatus — 双宝状态图标共享逻辑
 * IndexMom / IndexDad 共用，避免重复定义
 */
import { useRecordsStore } from '@/stores/records'

export function useBabyStatus() {
  const recordsStore = useRecordsStore()

  /** 状态图标：返回当前状态的 iconfont 类名，无状态时返回空字符串 */
  function babyStatusIcon(babyId: string | undefined, _idx: number): string {
    if (!babyId) return ''
    const timer = recordsStore.runningTimers.find(t => t.babyId === babyId)
    if (timer) return timer.type === 'feeding' ? 'icon-bottle' : 'icon-sleep-zzz'
    const logs = recordsStore.recentLogsByBaby[babyId]
    if (logs?.length) {
      const last = logs[logs.length - 1]
      const minAgo = (Date.now() - last.createdAt) / 60000
      if (minAgo < 30) {
        if (last.type === 'feeding') return 'icon-bottle'
        if (last.type === 'sleep') return 'icon-sleep'
        if (last.type === 'diaper') return 'icon-diaper'
      }
    }
    return ''
  }

  /** 图片加载失败时的兜底处理 */
  function handleImageError(e: any) {
    console.warn('[image] load failed:', (e?.target?.dataset?.src || ''))
  }

  return { babyStatusIcon, handleImageError }
}
