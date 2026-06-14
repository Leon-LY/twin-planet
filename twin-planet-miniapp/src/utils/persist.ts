/**
 * LocalStorage 持久化工具
 * 利用 uni.setStorageSync / uni.getStorageSync 做本地持久化
 * 数据键名前缀 tp_（twin-planet）
 *
 * 用法：
 *   const p = createPersistence('user')
 *   p.save({ name: 'Leon' })       // 写入 tp_user
 *   const data = p.load()           // 读取 tp_user
 */

const PREFIX = 'tp_'
const MAX_STORAGE = 10 * 1024 * 1024  // 微信小程序 10MB 限制
const WARN_THRESHOLD = 8 * 1024 * 1024 // 8MB 时警告

/** 检查存储空间，返回 { used, limit, percent } */
export function checkStorageQuota(): { used: number; limit: number; percent: number } {
  try {
    const info = uni.getStorageInfoSync()
    return {
      used: info.currentSize,
      limit: MAX_STORAGE,
      percent: Math.round((info.currentSize / MAX_STORAGE) * 100),
    }
  } catch {
    return { used: 0, limit: MAX_STORAGE, percent: 0 }
  }
}

/** 存储空间不足时弹窗警告 */
let _quotaWarned = false
function warnIfLowStorage() {
  if (_quotaWarned) return
  const { percent } = checkStorageQuota()
  if (percent >= 80) {
    _quotaWarned = true
    uni.showModal({
      title: '存储空间紧张',
      content: `本地存储已使用 ${percent}%，建议导出数据备份后清理旧记录。`,
      confirmText: '去清理',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/privacy/index' })
        }
      },
    })
    // 5分钟后允许再次提醒
    setTimeout(() => { _quotaWarned = false }, 300000)
  }
}

export interface Persistence<T = unknown> {
  /** 保存数据到本地 */
  save(data: T): void
  /** 从本地读取数据，不存在返回 null */
  load(): T | null
  /** 清除该 key 的数据 */
  remove(): void
}

/** 创建一个持久化实例 */
export function createPersistence<T = unknown>(key: string): Persistence<T> {
  const fullKey = PREFIX + key

  return {
    save(data: T) {
      try {
        uni.setStorageSync(fullKey, JSON.stringify(data))
        warnIfLowStorage()
      } catch (e) {
        console.warn(`[persist] save ${fullKey} failed:`, e)
        // 存储满时提示用户
        if (String(e).includes('exceed') || String(e).includes('quota')) {
          uni.showToast({ title: '存储空间不足，请清理旧数据', icon: 'none', duration: 3000 })
        }
      }
    },

    load(): T | null {
      try {
        const raw = uni.getStorageSync(fullKey)
        if (!raw) return null
        return JSON.parse(raw) as T
      } catch (e) {
        console.warn(`[persist] load ${fullKey} failed:`, e)
        return null
      }
    },

    remove() {
      try {
        uni.removeStorageSync(fullKey)
      } catch (e) {
        console.warn(`[persist] remove ${fullKey} failed:`, e)
      }
    },
  }
}

/** 所有持久化 key 常量 */
export const PERSIST_KEYS = {
  user: 'user',
  family: 'family',
  babies: 'babies',
  records: 'records',
  interactions: 'interactions',
  duty: 'duty',
  guardian: 'guardian',
  alerts: 'alerts',
  milestones: 'milestones',
  school_decision: 'school_decision',
  growth: 'growth_measurements',
  stickers: 'stickers',
  handover: 'handover_messages',
  token: 'token',
} as const
