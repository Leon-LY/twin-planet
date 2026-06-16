<template>
  <view class="onboard-page">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-step done"><text class="iconfont icon-check"></text></view>
      <view class="progress-line done" />
      <view class="progress-step active"><text>2</text></view>
      <view class="progress-line" />
      <view class="progress-step"><text>3</text></view>
    </view>

    <!-- 标题 -->
    <view class="section-header">
      <text class="section-icon">👶👶</text>
      <text class="section-title">{{ currentBaby === 1 ? '添加大宝' : '添加小宝' }}</text>
      <text class="section-desc">
        {{ currentBaby === 1 ? '先填大宝的信息吧' : '小宝来啦，出生日期已帮你填好了~' }}
      </text>
    </view>

    <!-- 宝宝表单切换 -->
    <view class="baby-tabs">
      <view
        class="baby-tab tab-aning"
        :class="{ active: currentBaby === 1 }"
        hover-class="tab-press"
        @click="currentBaby = 1"
      >
        <view class="tab-dot" style="background: var(--twin-baby-a)" />
        <text>大宝</text>
      </view>
      <view
        class="baby-tab tab-anran"
        :class="{ active: currentBaby === 2 }"
        hover-class="tab-press"
        @click="currentBaby = 2"
      >
        <view class="tab-dot" style="background: var(--twin-baby-b)" />
        <text>小宝</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form-group">
      <text class="form-label">大名 <text class="required">*</text></text>
      <input
        class="form-input"
        v-model="form.name"
        placeholder="宝宝的大名"
        placeholder-style="color: var(--twin-text-muted)"
        maxlength="10"
      />
    </view>

    <view class="form-group">
      <text class="form-label">小名</text>
      <input
        class="form-input"
        v-model="form.nickname"
        placeholder="平时怎么叫TA"
        placeholder-style="color: var(--twin-text-muted)"
        maxlength="10"
      />
    </view>

    <view class="form-row">
      <view class="form-group half">
        <text class="form-label">性别 <text class="required">*</text></text>
        <view class="gender-toggle">
          <view
            class="gender-btn"
            :class="{ active: form.gender === 'male' }"
            hover-class="gender-press"
            @click="form.gender = 'male'"
          ><text>👦 男孩</text></view>
          <view
            class="gender-btn"
            :class="{ active: form.gender === 'female' }"
            hover-class="gender-press"
            @click="form.gender = 'female'"
          ><text>👧 女孩</text></view>
        </view>
      </view>

      <view class="form-group half">
        <text class="form-label">出生日期 <text class="required">*</text></text>
        <picker
          mode="date"
          :value="form.birthDate"
          @change="onDateChange"
          :end="today"
          :start="'2020-01-01'"
        >
          <view class="form-input date-picker">{{ form.birthDate || '点击选择' }}</view>
        </picker>
      </view>
    </view>

    <view class="form-row">
      <view class="form-group half">
        <text class="form-label">出生体重 (kg) <text class="optional">选填</text></text>
        <input
          class="form-input"
          v-model="form.birthWeight"
          type="digit"
          placeholder="记不清可跳过"
          placeholder-style="color: var(--twin-text-muted)"
        />
      </view>
      <view class="form-group half">
        <text class="form-label">出生身长 (cm) <text class="optional">选填</text></text>
        <input
          class="form-input"
          v-model="form.birthHeight"
          type="digit"
          placeholder="记不清可跳过"
          placeholder-style="color: var(--twin-text-muted)"
        />
        <text class="form-sublabel">记不清也没关系，不影响使用</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action">
      <button class="btn-primary" hover-class="btn-press" @click="saveBaby">
        {{ currentBaby === 1 ? '保存 · 添加小宝' : '保存 · 完成注册' }}
      </button>
      <text class="back-link" @click="goBack" v-if="currentBaby===1">← 返回修改家庭信息</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'

const babiesStore = useBabiesStore()
const currentBaby = ref(1)
const today = new Date().toISOString().slice(0, 10)

const baby1Form = reactive({
  name: '',
  nickname: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthWeight: '',
  birthHeight: '',
})

const baby2Form = reactive({
  name: '',
  nickname: '',
  gender: 'female' as 'male' | 'female',
  birthDate: '', // 自动从大宝继承
  birthWeight: '',
  birthHeight: '',
})

const form = computed(() => (currentBaby.value === 1 ? baby1Form : baby2Form))

function onDateChange(e: any) {
  form.value.birthDate = e.detail.value
}

function goBack() {
  uni.navigateBack()
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
    // 自动将大宝的出生日期填充到小宝
    baby2Form.birthDate = baby1Form.birthDate
    currentBaby.value = 2
    uni.showToast({ title: '大宝已保存，请添加小宝', icon: 'none' })
  } else {
    uni.showToast({ title: '🎉 🚀 欢迎加入！开始记录吧 ✦', icon: 'none', duration: 1500 })
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
  background: var(--twin-bg);
  padding: 48rpx 32rpx 40px;
}

/* 清除原生 button ::after 边框 */
button::after { border: none; }

/* 进度条 */
.progress-bar {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 40rpx;
}
.progress-step {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: var(--twin-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: var(--twin-text-secondary); font-weight: 600;
}
.progress-step.active { background: var(--twin-accent); color: var(--twin-card-bg); }
.progress-step.done { background: var(--twin-accent); color: var(--twin-card-bg); }
.progress-line { flex: 1; max-width: 120rpx; height: 4rpx; background: var(--twin-border); }
.progress-line.done { background: var(--twin-accent); }

/* 标题 */
.section-header { text-align: center; margin-bottom: 32rpx; }
.section-icon { font-size: 32rpx; }
.section-title { display: block; font-size: 40rpx; font-weight: 700; color: var(--twin-text); margin-top: 12rpx; }
.section-desc { display: block; font-size: 24rpx; color: var(--twin-text-secondary); margin-top: 8rpx; }

/* 宝宝切换 -- 物理卡片 */
.baby-tabs { display: flex; gap: 20rpx; margin-bottom: 32rpx; }
.baby-tab {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 16rpx; padding: 20rpx 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), #FFF5E8;
  border: 4rpx solid var(--twin-border); border-radius: 20rpx;
  font-size: 28rpx; color: var(--twin-text-secondary);
  box-shadow: 0 2rpx 0 rgba(200,180,160,0.2), 0 3rpx 6rpx rgba(0,0,0,0.04);
  transition: all 0.15s cubic-bezier(0.25,0.1,0.1,1);
  position: relative;
  overflow: hidden;
}
/* 标签表面高光 */
.baby-tab::after {
  content: '';
  position: absolute;
  top: 4rpx; left: 15%; right: 15%; height: 35%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.tab-aning.active {
  border-color: var(--twin-baby-a);
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), rgba(224,123,62,0.08);
  color: var(--twin-text); font-weight: 600;
  box-shadow: 0 2rpx 0 rgba(191,90,40,0.25), 0 3rpx 6rpx rgba(0,0,0,0.04), 0 6rpx 14rpx rgba(224,123,62,0.1);
}
.tab-anran.active {
  border-color: var(--twin-baby-b);
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), rgba(212,128,104,0.08);
  color: var(--twin-text); font-weight: 600;
  box-shadow: 0 2rpx 0 rgba(180,100,80,0.25), 0 3rpx 6rpx rgba(0,0,0,0.04), 0 6rpx 14rpx rgba(212,128,104,0.1);
}
.tab-dot { width: 20rpx; height: 20rpx; border-radius: 50%; }

/* 标签按压态 */
.tab-press {
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.08), 0 1rpx 0 rgba(200,180,160,0.2) !important;
  transform: translateY(2rpx);
}

/* 表单 */
.form-group { margin-bottom: 28rpx; }
.form-group.half { flex: 1; margin-right: 0; }
.form-group.half:first-child { margin-right: 16rpx; }
.form-label { display: block; font-size: 24rpx; font-weight: 600; color: var(--ink); margin-bottom: 12rpx; }
.required { color: var(--twin-baby-b); }
.optional { font-weight: 400; color: var(--twin-text-secondary); font-size: 22rpx; }
.form-input {
  width: 100%; padding: 24rpx 28rpx;
  background: linear-gradient(180deg, rgba(0,0,0,0.015) 0%, transparent 8%), #FFF5E8;
  border: 4rpx solid var(--twin-border);
  border-radius: 20rpx; font-size: 30rpx; color: var(--twin-text);
  box-sizing: border-box;
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.04), inset 0 0 0 1rpx rgba(0,0,0,0.02), 0 1rpx 0 rgba(255,255,255,0.6);
}
.form-sublabel { display: block; font-size: 20rpx; color: var(--twin-text-muted); margin-top: 8rpx; }
.form-row { display: flex; }
.date-picker { color: var(--twin-text); line-height: 1.6; }

/* 性别切换 — 物理按钮 */
.gender-toggle { display: flex; gap: 12rpx; }
.gender-btn {
  flex: 1; text-align: center; padding: 20rpx 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), #FFF5E8;
  border: 4rpx solid var(--twin-border);
  border-radius: 20rpx; font-size: 26rpx; color: var(--twin-text-tertiary);
  box-shadow: 0 2rpx 0 rgba(200,180,160,0.2), 0 3rpx 6rpx rgba(0,0,0,0.04);
  transition: all 0.15s cubic-bezier(0.25,0.1,0.1,1);
  position: relative;
  overflow: hidden;
}
/* 性别按钮表面高光 */
.gender-btn::after {
  content: '';
  position: absolute;
  top: 4rpx; left: 15%; right: 15%; height: 35%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.gender-btn.active {
  border-color: var(--twin-baby-a);
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 55%, rgba(0,0,0,0.02) 100%), rgba(224,123,62,0.08);
  color: var(--twin-text);
  box-shadow: 0 2rpx 0 rgba(191,90,40,0.25), 0 3rpx 6rpx rgba(0,0,0,0.04), 0 6rpx 14rpx rgba(224,123,62,0.1);
}

/* 性别按钮按压态 */
.gender-press {
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

/* 按钮按压态 — 下沉 + 内阴影 */
.btn-press {
  box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.1), 0 1rpx 0 rgba(0,0,0,0.15) !important;
  transform: translateY(2rpx);
}

.back-link { display:block; text-align:center; margin-top:20rpx; font-size:26rpx; color:var(--ink-md); }
</style>
