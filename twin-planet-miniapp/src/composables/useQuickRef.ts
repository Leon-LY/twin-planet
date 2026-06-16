/**
 * useQuickRef — 快速参考信息
 * 「上次喂奶/睡觉是什么时候？」
 */
import { computed } from 'vue'
import { useRecordsStore } from '@/stores/records'
import { useBabiesStore } from '@/stores/babies'
import { timeAgo } from '@/utils/format'

export interface QuickRef {
  lastFeeding: string
  lastSleep: string
  lastDiaper: string
  /** 如果有计时器正在运行，返回计时信息 */
  activeTimer: string
}

export function useQuickRef() {
  const recordsStore = useRecordsStore()
  const babiesStore = useBabiesStore()

  const quickRef = computed<QuickRef>(() => {
    const logs = recordsStore.logs

    /** 获取某个类型最近一条记录的宝宝名 + 相对时间 */
    function lastOf(type: string, babyId?: string): { babyName: string; time: string } | null {
      const filtered = logs
        .filter(l => l.type === type && l.endedAt > 0 && (!babyId || l.babyId === babyId))
        .sort((a, b) => (b.endedAt || b.createdAt) - (a.endedAt || a.createdAt))
      if (!filtered.length) return null
      const log = filtered[0]
      return {
        babyName: log.babyName || (log.babyId === babiesStore.babyA?.id ? (babiesStore.babyA?.nickname || '大宝') : (babiesStore.babyB?.nickname || '小宝')),
        time: timeAgo(log.endedAt || log.createdAt),
      }
    }

    /** 格式化「宝宝名 X分钟前」 */
    function fmt(r: { babyName: string; time: string } | null): string {
      if (!r) return '—'
      return `${r.babyName} ${r.time}`
    }

    // 运行中的计时器
    const running = recordsStore.runningTimer
    let activeTimer = ''
    if (running) {
      const baby = babiesStore.babyA?.id === running.babyId
        ? babiesStore.babyA : babiesStore.babyB
      const name = baby?.nickname || baby?.name || '宝宝'
      const type = running.type === 'feeding' ? '吃奶' : '睡觉'
      const mins = Math.floor(running.elapsed / 60)
      activeTimer = `${name}${type}中 ${mins}分钟`
    }

    return {
      lastFeeding: fmt(lastOf('feeding')),
      lastSleep: fmt(lastOf('sleep')),
      lastDiaper: fmt(lastOf('diaper')),
      activeTimer,
    }
  })

  return { quickRef }
}
