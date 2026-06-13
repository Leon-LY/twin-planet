<template>
  <view class="login-page">
    <view class="brand-hero">
      <view class="brand-icon">🌺🌺</view>
      <text class="brand-name">并蒂星球</text>
      <text class="brand-slogan">并蒂而生，同步成长</text>
      <text class="brand-desc">中国首款双胞胎育儿伴侣</text>
    </view>

    <view class="login-actions">
      <button class="btn-wechat" @click="doLogin" :loading="loading">
        <text class="btn-text">微信一键登录</text>
      </button>

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
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)

// 开发环境检测：仅 development 模式显示跳过入口
const isDev = ref(typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true)
// 安全兜底：如果无法检测环境变量，强制隐藏
if (!isDev.value && typeof (import.meta as any)?.env?.DEV === 'undefined') {
  isDev.value = false
}

async function doLogin() {
  loading.value = true
  try {
    await userStore.loginByWechat()
    navigateNext()
  } catch {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function skipLogin() {
  userStore.isLoggedIn = true
  navigateNext()
}

function navigateNext() {
  uni.reLaunch({ url: '/pages/onboarding/family' })
}

function openPrivacy(type: string) {
  // TODO: Phase 1 部署后替换为实际链接
  uni.showToast({ title: '协议页面建设中', icon: 'none' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '欢迎' })
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
.brand-icon { font-size: 56px; margin-bottom: 12px; }
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

.dev-skip { margin-top: 60rpx; }
.skip-link { font-size: 26rpx; color: var(--twin-warning); }
</style>
