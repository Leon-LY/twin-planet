<template>
  <view class="onboard-page">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-step active"><text>1</text></view>
      <view class="progress-line active" />
      <view class="progress-step"><text>2</text></view>
      <view class="progress-line" />
      <view class="progress-step"><text>3</text></view>
    </view>

    <!-- 标题 -->
    <view class="section-header">
      <text class="section-icon">🏠</text>
      <text class="section-title">创建你的家庭</text>
      <text class="section-desc">给你们的双胞胎小天地取个名字吧</text>
    </view>

    <!-- 家庭名 -->
    <view class="form-group">
      <text class="form-label">家庭名称</text>
      <input
        class="form-input"
        v-model="familyName"
        placeholder="例如：大宝小宝的家、安宁安然的家"
        placeholder-style="color: var(--twin-text-muted); font-size: 28rpx;"
        maxlength="20"
      />
      <text class="form-hint">{{ familyName.length }}/20</text>
    </view>

    <!-- 角色选择 -->
    <view class="form-group">
      <text class="form-label">我是</text>
      <view class="role-grid">
        <view
          v-for="role in roles"
          :key="role.value"
          class="role-card"
          :class="{ selected: selectedRole === role.value }"
          hover-class="role-press"
          @click="selectRole(role.value)"
        >
          <text class="role-icon">{{ role.icon }}</text>
          <text class="role-name">{{ role.label }}</text>
        </view>
      </view>
    </view>

    <!-- 继续 -->
    <view class="bottom-action">
      <button
        class="btn-primary"
        hover-class="btn-press"
        :disabled="!canProceed"
        @click="goNext"
      >
        下一步 · 添加宝宝
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import { useUserStore, type UserProfile } from '@/stores/user'

const familyStore = useFamilyStore()
const userStore = useUserStore()

const familyName = ref('')
const selectedRole = ref<UserProfile['role']>('mom')

const roles = [
  { value: 'mom' as const, icon: '👩‍👧‍👦', label: '妈妈' },
  { value: 'dad' as const, icon: '👨‍👧‍👦', label: '爸爸' },
  { value: 'grandma' as const, icon: '👵', label: '奶奶/外婆' },
  { value: 'grandpa' as const, icon: '👴', label: '爷爷/外公' },
  { value: 'nanny' as const, icon: '🧑‍🍼', label: '育儿嫂' },
  { value: 'other' as const, icon: '👤', label: '其他家人' },
]

const canProceed = computed(() => familyName.value.trim().length >= 2)

function selectRole(role: UserProfile['role']) {
  selectedRole.value = role
}

function goNext() {
  familyStore.createGroup(familyName.value.trim())
  userStore.setRole(selectedRole.value) // 内部自动处理奶奶大字模式

  uni.navigateTo({ url: '/pages/onboarding/babies' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '创建家庭' })
})
</script>

<style scoped>
.onboard-page {
  min-height: 100vh;
  background: var(--twin-bg);
  padding: 48rpx 32rpx 40px;
}

/* 清除原生 button ::after 边框 */
button::after { border: none; }

/* 进度条 */
.progress-bar {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 56rpx;
}
.progress-step {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: var(--twin-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: var(--twin-text-secondary); font-weight: 600;
}
.progress-step.active { background: var(--twin-baby-a); color: var(--twin-card-bg); }
.progress-line { flex: 1; max-width: 120rpx; height: 4rpx; background: var(--twin-border); }
.progress-line.active { background: var(--twin-baby-a); }

/* 标题 */
.section-header { text-align: center; margin-bottom: 48rpx; }
.section-icon { font-size: 36rpx; }
.section-title { display: block; font-size: 44rpx; font-weight: 700; color: var(--twin-text); margin-top: 16rpx; }
.section-desc { display: block; font-size: 26rpx; color: var(--twin-text-secondary); margin-top: 12rpx; }

/* 表单 */
.form-group { margin-bottom: 40rpx; }
.form-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--ink); margin-bottom: 16rpx; }
.form-input {
  width: 100%; padding: 28rpx 32rpx;
  background: linear-gradient(180deg, rgba(0,0,0,0.015) 0%, transparent 8%), #FFF5E8;
  border: 4rpx solid var(--twin-border);
  border-radius: 24rpx; font-size: 32rpx; color: var(--twin-text);
  box-sizing: border-box;
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.04), inset 0 0 0 1rpx rgba(0,0,0,0.02), 0 1rpx 0 rgba(255,255,255,0.6);
}
.form-hint { display: block; text-align: right; font-size: 22rpx; color: var(--twin-text-muted); margin-top: 8rpx; }

/* 角色选择 */
.role-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
.role-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32rpx 16rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), #FFF5E8;
  border: 4rpx solid var(--twin-border);
  border-radius: 24rpx; text-align: center; gap: 12rpx;
  box-shadow: 0 2rpx 0 rgba(200,180,160,0.25), 0 4rpx 8rpx rgba(0,0,0,0.04), 0 6rpx 16rpx rgba(0,0,0,0.03);
  transition: all 0.15s cubic-bezier(0.25,0.1,0.1,1);
  position: relative;
  overflow: hidden;
}
/* 角色卡片表面高光 */
.role-card::after {
  content: '';
  position: absolute;
  top: 6rpx; left: 15%; right: 15%; height: 35%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.role-card.selected {
  border-color: var(--twin-baby-a);
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), rgba(224,123,62,0.08);
  box-shadow: 0 2rpx 0 rgba(191,90,40,0.3), 0 4rpx 8rpx rgba(0,0,0,0.04), 0 6rpx 16rpx rgba(224,123,62,0.12);
}
.role-icon { font-size: 28rpx; }
.role-name { font-size: 26rpx; font-weight: 500; color: var(--ink); }

/* 角色卡片按压态 */
.role-press {
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.08), 0 1rpx 0 rgba(200,180,160,0.2) !important;
  transform: translateY(2rpx);
}

/* 底部 */
.bottom-action {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 32rpx 32rpx calc(64rpx + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, var(--twin-bg) 30%);
}
.btn-primary {
  width: 100%; padding: 28rpx 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 55%, rgba(0,0,0,0.05) 100%), #E07B3E;
  color: #FFF5E8; border: none; border-radius: 24rpx;
  font-size: 36rpx; font-weight: 600;
  box-shadow: 0 3rpx 0 rgba(191,90,40,0.5), 0 4rpx 8rpx rgba(0,0,0,0.06), 0 8rpx 20rpx rgba(224,123,62,0.2);
  transition: all 0.15s cubic-bezier(0.25,0.1,0.1,1);
}
.btn-primary[disabled] {
  background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), #D4C8B8;
  box-shadow: 0 2rpx 0 rgba(180,170,155,0.3), 0 4rpx 8rpx rgba(0,0,0,0.03);
}

/* 按钮按压态 — 下沉 + 内阴影 */
.btn-press {
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.1), 0 1rpx 0 rgba(0,0,0,0.15) !important;
  transform: translateY(2rpx);
}
</style>
