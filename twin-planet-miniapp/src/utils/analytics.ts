/**
 * 轻量级分析埋点
 * 关键事件追踪，不依赖第三方 SDK。
 * 数据存本地，可在隐私页查看，后续接入后端上报。
 */
const ANALYTICS_KEY = 'tp_analytics'
const MAX_EVENTS = 500

export interface AnalyticsEvent {
  event: string
  ts: number
  props?: Record<string, string | number>
}

/** 记录事件 */
export function track(event: string, props?: Record<string, string | number>) {
  try {
    const raw = uni.getStorageSync(ANALYTICS_KEY)
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : []

    // 去重：30秒内相同事件不重复记录
    if (events.length > 0) {
      const last = events[events.length - 1]
      if (last.event === event && Date.now() - last.ts < 30000) return
    }

    events.push({ event, ts: Date.now(), props })
    uni.setStorageSync(ANALYTICS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {}
}

/** 获取事件列表（用于调试/隐私页展示） */
export function getEvents(): AnalyticsEvent[] {
  try {
    const raw = uni.getStorageSync(ANALYTICS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/** 计算关键指标 */
export function getMetrics() {
  const events = getEvents()
  const now = Date.now()
  const day = 86400000

  const sessionStarts = events.filter(e => e.event === 'session_start')
  const records = events.filter(e => e.event === 'record_created')
  const shares = events.filter(e => e.event === 'share_tapped')
  const onboarded = events.filter(e => e.event === 'onboarding_complete')

  return {
    totalSessions: sessionStarts.length,
    totalRecords: records.length,
    totalShares: shares.length,
    totalOnboarded: onboarded.length,
    // 今日
    todayRecords: records.filter(e => now - e.ts < day).length,
    todaySessions: sessionStarts.filter(e => now - e.ts < day).length,
    // 过去7天
    weekRecords: records.filter(e => now - e.ts < 7 * day).length,
    // 日均
    avgDailyRecords: records.length > 0
      ? Math.round(records.length / Math.max(1, (now - records[0].ts) / day))
      : 0,
  }
}

// ====== 便捷方法 ======

export function trackSessionStart() {
  track('session_start')
}

export function trackRecordCreated(type: string, method: 'quick' | 'timer' | 'retro' | 'dual') {
  track('record_created', { type, method })
}

export function trackStickerEarned(label: string) {
  track('sticker_earned', { label })
}

export function trackShare(channel: 'invite' | 'card' | 'stickers') {
  track('share_tapped', { channel })
}

export function trackOnboardingComplete(role: string) {
  track('onboarding_complete', { role })
}

export function trackPageView(page: string) {
  track('page_view', { page })
}

export function trackCelebration(level: number) {
  track('milestone_celebration', { level })
}
