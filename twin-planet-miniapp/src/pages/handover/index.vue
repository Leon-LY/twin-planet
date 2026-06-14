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
        <text class="recorder-hint" v-else>轻触开始录音</text>
        <view class="recorder-actions">
          <view v-if="!isRecording" class="btn-record" @click="startRecord"><text>开始录音</text></view>
          <view v-else class="recorder-btns">
            <view class="btn-cancel" @click="cancelRecord"><text>取消</text></view>
            <view class="btn-done" @click="finishRecord"><text>完成</text></view>
          </view>
        </view>
      </view>
    </view>

    <view class="messages-section" v-if="messages.length">
      <text class="section-label">交接记录</text>
      <view v-for="msg in messages" :key="msg.id" class="message-card" :class="{ unread: !msg.read, playing: playingId===msg.id }">
        <view class="msg-left">
          <view class="msg-avatar">{{ msg.authorEmoji }}</view>
          <view class="msg-body">
            <text class="msg-author">{{ msg.author }}</text>
            <text class="msg-duration">{{ formatDuration(msg.durationSec) }}</text>
            <text class="msg-time">{{ timeAgo(msg.createdAt) }}</text>
          </view>
        </view>
        <view class="msg-right">
          <view class="play-btn" :class="{ playing: playingId===msg.id }" @click="playVoice(msg)">
            <text>{{ playingId===msg.id ? '⏸' : '▶' }}</text>
          </view>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { timeAgo, formatDuration } from '@/utils/format'
import { useHaptic } from '@/composables/useHaptic'

interface VoiceMessage {
  id: string; author: string; authorEmoji: string; durationSec: number
  read: boolean; createdAt: number; localPath: string
}

const STORAGE_KEY = 'tp_handover_messages'
const haptic = useHaptic()

const isRecording = ref(false)
const recordSeconds = ref(0)
const playingId = ref('')
const messages = ref<VoiceMessage[]>([])
let timerHandle: ReturnType<typeof setInterval> | null = null
let recorder: ReturnType<typeof uni.getRecorderManager> | null = null
let audioCtx: ReturnType<typeof uni.createInnerAudioContext> | null = null
let tempFilePath = ''

// 加载持久化消息
function loadMessages() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) messages.value = JSON.parse(raw)
  } catch { messages.value = [] }
}
function saveMessages() {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(messages.value.slice(-50)))
}

function startRecord() {
  tempFilePath = ''
  isRecording.value = true; recordSeconds.value = 0
  timerHandle = setInterval(() => { recordSeconds.value++ }, 1000)

  // #ifdef MP-WEIXIN
  recorder = uni.getRecorderManager()
  recorder.onStop((res) => { tempFilePath = res.tempFilePath })
  recorder.onError(() => {
    uni.showToast({ title: '录音失败，请授权麦克风', icon: 'none' })
    cancelRecord()
  })
  recorder.start({ format: 'mp3', duration: 120000 }) // max 2分钟
  haptic.heartbeatStart()
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请使用微信小程序录音', icon: 'none' })
  cancelRecord()
  // #endif
}

function cancelRecord() {
  isRecording.value = false
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  recordSeconds.value = 0
  haptic.heartbeatStop()
  // #ifdef MP-WEIXIN
  if (recorder) {
    try { recorder.stop() } catch (_) {}
    recorder = null
  }
  // #endif
}

function finishRecord() {
  isRecording.value = false
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  const duration = recordSeconds.value; recordSeconds.value = 0
  haptic.heartbeatStop(); haptic.thump()

  // #ifdef MP-WEIXIN
  if (recorder) {
    recorder.onStop((res) => {
      tempFilePath = res.tempFilePath
      if (duration < 2) {
        uni.showToast({ title: '录音太短，请重录', icon: 'none' }); return
      }
      messages.value = [{
        id: `voice-${Date.now()}`, author: '我', authorEmoji: '👤',
        durationSec: duration, read: false,
        createdAt: Date.now(), localPath: tempFilePath,
      }, ...messages.value]
      saveMessages()
      uni.showToast({ title: '✅ 已保存', icon: 'success' })
    })
    recorder.stop()
    recorder = null
  }
  // #endif

  // #ifndef MP-WEIXIN
  if (duration < 2) {
    uni.showToast({ title: '录音太短，请重录', icon: 'none' }); return
  }
  messages.value = [{
    id: `voice-${Date.now()}`, author: '我', authorEmoji: '👤',
    durationSec: duration, read: false,
    createdAt: Date.now(), localPath: '',
  }, ...messages.value]
  saveMessages()
  uni.showToast({ title: '✅ 已保存', icon: 'success' })
  // #endif
}

function playVoice(msg: VoiceMessage) {
  if (playingId.value === msg.id) {
    // 停止播放
    if (audioCtx) { audioCtx.stop(); audioCtx = null }
    playingId.value = ''; return
  }
  // 停止之前的播放
  if (audioCtx) { audioCtx.stop(); audioCtx = null }
  msg.read = true; saveMessages()
  playingId.value = msg.id

  // #ifdef MP-WEIXIN
  if (msg.localPath) {
    audioCtx = uni.createInnerAudioContext()
    audioCtx.src = msg.localPath
    audioCtx.onEnded(() => { playingId.value = ''; audioCtx = null })
    audioCtx.onError(() => {
      uni.showToast({ title: '播放失败', icon: 'none' })
      playingId.value = ''; audioCtx = null
    })
    audioCtx.play()
  } else {
    uni.showToast({ title: '该消息无录音文件', icon: 'none' })
    playingId.value = ''
  }
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({ title: '播放需微信小程序环境', icon: 'none' })
  playingId.value = ''
  // #endif
}

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

onUnmounted(() => {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  haptic.heartbeatStop()
  if (audioCtx) { audioCtx.stop(); audioCtx = null }
  // #ifdef MP-WEIXIN
  if (recorder) { try { recorder.stop() } catch (_) {} }
  // #endif
})

onMounted(() => {
  uni.setNavigationBarTitle({ title: '语音便签' })
  loadMessages()
})
</script>

<style scoped>
.handover-page { min-height: 100vh; background: var(--paper); padding: 40rpx 28rpx calc(80rpx + env(safe-area-inset-bottom)); }
.section-header { text-align: center; margin-bottom: 36rpx; }
.section-icon { font-size: 40px; }
.section-title { display: block; font-family: var(--font-journal); font-size: var(--font-title); color: var(--ink); margin: 12rpx 0; }
.section-desc { font-size: var(--font-body); color: var(--ink-md); }

.recorder-section { margin-bottom: 40rpx; }
.recorder-card {
  background: var(--cream); border-radius: var(--radius-lg); padding: 48rpx 32rpx;
  text-align: center; border: 4rpx solid var(--dot); transition: border-color .3s var(--ease-soft);
}
.recorder-card.recording { border-color: var(--rose); }
.recorder-visual { height: 160rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 24rpx; }
.recorder-icon { font-size: 64rpx; }
.audio-waves { display: flex; align-items: center; gap: 8rpx; }
.wave-bar { width: 8rpx; height: 40rpx; background: var(--rose); border-radius: 4rpx; animation: wave 0.6s ease-in-out infinite alternate; }
@keyframes wave { from { height: 16rpx; } to { height: 80rpx; } }
.recorder-time { font-size: 56rpx; font-weight: 700; color: var(--ink); margin-bottom: 16rpx; font-family: var(--font-journal); letter-spacing: 4rpx; }
.recorder-hint { font-size: var(--font-body); color: var(--ink-md); margin-bottom: 32rpx; }
.btn-record { display: inline-flex; padding: 24rpx 64rpx; background: var(--amber); border-radius: var(--radius-full); color: #FFF; font-size: var(--font-card); font-weight: 600; transition: transform .15s var(--ease-bounce); }
.btn-record:active { transform: scale(.94); }
.recorder-btns { display: flex; justify-content: center; gap: 24rpx; }
.btn-cancel { padding: 20rpx 40rpx; background: var(--dot); border-radius: var(--radius-full); font-size: var(--font-body); color: var(--ink-md); }
.btn-cancel:active { opacity: .7; }
.btn-done { padding: 20rpx 40rpx; background: var(--mint); border-radius: var(--radius-full); color: #FFF; font-size: var(--font-body); font-weight: 600; }
.btn-done:active { opacity: .7; }

.section-label { display: block; font-family: var(--font-journal); font-size: var(--font-card); font-weight: 600; color: var(--ink); margin-bottom: 16rpx; }
.message-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24rpx; background: var(--cream); border-radius: var(--radius-md);
  margin-bottom: 10rpx; border-left: 6rpx solid var(--dot); transition: all .2s var(--ease-soft);
}
.message-card.unread { border-left-color: var(--amber); }
.message-card.playing { border-left-color: var(--mint); background: var(--mint-lt); }
.msg-left { display: flex; align-items: center; gap: 16rpx; flex: 1; }
.msg-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--amber-lt); display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.msg-body { display: flex; flex-direction: column; }
.msg-author { font-size: var(--font-body); font-weight: 600; color: var(--ink); }
.msg-duration { font-size: var(--font-caption); color: var(--ink-lt); }
.msg-time { font-size: var(--font-caption); color: var(--ink-md); }
.msg-right { display: flex; align-items: center; gap: 12rpx; }
.play-btn { width: 64rpx; height: 64rpx; border-radius: 50%; background: var(--amber-lt); display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: var(--amber); transition: transform .15s var(--ease-bounce); }
.play-btn:active { transform: scale(.9); }
.play-btn.playing { background: var(--mint); color: #FFF; }
.unread-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: var(--amber); }

.empty-state { text-align: center; padding: 80rpx 32rpx; }
.empty-emoji { font-size: 48px; }
.empty-title { display: block; font-family: var(--font-journal); font-size: var(--font-card); font-weight: 600; color: var(--ink); margin: 16rpx 0 8rpx; }
.empty-desc { font-size: var(--font-body); color: var(--ink-md); }
</style>
