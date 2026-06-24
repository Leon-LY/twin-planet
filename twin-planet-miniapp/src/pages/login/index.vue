<template>
  <JournalPage>
    <view class="brand-hero">
      <view class="brand-icon">🌺🌺</view>
      <text class="brand-name">双宝记</text>
      <text class="brand-slogan">两个小怪兽，一起长大 🪐</text>
      <text class="brand-desc">双胞胎的成长手帐</text>
    </view>

    <view class="login-actions">
      <JournalButton variant="primary" size="lg" :loading="loading" @click="doLogin">
        微信一键登录
      </JournalButton>

      <view class="offline-entry" v-if="showOffline">
        <JournalDivider variant="dashed" />
        <JournalButton variant="outline" @click="doOffline" style="margin-top:20rpx">
          📱 离线使用，数据存手机
        </JournalButton>
        <text class="offline-hint">无需网络，记录和贴纸功能正常使用</text>
      </view>

      <view class="privacy-row">
        <text class="privacy-text">登录即同意</text>
        <text class="privacy-link" @click="openPrivacy">《用户协议》</text>
        <text class="privacy-text">和</text>
        <text class="privacy-link" @click="openPrivacy">《隐私政策》</text>
      </view>
    </view>

    <view class="dev-skip" v-if="isDev">
      <text class="skip-link" @click="skipLogin">⚙️ 跳过登录（开发用）</text>
    </view>
  </JournalPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { JournalPage, JournalButton, JournalDivider } from '@/components/journal'

const userStore = useUserStore()
const loading = ref(false)
const showOffline = ref(false)

const isDev = ref(process.env.NODE_ENV === 'development')

async function doLogin() {
  loading.value = true
  showOffline.value = false
  try {
    await userStore.loginByWechat()
    navigateNext()
  } catch {
    uni.showToast({ title: '登录遇到问题，检查网络后再试试吧', icon: 'none' })
    showOffline.value = true
  } finally {
    loading.value = false
  }
}

function doOffline() {
  userStore.enableOfflineMode()
  navigateNext()
}

function skipLogin() {
  userStore.isLoggedIn = true
  navigateNext()
}

function navigateNext() {
  uni.reLaunch({ url: '/pages/onboarding/family' })
}

function openPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/index' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '欢迎' })
  if (userStore.isLoggedIn) {
    const fam = uni.getStorageSync('tp_family')
    if (!fam || !JSON.parse(fam)?.id) {
      uni.reLaunch({ url: '/pages/onboarding/family' })
      return
    }
    try {
      const bab = uni.getStorageSync('tp_babies')
      const babies = bab ? JSON.parse(bab) : []
      if (!Array.isArray(babies) || babies.length < 2) {
        uni.reLaunch({ url: '/pages/onboarding/babies' })
        return
      }
    } catch (_) {}
    uni.reLaunch({ url: '/pages/index/index' })
  }
})
</script>

<style scoped>
.brand-hero { text-align: center; margin-bottom: 80rpx; }
.brand-icon { font-size: 56rpx; margin-bottom: 12rpx; }
.brand-name { display: block; font-size: 64rpx; font-weight: 700; color: var(--ink); letter-spacing: 4px; }
.brand-slogan { display: block; font-size: 28rpx; color: var(--ink-lt); margin-top: 16rpx; letter-spacing: 6px; }
.brand-desc { display: block; font-size: 24rpx; color: var(--ink-md); margin-top: 24rpx; }

.login-actions { width: 100%; max-width: 640rpx; margin: 0 auto; text-align: center; }

.privacy-row { margin-top: 28rpx; }
.privacy-text { font-size: 22rpx; color: var(--ink-md); }
.privacy-link { font-size: 22rpx; color: var(--amber); }

.offline-entry { margin-top: 32rpx; text-align: center; }
.offline-hint { display: block; font-size: 22rpx; color: var(--ink-md); margin-top: 12rpx; }

.dev-skip { margin-top: 40rpx; }
.skip-link { font-size: 26rpx; color: var(--gold); }
</style>
