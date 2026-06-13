<template>
  <view class="handover-page">
    <view class="section-header">
      <text class="section-icon">🎙️</text>
      <text class="section-title">交接班语音便签</text>
      <text class="section-desc">录一段话，换班的家人打开就能听</text>
    </view>

    <view class="recorder-section">
      <view class="recorder-card" :class="{ recording: isRecording }">
        <view class="recorder-visual">
          <view class="audio-waves" v-if="isRecording">
            <view class="wave-bar" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.1 + 's' }" />
          </view>
          <text class="recorder-icon" v-else>🎤</text>
        </view>
        <text class="recorder-time" v-if="isRecording">{{ formatTime(recordSeconds) }}</text>
        <text class="recorder-hint" v-else>点击开始录音</text>
        <view class="recorder-actions">
          <view v-if="!isRecording" class="btn-record" @click="startRecord"><text>开始录音</text></view>
          <view v-else class="recorder-btns">
            <view class="btn-cancel" @click="cancelRecord"><text>取消</text></view>
            <view class="btn-done" @click="finishRecord"><text>完成录音</text></view>
          </view>
        </view>
      </view>
    </view>

    <view class="messages-section" v-if="messages.length">
      <text class="section-label">交接记录</text>
      <view v-for="msg in messages" :key="msg.id" class="message-card" :class="{ unread: !msg.read }">
        <view class="msg-left">
          <view class="msg-avatar">👤</view>
          <view class="msg-body">
            <text class="msg-author">{{ msg.author }}</text>
            <text class="msg-duration">{{ formatDuration(msg.durationSec) }}</text>
            <text class="msg-time">{{ timeAgo(msg.createdAt) }}</text>
          </view>
        </view>
        <view class="msg-right">
          <view class="play-btn" @click="playVoice(msg)"><text>▶</text></view>
          <view class="unread-dot" v-if="!msg.read" />
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-emoji">📻</text>
      <text class="empty-title">还没有交接记录</text>
      <text class="empty-desc">录一段话留给换班的家人吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface VoiceMessage {
  id: string; author: string; durationSec: number
  read: boolean; createdAt: number; localPath?: string
}

const isRecording = ref(false)
const recordSeconds = ref(0)
const messages = ref<VoiceMessage[]>([])
let timerHandle: ReturnType<typeof setInterval> | null = null

function startRecord() {
  isRecording.value = true; recordSeconds.value = 0
  timerHandle = setInterval(() => { recordSeconds.value++ }, 1000)
  uni.showToast({ title: '录音功能需真机调试', icon: 'none' })
}
function cancelRecord() {
  isRecording.value = false
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  recordSeconds.value = 0
}
function finishRecord() {
  isRecording.value = false
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  const duration = recordSeconds.value; recordSeconds.value = 0
  if (duration < 2) {
    uni.showToast({ title: '录音太短，请重新录制', icon: 'none' }); return
  }
  messages.value = [{
    id: `voice-${Date.now()}`, author: '我', durationSec: duration,
    read: false, createdAt: Date.now(), localPath: '',
  }, ...messages.value]
  uni.showToast({ title: '✅ 语音便签已保存', icon: 'success' })
}
function playVoice(msg: VoiceMessage) {
  msg.read = true
  uni.showToast({ title: '播放功能需真机调试', icon: 'none' })
}
function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
function formatDuration(s: number) {
  return s < 60 ? `${s}秒` : `${Math.floor(s / 60)}分${s % 60}秒`
}
function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 60000)
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  return `${Math.floor(diff / 60)}小时前`
}

onUnmounted(() => {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
})
onMounted(() => { uni.setNavigationBarTitle({ title: '交接班语音' }) })
</script>

<style scoped>
.handover-page { min-height: 100vh; background: var(--twin-bg); padding: 32rpx 32rpx 80rpx; }
.section-header { text-align: center; margin-bottom: 32rpx; }
.section-icon { font-size: 40px; }
.section-title { display: block; font-size: 44rpx; font-weight: 700; color: var(--twin-text); margin: 12rpx 0; }
.section-desc { font-size: 26rpx; color: var(--twin-text-secondary); }

.recorder-section { margin-bottom: 40rpx; }
.recorder-card {
  background: var(--twin-card-bg); border-radius: 28rpx; padding: 48rpx 32rpx;
  text-align: center; border: 4rpx solid var(--twin-border);
}
.recorder-card.recording { border-color: var(--twin-baby-b); }
.recorder-visual { height: 160rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 24rpx; }
.recorder-icon { font-size: 64rpx; }
.audio-waves { display: flex; align-items: center; gap: 8rpx; }
.wave-bar { width: 8rpx; height: 40rpx; background: var(--twin-baby-b); border-radius: 4rpx; animation: wave 0.6s ease-in-out infinite alternate; }
@keyframes wave { from { height: 16rpx; } to { height: 80rpx; } }
.recorder-time { font-size: 56rpx; font-weight: 700; color: var(--twin-text); margin-bottom: 16rpx; font-variant-numeric: tabular-nums; }
.recorder-hint { font-size: 28rpx; color: var(--twin-text-secondary); margin-bottom: 32rpx; }
.btn-record { display: inline-flex; padding: 24rpx 64rpx; background: var(--twin-baby-b); border-radius: 60rpx; color: var(--twin-card-bg); font-size: 32rpx; font-weight: 600; }
.recorder-btns { display: flex; justify-content: center; gap: 24rpx; }
.btn-cancel { padding: 20rpx 40rpx; background: var(--twin-border); border-radius: 40rpx; font-size: 28rpx; color: var(--twin-text-tertiary); }
.btn-done { padding: 20rpx 40rpx; background: var(--twin-accent); border-radius: 40rpx; color: var(--twin-card-bg); font-size: 28rpx; font-weight: 600; }

.section-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--twin-text); margin-bottom: 16rpx; }
.message-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24rpx; background: var(--twin-card-bg); border-radius: 16rpx;
  margin-bottom: 8rpx; border-left: 6rpx solid var(--twin-border);
}
.message-card.unread { border-left-color: var(--twin-baby-b); background: var(--twin-bg); }
.msg-left { display: flex; align-items: center; gap: 16rpx; }
.msg-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--twin-border); display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.msg-body { display: flex; flex-direction: column; }
.msg-author { font-size: 26rpx; font-weight: 600; color: var(--twin-text); }
.msg-duration { font-size: 22rpx; color: var(--twin-text-tertiary); }
.msg-time { font-size: 20rpx; color: var(--twin-text-secondary); }
.msg-right { display: flex; align-items: center; gap: 12rpx; }
.play-btn { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--twin-baby-a-light); display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: var(--twin-baby-a); }
.unread-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: var(--twin-baby-b); }

.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48px; }
.empty-title { display: block; font-size: 32rpx; font-weight: 600; color: var(--twin-text); margin: 16rpx 0 8rpx; }
.empty-desc { font-size: 26rpx; color: var(--twin-text-secondary); }
</style>
