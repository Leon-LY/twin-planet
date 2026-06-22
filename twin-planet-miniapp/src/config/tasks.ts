/**
 * 亲子任务配置
 * 双宝家庭专属任务 — 增强亲子互动与用户粘性
 */

export interface TaskItem {
  id: string
  label: string
  emoji: string
  desc: string
  /** 任务周期 */
  period: 'daily' | 'weekly'
  /** 需要的连续天数（成就用） */
  streakTarget?: number
}

export const DAILY_TASKS: TaskItem[] = [
  { id: 'read_book', label: '给双宝读书', emoji: '📖', desc: '今天给两个小家伙读了绘本吗？', period: 'daily', streakTarget: 7 },
  { id: 'tummy_time', label: '趴趴时间', emoji: '🤸', desc: '让双宝趴一会儿，锻炼颈背肌肉', period: 'daily', streakTarget: 7 },
  { id: 'sunlight', label: '晒太阳', emoji: '☀️', desc: '带双宝晒晒太阳，补充维D', period: 'daily' },
  { id: 'massage', label: '婴儿抚触', emoji: '🤲', desc: '给双宝做一次抚触按摩', period: 'daily' },
  { id: 'talk_baby', label: '和双宝说话', emoji: '💬', desc: '多和宝宝说话，促进语言发育', period: 'daily' },
  { id: 'tummy_feed', label: '面对面喂奶', emoji: '🍼', desc: '喂奶时和宝宝有眼神交流', period: 'daily' },
]

export const WEEKLY_TASKS: TaskItem[] = [
  { id: 'photo_together', label: '拍双宝合照', emoji: '📸', desc: '记录两个小家伙本周的合照', period: 'weekly' },
  { id: 'measure_both', label: '量双宝身高体重', emoji: '📏', desc: '本周给两个宝宝量一次身高体重', period: 'weekly' },
  { id: 'outing', label: '带双宝出门', emoji: '🚗', desc: '带双宝出门走走，看看外面的世界', period: 'weekly' },
  { id: 'bath_both', label: '给双宝洗澡', emoji: '🛁', desc: '本周给两个宝宝洗一次澡', period: 'weekly' },
  { id: 'milestone_note', label: '记录一个新技能', emoji: '✨', desc: '在萌芽日记记下双宝的新技能', period: 'weekly' },
]

export interface TaskRecord {
  taskId: string
  completedAt: number
  /** 连续完成天数（仅 daily 任务） */
  streak?: number
}

/** 任务成就配置 */
export const TASK_ACHIEVEMENTS = [
  { taskIds: ['read_book'], streak: 7, icon: '📚', label: '阅读七日' },
  { taskIds: ['tummy_time'], streak: 7, icon: '💪', label: '趴趴达人' },
  { taskIds: ['read_book', 'tummy_time', 'sunlight', 'massage'], streak: 7, icon: '🌟', label: '全能守护' },
  { taskIds: ['photo_together'], streak: 4, icon: '📸', label: '月度合集' },
] as const
