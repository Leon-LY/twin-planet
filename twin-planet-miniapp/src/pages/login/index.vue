<template>
  <view class="login-page">
    <!-- 品牌区 -->
    <view class="brand-hero">
      <view class="brand-icon">🌺🌺</view>
      <text class="brand-name">并蒂星球</text>
      <text class="brand-slogan">并蒂而生，同步成长</text>
      <text class="brand-desc">中国首款双胞胎育儿伴侣</text>
    </view>

    <!-- 登录按钮 -->
    <view class="login-actions">
      <button class="btn-wechat" @click="doLogin" :loading="loading">
        <text class="btn-icon">💬</text>
        <text class="btn-text">微信一键登录</text>
      </button>

      <text class="privacy-hint">
        登录即同意《用户协议》和《隐私政策》
      </text>
    </view>

    <!-- 跳过登录（开发阶段） -->
    <view class="dev-skip" v-if="isDev">
      <text class="skip-link" @click="skipLogin">跳过登录（开发用）→</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const isDev = ref(true) // Phase 0 开发模式

async function doLogin() {
  loading.value = true
  try {
    await userStore.loginByWechat()
    navigateNext()
  } catch (err) {
    console.error('登录失败:', err)
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
  // 检查是否有家庭，有则跳首页，无则跳创建家庭
  uni.reLaunch({ url: '/pages/onboarding/family' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '欢迎' })
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #FFFBF5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 30px;
}

/* 品牌区 */
.brand-hero {
  text-align: center;
  margin-bottom: 60px;
}
.brand-icon {
  font-size: 56px;
  margin-bottom: 12px;
}
.brand-name {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #2D3748;
  letter-spacing: 4px;
}
.brand-slogan {
  display: block;
  font-size: 15px;
  color: #718096;
  margin-top: 8px;
  letter-spacing: 6px;
}
.brand-desc {
  display: block;
  font-size: 12px;
  color: #A0AEC0;
  margin-top: 12px;
}

/* 登录按钮 */
.login-actions {
  width: 100%;
  text-align: center;
}
.btn-wechat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  padding: 14px 0;
  background: linear-gradient(135deg, #48BB78, #38A169);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}
.btn-icon {
  font-size: 20px;
}
.btn-text {
  color: #FFFFFF;
}
.privacy-hint {
  display: block;
  margin-top: 14px;
  font-size: 11px;
  color: #CBD5E0;
}

/* 跳过登录 */
.dev-skip {
  margin-top: 30px;
}
.skip-link {
  font-size: 13px;
  color: #A0AEC0;
}
</style>
