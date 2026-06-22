<!-- 亲子任务 — 双宝家庭专属互动玩法 -->
<template>
  <view class="tasks-page journal-paper page-enter">
    <view class="page-header">
      <text class="page-icon">✨</text>
      <text class="page-title">亲子任务</text>
      <text class="page-subtitle">每一天的小陪伴，都是成长的大事</text>
    </view>

    <!-- 今日任务进度 -->
    <view class="progress-card journal-card reveal-1">
      <view class="pc-tape journal-tape tape-amber"></view>
      <view class="pc-row">
        <view class="pc-ring">
          <text class="pc-ring-num">{{ todayDone }}/{{ todayTotal }}</text>
        </view>
        <view class="pc-info">
          <text class="pc-title">今日陪伴</text>
          <text class="pc-desc">{{ todayDone === todayTotal ? '太棒了！双宝今天被满满的爱包围~' : `还差 ${todayTotal - todayDone} 项` }}</text>
        </view>
      </view>
    </view>

    <!-- 每日任务 -->
    <view class="section-label reveal-2">每日任务</view>
    <view class="task-list">
      <view
        v-for="task in dailyTasks"
        :key="task.id"
        class="task-item"
        :class="{ done: isDoneToday(task.id) }"
        @click="toggleTask(task.id)"
      >
        <view class="task-check" :class="{ checked: isDoneToday(task.id) }">
          <text v-if="isDoneToday(task.id)" class="task-check-icon">✓</text>
        </view>
        <text class="task-emoji">{{ task.emoji }}</text>
        <view class="task-body">
          <text class="task-label">{{ task.label }}</text>
          <text class="task-desc">{{ task.desc }}</text>
          <text class="task-streak" v-if="getStreak(task.id) > 0">连续 {{ getStreak(task.id) }} 天 🔥</text>
        </view>
      </view>
    </view>

    <!-- 本周任务 -->
    <view class="section-label reveal-3">本周任务</view>
    <view class="task-list">
      <view
        v-for="task in weeklyTasks"
        :key="task.id"
        class="task-item"
        :class="{ done: isDoneThisWeek(task.id) }"
        @click="toggleWeeklyTask(task.id)"
      >
        <view class="task-check" :class="{ checked: isDoneThisWeek(task.id) }">
          <text v-if="isDoneThisWeek(task.id)" class="task-check-icon">✓</text>
        </view>
        <text class="task-emoji">{{ task.emoji }}</text>
        <view class="task-body">
          <text class="task-label">{{ task.label }}</text>
          <text class="task-desc">{{ task.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 成就 -->
    <view class="section-label reveal-4">成就徽章</view>
    <view class="achievement-row">
      <view
        v-for="ach in achievements"
        :key="ach.label"
        class="ach-badge"
        :class="{ unlocked: ach.unlocked }"
      >
        <text class="ach-icon">{{ ach.icon }}</text>
        <text class="ach-label">{{ ach.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DAILY_TASKS, WEEKLY_TASKS, TASK_ACHIEVEMENTS } from '@/config/tasks'
import { trackPageView } from '@/utils/analytics'
import { createPersistence, PERSIST_KEYS } from '@/utils/persist'

interface TaskRecord {
  taskId: string
  completedAt: number
  streak?: number
}

const _p = createPersistence<TaskRecord[]>(PERSIST_KEYS.tasks)
const records = ref<TaskRecord[]>(_p.load() ?? [])

function saveRecords() {
  // 只保留最近 30 天的记录，避免无限增长
  const cutoff = Date.now() - 30 * 86400000
  const filtered = records.value.filter(r => r.completedAt >= cutoff)
  _p.save(filtered)
}

const dailyTasks = DAILY_TASKS
const weeklyTasks = WEEKLY_TASKS

const todayDone = computed(() => dailyTasks.filter(t => isDoneToday(t.id)).length)
const todayTotal = computed(() => dailyTasks.length)

function isSameDay(ts: number): boolean {
  const d = new Date(ts)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

/** 自然周判断：周一 00:00 为本周起始 */
function isSameWeek(ts: number): boolean {
  const now = new Date()
  const dayOfWeek = now.getDay() || 7  // 周日 getDay()=0，转为 7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - dayOfWeek + 1)  // 本周一 00:00
  return ts >= monday.getTime()
}

function isDoneToday(taskId: string): boolean {
  return records.value.some(r => r.taskId === taskId && isSameDay(r.completedAt))
}

function isDoneThisWeek(taskId: string): boolean {
  return records.value.some(r => r.taskId === taskId && isSameWeek(r.completedAt))
}

function getStreak(taskId: string): number {
  const rec = records.value.find(r => r.taskId === taskId && isSameDay(r.completedAt))
  return rec?.streak || 0
}

function toggleTask(taskId: string) {
  if (isDoneToday(taskId)) {
    // 取消完成
    records.value = records.value.filter(r => !(r.taskId === taskId && isSameDay(r.completedAt)))
  } else {
    // 完成任务，计算连续天数
    const prevRec = records.value
      .filter(r => r.taskId === taskId)
      .sort((a, b) => b.completedAt - a.completedAt)[0]
    const streak = prevRec && isSameDay(prevRec.completedAt + 86400000) ? (prevRec.streak || 0) + 1 : 1
    records.value.push({ taskId, completedAt: Date.now(), streak })
    uni.vibrateShort?.({ type: 'light' })
  }
  saveRecords()
}

function toggleWeeklyTask(taskId: string) {
  if (isDoneThisWeek(taskId)) {
    records.value = records.value.filter(r => !(r.taskId === taskId && isSameWeek(r.completedAt)))
  } else {
    records.value.push({ taskId, completedAt: Date.now() })
    uni.vibrateShort?.({ type: 'light' })
  }
  saveRecords()
}

// === 成就 ===
const achievements = computed(() => {
  return TASK_ACHIEVEMENTS.map(ach => {
    const unlocked = ach.taskIds.every(tid => {
      const recs = records.value.filter(r => r.taskId === tid)
      return recs.some(r => (r.streak || 0) >= ach.streak)
    })
    return { icon: ach.icon, label: ach.label, unlocked }
  })
})

onMounted(() => {
  uni.setNavigationBarTitle({ title: '亲子任务' })
  trackPageView('tasks')
})
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  padding: 32rpx 32rpx calc(120rpx + env(safe-area-inset-bottom));
}

/* === 进度卡 === */
.progress-card {
  position: relative;
  background: var(--cream);
  border-radius: var(--radius-md);
  padding: 32rpx 28rpx;
  margin-bottom: 32rpx;
  border: 1.5rpx solid var(--dot);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.pc-tape {
  position: absolute;
  top: -8rpx;
  left: 40rpx;
  width: 60rpx;
  height: 20rpx;
  transform: rotate(-3deg);
}
.pc-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.pc-ring {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid var(--amber);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--amber-lt);
  flex-shrink: 0;
}
.pc-ring-num {
  font-family: var(--font-journal);
  font-size: 28rpx;
  font-weight: 700;
  color: var(--amber);
}
.pc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.pc-title {
  font-family: var(--font-journal);
  font-size: var(--font-card);
  font-weight: 700;
  color: var(--ink);
}
.pc-desc {
  font-size: 24rpx;
  color: var(--ink-md);
}

/* === 区段标签 === */
.section-label {
  font-family: var(--font-journal);
  font-size: var(--font-body);
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

/* === 任务列表 === */
.task-list {
  margin-bottom: 36rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: var(--cream);
  border-radius: var(--radius-sm);
  border: 1.5rpx solid var(--dot);
  transition: all .15s var(--ease-bounce);
}
.task-item:active { transform: scale(0.98); }
.task-item.done {
  opacity: 0.6;
  background: rgba(79,174,110,0.05);
  border-color: rgba(79,174,110,0.3);
}
.task-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid var(--dot);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all .2s var(--ease-stamp);
}
.task-check.checked {
  background: var(--mint);
  border-color: var(--mint);
  animation: stampDown .4s var(--ease-stamp);
}
.task-check-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}
.task-emoji {
  font-size: 40rpx;
  flex-shrink: 0;
}
.task-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.task-label {
  font-family: var(--font-journal);
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink);
}
.task-desc {
  font-size: 22rpx;
  color: var(--ink-md);
}
.task-streak {
  font-size: 20rpx;
  color: var(--gold);
  font-family: var(--font-journal);
}

/* === 成就 === */
.achievement-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.ach-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 20rpx;
  background: var(--cream);
  border: 2rpx dashed var(--dot);
  border-radius: var(--radius-sm);
  opacity: 0.4;
  min-width: 120rpx;
}
.ach-badge.unlocked {
  opacity: 1;
  background: rgba(200,153,62,0.1);
  border: 2rpx solid var(--gold);
  border-style: solid;
  box-shadow: 0 0 12rpx rgba(200,153,62,0.2);
}
.ach-icon { font-size: 40rpx; }
.ach-label {
  font-size: 20rpx;
  font-family: var(--font-journal);
  font-weight: 600;
  color: var(--ink);
  text-align: center;
}
</style>
