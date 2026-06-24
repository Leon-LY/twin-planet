import { ref, computed, onUnmounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { useRecordsStore } from '@/stores/records'

export function useFeedingReminder() {
  const babiesStore = useBabiesStore()
  const recordsStore = useRecordsStore()

  const nowTick = ref(Date.now())
  const ticker = setInterval(() => { nowTick.value = Date.now() }, 30000)
  onUnmounted(() => clearInterval(ticker))

  const reminders = computed(() => {
    const now = nowTick.value
    const threeDaysAgo = now - 3 * 86400000
    const result: { babyId: string; name: string; color: string; minutesAgo: number; avgInterval: number }[] = []

    for (const baby of [babiesStore.babyA, babiesStore.babyB]) {
      if (!baby) continue
      const feedLogs = recordsStore.logs
        .filter(l => l.babyId === baby.id && l.type === 'feeding' && l.createdAt >= threeDaysAgo)
        .sort((a, b) => b.createdAt - a.createdAt)
      if (feedLogs.length < 2) continue

      const lastFeed = feedLogs[0].createdAt
      const minutesSince = Math.floor((now - lastFeed) / 60000)

      let totalInterval = 0; let intervalCount = 0
      for (let i = 0; i < feedLogs.length - 1; i++) {
        const interval = (feedLogs[i].createdAt - feedLogs[i + 1].createdAt) / 60000
        if (interval > 30 && interval < 480) { totalInterval += interval; intervalCount++ }
      }
      if (intervalCount === 0) continue
      const avgInterval = Math.round(totalInterval / intervalCount)

      if (minutesSince >= avgInterval * 0.8) {
        result.push({
          babyId: baby.id,
          name: baby.nickname || baby.name,
          color: baby.birthOrder === 1 ? 'amber' : 'terracotta',
          minutesAgo: minutesSince,
          avgInterval,
        })
      }
    }
    return result
  })

  return { reminders }
}
