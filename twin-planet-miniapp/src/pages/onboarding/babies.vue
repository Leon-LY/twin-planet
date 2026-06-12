<template>
  <view class="onboard-page">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-step done"><text>✓</text></view>
      <view class="progress-line done" />
      <view class="progress-step active"><text>2</text></view>
      <view class="progress-line" />
      <view class="progress-step"><text>3</text></view>
    </view>

    <!-- 标题 -->
    <view class="section-header">
      <text class="section-icon">👶👶</text>
      <text class="section-title">添加你的双胞胎宝宝</text>
      <text class="section-desc">每个宝宝都有专属的颜色和身份</text>
    </view>

    <!-- 宝宝表单切换 -->
    <view class="baby-tabs">
      <view
        class="baby-tab"
        :class="{ active: currentBaby === 1 }"
        @click="currentBaby = 1"
      >
        <view class="tab-dot" style="background: #4299E1" />
        <text>大宝</text>
      </view>
      <view
        class="baby-tab"
        :class="{ active: currentBaby === 2 }"
        @click="currentBaby = 2"
      >
        <view class="tab-dot" style="background: #F56565" />
        <text>二宝</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form-group">
      <text class="form-label">大名</text>
      <input
        class="form-input"
        v-model="form.name"
        placeholder="宝宝的大名"
        placeholder-style="color: #CBD5E0"
        maxlength="10"
      />
    </view>

    <view class="form-group">
      <text class="form-label">小名</text>
      <input
        class="form-input"
        v-model="form.nickname"
        placeholder="平时怎么叫TA"
        placeholder-style="color: #CBD5E0"
        maxlength="10"
      />
    </view>

    <view class="form-row">
      <view class="form-group" style="flex: 1; margin-right: 10px;">
        <text class="form-label">性别</text>
        <view class="gender-toggle">
          <view
            class="gender-btn"
            :class="{ active: form.gender === 'male' }"
            @click="form.gender = 'male'"
          >
            <text>👦 男孩</text>
          </view>
          <view
            class="gender-btn"
            :class="{ active: form.gender === 'female' }"
            @click="form.gender = 'female'"
          >
            <text>👧 女孩</text>
          </view>
        </view>
      </view>

      <view class="form-group" style="flex: 1;">
        <text class="form-label">出生日期</text>
        <picker
          mode="date"
          :value="form.birthDate"
          @change="onDateChange"
          :end="today"
          :start="'2020-01-01'"
        >
          <view class="form-input date-picker">
            {{ form.birthDate || '点击选择' }}
          </view>
        </picker>
      </view>
    </view>

    <view class="form-row">
      <view class="form-group" style="flex: 1; margin-right: 10px;">
        <text class="form-label">出生体重 (kg)</text>
        <input
          class="form-input"
          v-model="form.birthWeight"
          type="digit"
          placeholder="如 3.2"
          placeholder-style="color: #CBD5E0"
        />
      </view>
      <view class="form-group" style="flex: 1;">
        <text class="form-label">出生身长 (cm)</text>
        <input
          class="form-input"
          v-model="form.birthHeight"
          type="digit"
          placeholder="如 50"
          placeholder-style="color: #CBD5E0"
        />
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action">
      <button class="btn-primary" @click="saveBaby">
        {{ currentBaby === 1 ? '保存 · 添加二宝' : '保存 · 完成注册' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useBabiesStore } from '@/stores/babies'

const babiesStore = useBabiesStore()
const currentBaby = ref(1)
const today = new Date().toISOString().slice(0, 10)

// 每个宝宝的独立表单
const baby1Form = reactive({
  name: '',
  nickname: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '2022-07-07',
  birthWeight: '',
  birthHeight: '',
})

const baby2Form = reactive({
  name: '',
  nickname: '',
  gender: 'female' as 'male' | 'female',
  birthDate: '2022-07-07',
  birthWeight: '',
  birthHeight: '',
})

const form = computed(() => (currentBaby.value === 1 ? baby1Form : baby2Form))

function onDateChange(e: any) {
  form.value.birthDate = e.detail.value
}

function saveBaby() {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请填写宝宝的大名', icon: 'none' })
    return
  }
  if (!form.value.birthDate) {
    uni.showToast({ title: '请选择出生日期', icon: 'none' })
    return
  }

  babiesStore.addBaby({
    name: form.value.name.trim(),
    nickname: form.value.nickname.trim() || form.value.name.trim(),
    gender: form.value.gender,
    birthDate: form.value.birthDate,
    birthOrder: currentBaby.value as 1 | 2,
    birthWeight: parseFloat(form.value.birthWeight) || 0,
    birthHeight: parseFloat(form.value.birthHeight) || 0,
    isActive: true,
  })

  if (currentBaby.value === 1) {
    currentBaby.value = 2
    uni.showToast({ title: '大宝已保存，请添加二宝', icon: 'none' })
  } else {
    // 注册完成，跳转首页
    uni.showToast({ title: '🎉 欢迎来到并蒂星球！', icon: 'none', duration: 1500 })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1500)
  }
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: '添加宝宝' })
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
  margin-bottom: 20px;
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
.progress-step.active { background: #48BB78; color: #FFFFFF; }
.progress-step.done { background: #48BB78; color: #FFFFFF; }
.progress-line { flex: 1; max-width: 60px; height: 2px; background: #EDF2F7; }
.progress-line.done { background: #48BB78; }

/* 标题 */
.section-header { text-align: center; margin-bottom: 20px; }
.section-icon { font-size: 32px; }
.section-title { display: block; font-size: 20px; font-weight: 700; color: #2D3748; margin-top: 6px; }
.section-desc { display: block; font-size: 12px; color: #A0AEC0; margin-top: 4px; }

/* 宝宝切换 */
.baby-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.baby-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
  background: #FFFFFF;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  color: #A0AEC0;
}
.baby-tab.active { border-color: #4299E1; color: #2D3748; font-weight: 600; }
.tab-dot { width: 10px; height: 10px; border-radius: 50%; }

/* 表单 */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 12px; font-weight: 600; color: #4A5568; margin-bottom: 6px; }
.form-input {
  width: 100%; padding: 12px 14px;
  background: #FFFFFF; border: 2px solid #E2E8F0;
  border-radius: 10px; font-size: 15px; color: #2D3748;
  box-sizing: border-box;
}
.form-input:focus { border-color: #4299E1; }
.form-row { display: flex; }
.date-picker { color: #2D3748; line-height: 1.6; }

/* 性别切换 */
.gender-toggle { display: flex; gap: 6px; }
.gender-btn {
  flex: 1; text-align: center; padding: 10px 0;
  background: #FFFFFF; border: 2px solid #E2E8F0;
  border-radius: 10px; font-size: 13px; color: #718096;
}
.gender-btn.active { border-color: #4299E1; background: #EBF8FF; color: #2D3748; }

/* 底部 */
.bottom-action {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 16px 20px 32px;
  background: linear-gradient(transparent, #FFFBF5 30%);
}
.btn-primary {
  width: 100%; padding: 14px 0; background: #4299E1;
  color: #FFFFFF; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 600;
}
</style>
