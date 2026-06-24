<template>
  <JournalPage>
    <JournalPageHeader title="用户协议与隐私政策" subtitle="最后更新：2026年6月14日" />

    <JournalCard variant="paper" style="margin-bottom: 28rpx">
      <text class="section-title">一、信息收集</text>
      <text class="body">我们仅收集必要的信息来提供服务：</text>
      <text class="body">• 微信授权信息（昵称、头像）— 用于登录和身份识别</text>
      <text class="body">• 宝宝信息（名字、性别、出生日期）— 用于生长曲线和记录对比</text>
      <text class="body">• 喂养/睡眠/换尿布等日常记录数据 — 存储在您的手机本地和我们的服务器</text>
      <text class="body">• 语音交接录音 — 存储在手机本地和服务器，可手动删除</text>
    </JournalCard>

    <JournalCard variant="paper" style="margin-bottom: 28rpx">
      <text class="section-title">二、数据存储与安全</text>
      <text class="body">• 您的数据主要存储在手机本地，部分数据加密后同步到我们的服务器</text>
      <text class="body">• 语音和照片使用加密传输</text>
      <text class="body">• 我们不会将您的数据出售或分享给任何第三方</text>
    </JournalCard>

    <JournalCard variant="paper" style="margin-bottom: 28rpx">
      <text class="section-title">三、您的权利</text>
      <text class="body">• 您可以随时查看、导出或删除您的所有数据</text>
      <text class="body">• 删除账号后，服务器上的所有数据将在30天内永久清除</text>
      <text class="body">• 如有疑问，请联系：leon@twinplanet.cn</text>
    </JournalCard>

    <!-- 实际操作按钮 -->
    <view class="action-section">
      <JournalButton variant="outline" icon="icon-share" @click="handleExport">
        导出全部数据
      </JournalButton>
      <JournalButton variant="danger" @click="handleDelete" style="margin-top:20rpx">
        🗑️ 清除本地数据
      </JournalButton>
    </view>

    <JournalCard variant="paper" style="margin-top: 28rpx; margin-bottom: 28rpx">
      <text class="section-title">四、免责声明</text>
      <text class="body">双宝记是一款育儿辅助工具，不提供医疗建议。所有生长数据对比基于WHO儿童生长标准（2006），仅供参考。如对宝宝的健康有任何疑虑，请咨询专业儿科医生。</text>
    </JournalCard>

    <JournalCard variant="paper">
      <text class="section-title">五、联系我们</text>
      <text class="body">如有任何问题或建议，请通过以下方式联系我们：</text>
      <text class="body">📧 邮箱：leon@twinplanet.cn</text>
      <text class="body">🌐 官网：https://twinplanet.cn</text>
    </JournalCard>
  </JournalPage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { saveExportData } from '@/utils/syncService'
import JournalPage from '@/components/journal/JournalPage.vue'
import JournalPageHeader from '@/components/journal/JournalPageHeader.vue'
import JournalCard from '@/components/journal/JournalCard.vue'
import JournalButton from '@/components/journal/JournalButton.vue'

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
    },
  })
}

async function handleDelete() {
  uni.showModal({
    title: '⚠️ 清除数据',
    content: '将清除所有本地数据（记录、贴纸、宝宝信息等）。已同步到服务器的数据需要单独联系我们删除。确定继续吗？',
    confirmText: '确定清除',
    confirmColor: '#D4706B',
    success: async (res) => {
      if (!res.confirm) return
      try {
        uni.clearStorageSync()
        uni.showToast({ title: '数据已清除', icon: 'success' })
        setTimeout(() => { uni.reLaunch({ url: '/pages/login/index' }) }, 800)
      } catch {
        uni.showToast({ title: '清除失败', icon: 'none' })
      }
    },
  })
}
</script>

<style scoped>
.section-title {
  display: block;
  font-family: var(--font-journal);
  font-size: var(--font-card);
  color: var(--ink);
  margin-bottom: 16rpx;
  font-weight: 600;
}
.body {
  display: block;
  font-size: var(--font-body);
  color: var(--ink-md);
  line-height: 1.8;
  margin-bottom: 6rpx;
}
.action-section {
  padding: 8rpx 0;
}
</style>
