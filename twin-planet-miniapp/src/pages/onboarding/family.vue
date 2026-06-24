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
    <JournalPageHeader icon="🏠" title="创建你的家庭" subtitle="给你们的双胞胎小天地取个名字吧" />

    <!-- 家庭名 -->
    <view class="form-group">
      <text class="form-label">家庭名称</text>
      <JournalInput
        v-model="familyName"
        placeholder="例如：大宝小宝的家、安宁安然的家"
        :maxlength="20"
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
      <JournalButton
        variant="primary"
        size="lg"
        :disabled="!canProceed"
        @click="goNext"
      >
        下一步 · 添加宝宝
      </JournalButton>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import { useUserStore, type UserProfile } from '@/stores/user'
import JournalPageHeader from '@/components/journal/JournalPageHeader.vue'
import JournalInput from '@/components/journal/JournalInput.vue'
import JournalButton from '@/components/journal/JournalButton.vue'

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
  background: var(--paper);
  padding: 48rpx 32rpx 40rpx;
}
.progress-bar {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 48rpx;
}
.progress-step {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: var(--dot);
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: var(--ink-md); font-weight: 600;
}
.progress-step.active { background: var(--amber); color: var(--cream); }
.progress-line { flex: 1; max-width: 120rpx; height: 4rpx; background: var(--dot); }
.progress-line.active { background: var(--amber); }

.form-group { margin-bottom: 32rpx; }
.form-label { display: block; font-size: 26rpx; font-weight: 600; color: var(--ink); margin-bottom: 16rpx; }
.form-hint { display: block; text-align: right; font-size: 22rpx; color: var(--ink-lt); margin-top: 8rpx; }

/* 角色选择 — 保留页面独有的卡片设计 */
.role-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
.role-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32rpx 16rpx;
  background: var(--cream);
  border: 4rpx solid var(--dot);
  border-radius: 24rpx; text-align: center; gap: 12rpx;
  box-shadow: var(--shadow-layer-1);
  transition: all 0.15s var(--ease-stamp);
  position: relative; overflow: hidden;
}
.role-card::after {
  content: '';
  position: absolute; top: 6rpx; left: 15%; right: 15%; height: 35%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.role-card.selected {
  border-color: var(--amber);
  background: var(--amber-lt);
  box-shadow: 0 2rpx 0 rgba(192,104,52,0.3), 0 4rpx 8px rgba(0,0,0,0.04), 0 6rpx 16rpx rgba(224,123,62,0.12);
}
.role-icon { font-size: 28rpx; }
.role-name { font-size: 26rpx; font-weight: 500; color: var(--ink); }

.role-press {
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.08), 0 1rpx 0 rgba(200,180,160,0.2) !important;
  transform: translateY(2rpx);
}

.bottom-action {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 32rpx 32rpx calc(64rpx + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, var(--paper) 30%);
}
</style>
