<template>
  <view class="privacy-page">
    <text class="title">双宝记 · 用户协议与隐私政策</text>
    <text class="update-date">最后更新：2026年6月14日</text>

    <text class="section-title">一、信息收集</text>
    <text class="body">我们仅收集必要的信息来提供服务：</text>
    <text class="body">• 微信授权信息（昵称、头像）— 用于登录和身份识别</text>
    <text class="body">• 宝宝信息（名字、性别、出生日期）— 用于生长曲线和记录对比</text>
    <text class="body">• 喂养/睡眠/换尿布等日常记录数据 — 存储在您的手机本地和我们的服务器</text>
    <text class="body">• 语音交接录音 — 存储在手机本地和服务器，可手动删除</text>

    <text class="section-title">二、数据存储与安全</text>
    <text class="body">• 您的数据主要存储在手机本地，部分数据加密后同步到我们的服务器</text>
    <text class="body">• 语音和照片使用加密传输</text>
    <text class="body">• 我们不会将您的数据出售或分享给任何第三方</text>

    <text class="section-title">三、您的权利</text>
    <text class="body">• 您可以随时查看、导出或删除您的所有数据</text>
    <text class="body">• 删除账号后，服务器上的所有数据将在30天内永久清除</text>
    <text class="body">• 如有疑问，请联系：leon@twinplanet.cn</text>

    <!-- 🔧 实际操作按钮 -->
    <view class="action-section">
      <button class="action-btn export-btn" @click="handleExport">
        <text>📤 导出全部数据</text>
      </button>
      <button class="action-btn delete-btn" @click="handleDelete">
        <text>🗑️ 清除本地数据</text>
      </button>
      <button class="action-btn server-delete-btn" @click="handleDeleteServer" style="margin-top:12rpx">
        <text>☁️ 删除服务器数据</text>
      </button>
    </view>

    <text class="section-title">四、免责声明</text>
    <text class="body">双宝记是一款育儿辅助工具，不提供医疗建议。所有生长数据对比基于WHO儿童生长标准（2006），仅供参考。如对宝宝的健康有任何疑虑，请咨询专业儿科医生。</text>

    <text class="section-title">五、联系我们</text>
    <text class="body">如有任何问题或建议，请通过以下方式联系我们：</text>
    <text class="body">📧 邮箱：leon@twinplanet.cn</text>
    <text class="body">🌐 官网：https://twinplanet.cn</text>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { saveExportData } from '@/utils/syncService'
import { request } from '@/api/client'

onMounted(() => { uni.setNavigationBarTitle({ title: '隐私政策' }) })

async function handleExport() {
  uni.showModal({
    title: '导出数据',
    content: '将您的所有本地数据导出为JSON文件。数据仅保存在您的手机中。',
    success: async (res) => {
      if (!res.confirm) return
      try {
        const path = await saveExportData()
        uni.showToast({ title: '已导出到：' + path, icon: 'success', duration: 2000 })
      } catch {
        uni.showToast({ title: '导出遇到问题，稍后再试吧', icon: 'none' })
      }
    }
  })
}

async function handleDeleteServer() {
  uni.showModal({
    title: '🗑️ 删除服务器数据',
    content: '此操作将永久删除服务器上存储的所有记录。本地数据不受影响。此操作不可撤销。',
    confirmText: '确认删除',
    confirmColor: '#D4706B',
    success: async (res) => {
      if (!res.confirm) return
      try {
        const result = await request('/user/data', { method: 'DELETE' })
        if (result.success) {
          uni.showToast({ title: '服务器数据已删除', icon: 'success' })
        } else {
          uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' })
        }
      } catch {
        uni.showToast({ title: '网络连接失败，请稍后重试', icon: 'none' })
      }
    }
  })
}

function handleDelete() {
  uni.showModal({
    title: '⚠️ 清除本地数据',
    content: '此操作将删除手机上的所有记录、宝宝信息和设置。服务器数据不受影响，重新登录后可恢复。确定继续吗？',
    success: (res) => {
      if (!res.confirm) return
      try {
        uni.clearStorageSync()
        uni.showToast({ title: '本地数据已清除', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' })
        }, 1000)
      } catch {
        uni.showToast({ title: '清除遇到问题，稍后再试吧', icon: 'none' })
      }
    }
  })
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: var(--paper);
  padding: 40rpx 32rpx calc(64rpx + env(safe-area-inset-bottom));
  line-height: 1.8;
}
.title {
  display: block;
  font-family: var(--font-journal);
  font-size: var(--font-title);
  color: var(--ink);
  font-weight: 700;
  margin-bottom: 8rpx;
}
.update-date {
  display: block;
  font-size: var(--font-caption);
  color: var(--ink-md);
  margin-bottom: 40rpx;
}
.section-title {
  display: block;
  font-family: var(--font-journal);
  font-size: var(--font-card);
  color: var(--ink);
  font-weight: 700;
  margin-top: 36rpx;
  margin-bottom: 16rpx;
}
.body {
  display: block;
  font-size: var(--font-body);
  color: var(--ink-md);
  margin-bottom: 8rpx;
}

.action-section {
  margin-top: 32rpx;
  display: flex;
  gap: 16rpx;
}
.action-btn {
  flex: 1;
  padding: 22rpx 0;
  border-radius: var(--radius-md);
  font-size: var(--font-body);
  font-weight: 600;
  border: none;
}
.export-btn {
  background: var(--mint);
  color: #FFF;
}
.delete-btn {
  background: var(--cream);
  color: var(--twin-danger);
  border: 2rpx solid var(--twin-danger);
}
.server-delete-btn {
  background: var(--cream);
  color: var(--gold);
  border: 2rpx solid var(--gold);
}
</style>
