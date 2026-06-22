<template>
  <view class="login-page">
    <view class="brand-hero">
      <view class="brand-icon">🌺🌺</view>
      <text class="brand-name">双宝记</text>
      <text class="brand-slogan">两个小怪兽，一起长大 🪐</text>
      <text class="brand-desc">双胞胎的成长手帐</text>
    </view>

    <view class="login-actions">
      <button class="btn-wechat" hover-class="btn-press" @click="doLogin" :loading="loading">
        <text class="btn-text">微信一键登录</text>
      </button>

      <!-- 离线降级 — 登录失败后显示 -->
      <view class="offline-entry" v-if="showOffline">
        <view class="offline-divider"><text>登录遇到问题？</text></view>
        <button class="btn-offline" hover-class="btn-press" @click="doOffline">
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
  if (userStore.isLoggedIn) {
    // 已登录：按需跳转（家庭 → 宝宝 → 首页）
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

/* 清除原生 button ::after 边框 */
button::after { border: none; }

.login-actions { width: 100%; text-align: center; }

.btn-wechat {
  display: flex; align-items: center; justify-content: center;
  width: 100%; max-width: 640rpx; margin: 0 auto;
  padding: 28rpx 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 55%, rgba(0,0,0,0.05) 100%), #E07B3E;
  color: #FFF5E8; border: none; border-radius: 24rpx;
  font-size: 36rpx; font-weight: 600;
  box-shadow: 0 3rpx 0 rgba(191,90,40,0.5), 0 4rpx 8rpx rgba(0,0,0,0.06), 0 8rpx 20rpx rgba(224,123,62,0.2);
  transition: all 0.15s cubic-bezier(0.25,0.1,0.1,1);
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
  background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 55%, rgba(0,0,0,0.03) 100%), #FFF5E8;
  color: var(--twin-text);
  border: 2rpx solid var(--twin-border);
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 0 rgba(200,180,160,0.3), 0 4rpx 8rpx rgba(0,0,0,0.04), 0 6rpx 16rpx rgba(0,0,0,0.04);
  transition: all 0.15s cubic-bezier(0.25,0.1,0.1,1);
}
.offline-hint {
  display: block;
  font-size: 22rpx;
  color: var(--twin-text-secondary);
  margin-top: 12rpx;
}

/* 按钮按压态 — 下沉 + 内阴影 */
.btn-press {
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.1), 0 1rpx 0 rgba(0,0,0,0.15) !important;
  transform: translateY(2rpx);
}

.dev-skip { margin-top: 60rpx; }
.skip-link { font-size: 26rpx; color: var(--twin-warning); }
</style>
