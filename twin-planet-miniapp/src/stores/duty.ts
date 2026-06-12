/**
 * 爸爸值班模式 — SOP 清单引擎
 * 预置标准操作流程，爸爸照着做就行，不需要妈妈指导
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

export type TaskCategory = 'feeding' | 'diaper' | 'sleep' | 'bath' | 'play' | 'custom'
export type TaskMode = 'solo' | 'tandem'  // 单独 / 双人同时

export interface SOPTask {
  id: string
  category: TaskCategory
  title: string
  babyANeed: boolean    // 安宁需要吗
  babyBNeed: boolean    // 安然需要吗
  done: boolean
  note: string
  createdAt: number
}

// 默认 SOP 清单
const DEFAULT_SOP: Omit<SOPTask, 'id' | 'done' | 'note' | 'createdAt'>[] = [
  { category: 'feeding', title: '给两个宝宝喂奶/辅食', babyANeed: true, babyBNeed: true },
  { category: 'diaper', title: '检查纸尿裤，湿了就换', babyANeed: true, babyBNeed: true },
  { category: 'sleep', title: '哄睡 — 放白噪音、拉窗帘', babyANeed: true, babyBNeed: true },
  { category: 'play', title: '陪玩 15 分钟 — 唱歌/读绘本/搭积木', babyANeed: true, babyBNeed: true },
  { category: 'bath', title: '洗澡（水温 38°C，先放冷水）', babyANeed: false, babyBNeed: false },
  { category: 'custom', title: '检查家里是否有足够的奶粉/纸尿裤', babyANeed: true, babyBNeed: true },
  { category: 'custom', title: '拍照发给妈妈 📸', babyANeed: true, babyBNeed: true },
]

export const CATEGORY_META: Record<TaskCategory, { emoji: string; label: string }> = {
  feeding: { emoji: '🍼', label: '喂养' },
  diaper: { emoji: '🧷', label: '换尿布' },
  sleep: { emoji: '😴', label: '哄睡' },
  bath: { emoji: '🛁', label: '洗澡' },
  play: { emoji: '🎮', label: '陪玩' },
  custom: { emoji: '📋', label: '其他' },
}

export const useDutyStore = defineStore('duty', () => {
  const _p = createPersistence<{ tasks: SOPTask[]; phrase: string }>(PERSIST_KEYS.duty)
  const _saved = _p.load()

  const tasks = ref<SOPTask[]>(_saved?.tasks ?? [])
  const mode = ref<TaskMode>('solo')
  const phrase = ref(_saved?.phrase ?? '')

  const totalCount = computed(() => tasks.value.length)
  const doneCount = computed(() => tasks.value.filter(t => t.done).length)
  const progress = computed(() => totalCount.value > 0 ? Math.round(doneCount.value / totalCount.value * 100) : 0)
  const isAllDone = computed(() => totalCount.value > 0 && doneCount.value === totalCount.value)
  const undoneCount = computed(() => totalCount.value - doneCount.value)

  function _save() {
    _p.save({ tasks: tasks.value, phrase: phrase.value })
  }

  function initDuty() {
    const now = Date.now()
    tasks.value = DEFAULT_SOP.map((t, i) => ({
      ...t,
      id: `sop-${now}-${i}`,
      done: false,
      note: '',
      createdAt: now,
    }))
    const phrases = [
      '你能搞定。老婆相信你，宝宝也相信你。',
      '不需要完美。喂了、换了、哄了，就是好爸爸。',
      '一个一个来。先喂饿的那个，另一个等一等没关系。',
      '记得吃饭。你也是需要能量的。',
      '拍照。妈妈想看到你们三个在一起。',
    ]
    phrase.value = phrases[Math.floor(Math.random() * phrases.length)]
    _save()
  }

  function toggleTask(id: string) {
    tasks.value = tasks.value.map(t => t.id === id ? { ...t, done: !t.done } : t)
    _save()
  }

  function toggleBabyNeed(id: string, baby: 'A' | 'B') {
    tasks.value = tasks.value.map(t => {
      if (t.id !== id) return t
      return baby === 'A' ? { ...t, babyANeed: !t.babyANeed } : { ...t, babyBNeed: !t.babyBNeed }
    })
    _save()
  }

  function updateNote(id: string, note: string) {
    tasks.value = tasks.value.map(t => t.id === id ? { ...t, note } : t)
    _save()
  }

  function resetDuty() { tasks.value = []; phrase.value = ''; _p.remove() }

  return {
    tasks, mode, phrase,
    totalCount, doneCount, progress, isAllDone, undoneCount,
    initDuty, toggleTask, toggleBabyNeed, updateNote, resetDuty,
  }
})
