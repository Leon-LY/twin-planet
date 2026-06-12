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

    <!-- 家庭名输入 -->
    <view class="form-group">
      <text class="form-label">家庭名称</text>
      <input
        class="form-input"
        v-model="familyName"
        placeholder="例如：川岑小星球、安宁安然的家"
        placeholder-style="color: #CBD5E0; font-size: 14px;"
        maxlength="20"
      />
      <text class="form-hint">{{ familyName.length }}/20</text>
    </view>

    <!-- 我的角色 -->
    <view class="form-group">
      <text class="form-label">我是</text>
      <view class="role-grid">
        <view
          v-for="role in roles"
          :key="role.value"
          class="role-card"
          :class="{ selected: selectedRole === role.value }"
          @click="selectRole(role.value)"
        >
          <text class="role-icon">{{ role.icon }}</text>
          <text class="role-name">{{ role.label }}</text>
        </view>
      </view>
    </view>

    <!-- 继续按钮 -->
    <view class="bottom-action">
      <button
        class="btn-primary"
        :disabled="!canProceed"
        @click="goNext"
      >
        下一步 · 添加宝宝
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
  userStore.setRole(selectedRole.value)

  uni.navigateTo({ url: '/pages/onboarding/babies' })
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '创建家庭' })
})
</script>

<style scoped>
.onboard-page {
  min-height: 100vh;
  background: #FFFBF5;
  padding: 24px 20px 40px;
}

/* 进度条 */
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}
.progress-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #EDF2F7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #A0AEC0;
  font-weight: 600;
}
.progress-step.active {
  background: #4299E1;
  color: #FFFFFF;
}
.progress-line {
  flex: 1;
  max-width: 60px;
  height: 2px;
  background: #EDF2F7;
}
.progress-line.active {
  background: #4299E1;
}

/* 标题 */
.section-header {
  text-align: center;
  margin-bottom: 28px;
}
.section-icon {
  font-size: 36px;
}
.section-title {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #2D3748;
  margin-top: 8px;
}
.section-desc {
  display: block;
  font-size: 13px;
  color: #A0AEC0;
  margin-top: 6px;
}

/* 表单 */
.form-group {
  margin-bottom: 24px;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 8px;
}
.form-input {
  width: 100%;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 16px;
  color: #2D3748;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #4299E1;
}
.form-hint {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #CBD5E0;
  margin-top: 4px;
}

/* 角色选择 */
.role-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  text-align: center;
  gap: 6px;
}
.role-card.selected {
  border-color: #4299E1;
  background: #EBF8FF;
}
.role-icon {
  font-size: 28px;
}
.role-name {
  font-size: 13px;
  font-weight: 500;
  color: #4A5568;
}

/* 底部按钮 */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 32px;
  background: linear-gradient(transparent, #FFFBF5 30%);
}
.btn-primary {
  width: 100%;
  padding: 14px 0;
  background: #4299E1;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}
.btn-primary[disabled] {
  background: #CBD5E0;
  color: #FFFFFF;
}
</style>
