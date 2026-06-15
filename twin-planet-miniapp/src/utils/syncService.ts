/**
 * 数据同步服务
 * 将本地记录同步到后端服务器，防止换手机数据丢失
 * 采用"尽力同步"策略：失败不阻塞用户操作，下次重试
 */
import { request, getToken } from '@/api/client'
import { PERSIST_KEYS } from '@/utils/persist'

const SYNC_STATE_KEY = 'tp_sync_state'

interface SyncState {
  lastSyncAt: number
  lastRecordId: string
  lastGrowthId: string
}

/** 获取同步状态 */
function getSyncState(): SyncState {
  try {
    const raw = uni.getStorageSync(SYNC_STATE_KEY)
    return raw ? JSON.parse(raw) : { lastSyncAt: 0, lastRecordId: '', lastGrowthId: '' }
  } catch { return { lastSyncAt: 0, lastRecordId: '', lastGrowthId: '' } }
}
function saveSyncState(state: SyncState) {
  uni.setStorageSync(SYNC_STATE_KEY, JSON.stringify(state))
}

/** 同步喂养/睡眠等日常记录（含重试队列） */
export async function syncRecords(records: any[]): Promise<number> {
  const token = getToken()
  if (!token || records.length === 0) return 0

  // 添加 recordedBy 字段到每条记录
  const enriched = records.map((r: any) => ({
    ...r,
    recordedBy: r.recordedBy || r.recorded_by || 'mom',
  }))

  try {
    const res = await request<{ synced: number }>('/records/batch', {
      method: 'POST', data: { records: enriched },
    })
    if (res.success && res.data) {
      const state = getSyncState()
      state.lastSyncAt = Date.now()
      if (records.length > 0) {
        state.lastRecordId = records[records.length - 1].id
      }
      saveSyncState(state)
      // 成功后清空该批次的重试队列
      clearRetryQueue('records')
      return res.data.synced
    }
  } catch {
    // 失败时加入重试队列
    enqueueRetry('records', enriched.slice(-50))
  }
  return 0
}

// ---- 重试队列 ----
const RETRY_QUEUE_KEY = 'tp_sync_retry_queue'

interface RetryItem {
  type: 'records' | 'growth'
  data: any[]
  failedAt: number
  retries: number
}

function getRetryQueue(): RetryItem[] {
  try {
    const raw = uni.getStorageSync(RETRY_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveRetryQueue(queue: RetryItem[]) {
  // 最多保留 10 个失败批次
  uni.setStorageSync(RETRY_QUEUE_KEY, JSON.stringify(queue.slice(-10)))
}

function enqueueRetry(type: RetryItem['type'], data: any[]) {
  const queue = getRetryQueue()
  // 避免重复排队同类型数据
  const existing = queue.findIndex(q => q.type === type)
  if (existing >= 0) {
    queue[existing] = { type, data, failedAt: Date.now(), retries: queue[existing].retries + 1 }
  } else {
    queue.push({ type, data, failedAt: Date.now(), retries: 0 })
  }
  saveRetryQueue(queue)
}

function clearRetryQueue(type: RetryItem['type']) {
  const queue = getRetryQueue().filter(q => q.type !== type)
  saveRetryQueue(queue)
}

/** 重试失败的同步队列（在 App onShow 或网络恢复时调用） */
export async function retryFailedSyncs(): Promise<number> {
  const queue = getRetryQueue()
  if (!queue.length) return 0
  let synced = 0
  for (const item of queue) {
    if (item.type === 'records') {
      const n = await syncRecords(item.data)
      if (n > 0) synced += n
    }
  }
  return synced
}

/** 从服务端拉取新记录（换手机恢复数据） */
export async function pullRecords(): Promise<any[]> {
  const token = getToken()
  if (!token) return []
  try {
    const state = getSyncState()
    const res = await request<any[]>('/records/since?timestamp=' + (state.lastSyncAt || 0))
    if (res.success && res.data) {
      // 更新同步时间
      saveSyncState({ ...state, lastSyncAt: Date.now() })
      return res.data
    }
  } catch { /* 静默失败 */ }
  return []
}

/** 同步生长测量数据 */
export async function syncGrowthMeasurements(measurements: any[]): Promise<number> {
  const token = getToken()
  if (!token || measurements.length === 0) return 0

  let synced = 0
  for (const m of measurements) {
    try {
      const res = await request('/growth', { method: 'POST', data: m })
      if (res.success) synced++
    } catch { /* continue */ }
  }
  return synced
}

/** 导出全部数据为 JSON 文件（换手机迁移用） */
export function exportAllData(): string {
  const allData: Record<string, any> = {}
  // 🔧 从 PERSIST_KEYS 动态构建，不再硬编码
  const keys = Object.values(PERSIST_KEYS).map(k => 'tp_' + k)
  // 🔒 不导出 token（防止账户劫持）
  keys.push('tp_active_baby', 'tp_active_timers', 'tp_active_session')

  for (const key of keys) {
    try {
      const raw = uni.getStorageSync(key)
      if (raw) allData[key] = JSON.parse(raw)
    } catch { /* skip unreadable keys */ }
  }

  const json = JSON.stringify({ exportedAt: new Date().toISOString(), data: allData }, null, 2)
  return json
}

/** 保存导出数据到剪贴板或文件 */
export function saveExportData(): Promise<string> {
  return new Promise((resolve, reject) => {
    // 🔒 P1-5 修复: 导出前警告隐私风险
    uni.showModal({
      title: '数据导出',
      content: '即将导出包含双胞胎姓名、出生日期、喂养记录等家庭隐私数据的 JSON 文件。\n\n请勿通过微信或云存储明文传输此文件。',
      confirmText: '确认导出',
      cancelText: '取消',
      success: (modalRes) => {
        if (!modalRes.confirm) {
          reject(new Error('用户取消导出'))
          return
        }
        const json = exportAllData()
        const fs = uni.getFileSystemManager()
        const path = `${wx.env.USER_DATA_PATH}/twin-planet-backup-${Date.now()}.json`
        fs.writeFile({
          filePath: path,
          data: json,
          encoding: 'utf8',
          success: () => resolve(path),
          fail: (err) => reject(err),
        })
      },
      fail: () => reject(new Error('弹窗失败')),
    })
  })
}

/** 同步交接班语音/文字便签到服务器（跨设备共享） */
export async function syncHandoverMessage(msg: {
  babyId?: string; audioUrl?: string; durationSec?: number; text?: string
}): Promise<string | null> {
  const token = getToken()
  if (!token) return null
  try {
    const res = await request<{ id: string }>('/handover', { method: 'POST', data: msg })
    if (res.success && res.data) return res.data.id
  } catch { /* 静默 */ }
  return null
}

/** 从服务器拉取交接班消息 */
export async function pullHandoverMessages(since?: number): Promise<any[]> {
  const token = getToken()
  if (!token) return []
  try {
    const url = since ? `/handover/since?timestamp=${since}` : '/handover'
    const res = await request<any[]>(url)
    if (res.success && res.data) return res.data
  } catch { /* 静默 */ }
  return []
}

/** 获取上次同步时间（用于 UI 显示） */
export function getLastSyncTime(): string {
  const state = getSyncState()
  if (!state.lastSyncAt) return '从未同步'
  const diff = Math.floor((Date.now() - state.lastSyncAt) / 60000)
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  return `${Math.floor(diff / 60)}小时前`
}
