<template>
  <view class="login-page">
    <view class="brand-hero">
      <view class="brand-icon">🌺🌺</view>
      <text class="brand-name">双宝星球</text>
      <text class="brand-slogan">两个小怪兽，一起长大 🪐</text>
      <text class="brand-desc">双胞胎的快乐星球</text>
    </view>

    <view class="login-actions">
      <button class="btn-wechat" @click="doLogin" :loading="loading">
        <text class="btn-text">微信一键登录</text>
      </button>

      <!-- 离线降级 — 登录失败后显示 -->
      <view class="offline-entry" v-if="showOffline">
        <view class="offline-divider"><text>登录遇到问题？</text></view>
        <button class="btn-offline" @click="doOffline">
          <text>📱 离线使用，数据存手机</text>
        </button>
        <text class="offline-hint">无需网络，记录和贴纸功能正常使用</text>
      </view>

      <view class="privacy-row">
        <text class="privacy-text">登录即同意</text>
        <text class="privacy-link" @click="openPrivacy('terms')">《用户协议》</text>
        <text class="privacy-text">和</text>
        <text class="privacy-link" @click="openPrivacy('privacy')">《隐私政策》</text>
      </view>
    </view>

    <!-- 开发环境跳过登录 -->
    <view class="dev-skip" v-if="isDev">
      <text class="skip-link" @click="skipLogin">⚙️ 跳过登录（开发用）</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const showOffline = ref(false)

// 开发环境检测
const isDev = ref(process.env.NODE_ENV === 'development')

async function doLogin() {
  loading.value = true
  showOffline.value = false
  try {
    await userStore.loginByWechat()
    navigateNext()
  } catch {
    uni.showToast({ title: '登录遇到问题，检查网络后再试试吧', icon: 'none' })
    // 显示离线降级入口
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

function openPrivacy(type: string) {
  uni.navigateTo({ url: '/pages/privacy/index' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '欢迎' })
  // 已登录且有家庭 → 直接进首页
  if (userStore.isLoggedIn && uni.getStorageSync('tp_family')) {
    uni.reLaunch({ url: '/pages/index/index' })
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--twin-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60rpx 32rpx;
}

.brand-hero { text-align: center; margin-bottom: 120rpx; }
.brand-icon { font-size: 56rpx; margin-bottom: 12rpx; }
.brand-name { display: block; font-size: 64rpx; font-weight: 700; color: var(--twin-text); letter-spacing: 4px; }
.brand-slogan { display: block; font-size: 28rpx; color: var(--twin-text-tertiary); margin-top: 16rpx; letter-spacing: 6px; }
.brand-desc { display: block; font-size: 24rpx; color: var(--twin-text-secondary); margin-top: 24rpx; }

.login-actions { width: 100%; text-align: center; }
.btn-wechat {
  display: flex; align-items: center; justify-content: center;
  width: 100%; max-width: 640rpx; margin: 0 auto;
  padding: 28rpx 0;
  background: var(--twin-baby-a);
  color: var(--twin-card-bg); border: none; border-radius: 24rpx;
  font-size: 36rpx; font-weight: 600;
}

.privacy-row { margin-top: 28rpx; }
.privacy-text { font-size: 22rpx; color: var(--twin-text-secondary); }
.privacy-link { font-size: 22rpx; color: var(--twin-baby-a); }

.offline-entry { margin-top: 48rpx; text-align: center; }
.offline-divider { margin-bottom: 20rpx; }
.offline-divider text { font-size: 24rpx; color: var(--twin-text-secondary); }
.btn-offline {
  display: flex; align-items: center; justify-content: center;
  width: 100%; max-width: 640rpx; margin: 0 auto;
  padding: 24rpx 0;
  background: var(--twin-card-bg);
  color: var(--twin-text);
  border: 2rpx solid var(--twin-border);
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 500;
}
.offline-hint {
  display: block;
  font-size: 22rpx;
  color: var(--twin-text-secondary);
  margin-top: 12rpx;
}

.dev-skip { margin-top: 60rpx; }
.skip-link { font-size: 26rpx; color: var(--twin-warning); }
</style>
