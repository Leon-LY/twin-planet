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
      } catch (e) {
        console.warn(`[persist] save ${fullKey} failed:`, e)
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
  interactions: 'interactions',  // 向后兼容，已拆分为 sprout + contribution
  sprout: 'sprout',
  contribution: 'contribution',
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
