/**
 * 存储配额监控
 * 微信小程序本地存储上限 10MB，静默失败会导致数据丢失
 * 此模块在存储接近上限时主动告警
 */
const STORAGE_LIMIT = 10 * 1024 * 1024 // 10MB
const WARN_THRESHOLD = 0.8 // 80% 告警
const CRITICAL_THRESHOLD = 0.95 // 95% 严重

export interface StorageStatus {
  currentSize: number      // 字节
  limitSize: number        // 10MB
  usagePercent: number     // 0-100
  level: 'ok' | 'warn' | 'critical'
  message: string
}

/** 估算当前 storage 使用量（通过遍历所有 key） */
function estimateUsage(): number {
  try {
    const { keys } = uni.getStorageInfoSync()
    let total = 0
    for (const key of keys) {
      try {
        const raw = uni.getStorageSync(key)
        if (typeof raw === 'string') total += raw.length * 2 // UTF-16 近似
      } catch { /* skip */ }
    }
    return total
  } catch { return 0 }
}

/** 检查存储状态 */
export function checkStorage(): StorageStatus {
  const currentSize = estimateUsage()
  const usagePercent = Math.round((currentSize / STORAGE_LIMIT) * 100)
  let level: StorageStatus['level'] = 'ok'
  let message = ''

  if (usagePercent >= CRITICAL_THRESHOLD * 100) {
    level = 'critical'
    message = `存储空间将满 (${usagePercent}%)，旧数据可能丢失。建议导出备份后清理。`
  } else if (usagePercent >= WARN_THRESHOLD * 100) {
    level = 'warn'
    message = `存储已使用 ${usagePercent}%，建议定期导出备份。`
  }

  return { currentSize, limitSize: STORAGE_LIMIT, usagePercent, level, message }
}

/** 在 App 启动或 onShow 时调用，必要时弹窗提醒用户 */
export function monitorStorage() {
  const status = checkStorage()
  if (status.level === 'critical') {
    uni.showModal({
      title: '⚠️ 存储空间不足',
      content: status.message,
      confirmText: '导出备份',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/index/index' })
        }
      },
    })
  } else if (status.level === 'warn') {
    // 警告级别仅记录日志，不打扰用户
    console.warn('[Storage]', status.message)
  }
}
