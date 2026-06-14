/**
 * 电量表 Store — 照顾者精力管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRecordsStore } from './records'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export interface EnergyState {
  level: number       // 1-10
  reason: string
  updatedAt: number
}

export const useEnergyStore = defineStore('energy', () => {
  const _p = createPersistence<{ mom: EnergyState; dad: EnergyState }>(PERSIST_KEYS.guardian + '_energy')
  const saved = _p.load()

  const momEnergy = ref<EnergyState>(saved?.mom ?? { level: 5, reason: '还没开始记录', updatedAt: Date.now() })
  const dadEnergy = ref<EnergyState>(saved?.dad ?? { level: 5, reason: '还没开始记录', updatedAt: Date.now() })

  function setEnergy(who: 'mom' | 'dad', level: number, reason: string) {
    const clamped = Math.max(1, Math.min(10, Math.round(level)))
    const target = who === 'mom' ? momEnergy : dadEnergy
    target.value = { level: clamped, reason, updatedAt: Date.now() }
    _p.save({ mom: momEnergy.value, dad: dadEnergy.value })
  }

  function autoCalcEnergy(who: 'mom' | 'dad') {
    const rs = useRecordsStore()
    const today = new Date().toISOString().slice(0, 10)
    const todayLogs = rs.logs.filter(l => new Date(l.createdAt).toISOString().slice(0, 10) === today)
    const cnt = todayLogs.length

    let level = 5, reason = ''
    if (cnt === 0) { level = 5; reason = '今天还没有记录' }
    else if (cnt < 3) { level = 4; reason = '只记了 ' + cnt + ' 次，看起来比较轻松' }
    else if (cnt < 8) { level = 3; reason = '记了 ' + cnt + ' 次，你辛苦了' }
    else if (cnt < 15) { level = 2; reason = '记了 ' + cnt + ' 次，电量告急' }
    else { level = 1; reason = '记了 ' + cnt + ' 次！快去休息' }
    setEnergy(who, level, reason)
  }

  return { momEnergy, dadEnergy, setEnergy, autoCalcEnergy }
})
