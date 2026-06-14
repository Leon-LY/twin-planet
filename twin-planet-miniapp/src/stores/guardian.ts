/**
 * 守护系统 — 向后兼容导出
 * 已拆分为 energy.ts（电量表）+ oneOnOne.ts（一人时光）
 * 旧代码无需改动，新代码建议直接从 @/stores/energy 或 @/stores/oneOnOne 导入
 */
import { defineStore } from 'pinia'
import { useEnergyStore, type EnergyState } from './energy'
import { useOneOnOneStore, type OneOnOneSession } from './oneOnOne'

export { type EnergyState, type OneOnOneSession }

export const useGuardianStore = defineStore('guardian', () => {
  const energy = useEnergyStore()
  const oo = useOneOnOneStore()

  return {
    momEnergy: energy.momEnergy,
    dadEnergy: energy.dadEnergy,
    setEnergy: energy.setEnergy,
    autoCalcEnergy: energy.autoCalcEnergy,
    sessions: oo.sessions,
    activeSession: oo.activeSession,
    timeGapWarning: oo.timeGapWarning,
    timeWithBaby: oo.timeWithBaby,
    startSession: oo.startSession,
    endSession: oo.endSession,
  }
})
