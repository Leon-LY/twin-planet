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

/** 同步喂养/睡眠等日常记录 */
export async function syncRecords(records: any[]): Promise<number> {
  const token = getToken()
  if (!token || records.length === 0) return 0

  try {
    const res = await request<{ synced: number }>('/records/batch', {
      method: 'POST', data: { records },
    })
    if (res.success && res.data) {
      // 🔧 推送成功后更新同步状态
      const state = getSyncState()
      state.lastSyncAt = Date.now()
      if (records.length > 0) {
        state.lastRecordId = records[records.length - 1].id
      }
      saveSyncState(state)
      return res.data.synced
    }
  } catch { /* 静默失败，下次再试 */ }
  return 0
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
  const keys = Object.values(PERSIST_KEYS)
    .map(k => 'tp_' + k)
    .filter(k => k !== 'tp_token') // 🔒 不导出 JWT token（防止账户劫持）
  keys.push('tp_active_baby', 'tp_active_timer', 'tp_active_session')

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
  })
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
