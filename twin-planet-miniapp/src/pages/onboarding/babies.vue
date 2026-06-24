<template>
  <JournalPage>
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-step done"><text class="iconfont icon-check"></text></view>
      <view class="progress-line done" />
      <view class="progress-step active"><text>2</text></view>
      <view class="progress-line" />
      <view class="progress-step"><text>3</text></view>
    </view>

    <!-- 标题 -->
    <JournalPageHeader
      :icon="currentBaby === 1 ? '👶' : '👶'"
      :title="currentBaby === 1 ? '添加大宝' : '添加小宝'"
      :subtitle="currentBaby === 1 ? '先填大宝的信息吧' : '小宝来啦，出生日期已帮你填好了~'"
    />

    <!-- 宝宝表单切换 -->
    <view class="baby-tabs">
      <view
        class="baby-tab tab-aning"
        :class="{ active: currentBaby === 1 }"
        hover-class="tab-press"
        @click="currentBaby = 1"
      >
        <view class="tab-dot" style="background: var(--amber)" />
        <text>大宝</text>
      </view>
      <view
        class="baby-tab tab-anran"
        :class="{ active: currentBaby === 2 }"
        hover-class="tab-press"
        @click="currentBaby = 2"
      >
        <view class="tab-dot" style="background: var(--terracotta)" />
        <text>小宝</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form-group">
      <text class="form-label">大名 <text class="required">*</text></text>
      <JournalInput
        v-model="form.name"
        placeholder="宝宝的大名"
        :maxlength="10"
      />
    </view>

    <view class="form-group">
      <text class="form-label">小名</text>
      <JournalInput
        v-model="form.nickname"
        placeholder="平时怎么叫TA"
        :maxlength="10"
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
        <JournalInput
          v-model="form.birthWeight"
          type="digit"
          placeholder="记不清可跳过"
        />
      </view>
      <view class="form-group half">
        <text class="form-label">出生身长 (cm) <text class="optional">选填</text></text>
        <JournalInput
          v-model="form.birthHeight"
          type="digit"
          placeholder="记不清可跳过"
        />
        <text class="form-sublabel">记不清也没关系，不影响使用</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-action">
      <JournalButton variant="primary" size="lg" @click="saveBaby">
        {{ currentBaby === 1 ? '保存 · 添加小宝' : '保存 · 完成注册' }}
      </JournalButton>
      <text class="back-link" @click="goBack" v-if="currentBaby===1">← 返回修改家庭信息</text>
    </view>
  </JournalPage>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useBabiesStore } from '@/stores/babies'
import { JournalPage, JournalPageHeader, JournalInput, JournalButton } from '@/components/journal'

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
  birthDate: '',
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
.progress-bar {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 32rpx;
}
.progress-step {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: var(--dot);
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: var(--ink-md); font-weight: 600;
}
.progress-step.active { background: var(--mint); color: var(--cream); }
.progress-step.done { background: var(--mint); color: var(--cream); }
.progress-line { flex: 1; max-width: 120rpx; height: 4rpx; background: var(--dot); }
.progress-line.done { background: var(--mint); }

/* 宝宝切换卡片 */
.baby-tabs { display: flex; gap: 20rpx; margin-bottom: 28rpx; }
.baby-tab {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 16rpx; padding: 20rpx 0;
  background: var(--cream);
  border: 4rpx solid var(--dot); border-radius: 20rpx;
  font-size: 28rpx; color: var(--ink-md);
  box-shadow: var(--shadow-layer-1);
  transition: all 0.15s var(--ease-stamp);
  position: relative; overflow: hidden;
}
.baby-tab::after {
  content: '';
  position: absolute; top: 4rpx; left: 15%; right: 15%; height: 35%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.tab-aning.active {
  border-color: var(--amber); background: var(--amber-lt);
  color: var(--ink); font-weight: 600;
}
.tab-anran.active {
  border-color: var(--terracotta); background: var(--terracotta-lt);
  color: var(--ink); font-weight: 600;
}
.tab-dot { width: 20rpx; height: 20rpx; border-radius: 50%; }
.tab-press { box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.08) !important; transform: translateY(2rpx); }

/* 表单 */
.form-group { margin-bottom: 24rpx; }
.form-group.half { flex: 1; margin-right: 0; }
.form-group.half:first-child { margin-right: 16rpx; }
.form-label { display: block; font-size: 24rpx; font-weight: 600; color: var(--ink); margin-bottom: 12rpx; }
.required { color: var(--terracotta); }
.optional { font-weight: 400; color: var(--ink-md); font-size: 22rpx; }
.form-input {
  width: 100%; height: 88rpx; padding: 0 28rpx;
  background: var(--cream);
  border: 4rpx solid var(--dot); border-radius: 20rpx;
  font-size: 30rpx; color: var(--ink);
  box-sizing: border-box;
  box-shadow: var(--shadow-recess);
}
.form-sublabel { display: block; font-size: 20rpx; color: var(--ink-lt); margin-top: 8rpx; }
.form-row { display: flex; }
.date-picker { line-height: 88rpx; }

/* 性别切换 */
.gender-toggle { display: flex; gap: 12rpx; }
.gender-btn {
  flex: 1; text-align: center; padding: 20rpx 0;
  background: var(--cream); border: 4rpx solid var(--dot); border-radius: 20rpx;
  font-size: 26rpx; color: var(--ink-lt);
  box-shadow: var(--shadow-layer-1);
  transition: all 0.15s var(--ease-stamp);
  position: relative; overflow: hidden;
}
.gender-btn::after {
  content: '';
  position: absolute; top: 4rpx; left: 15%; right: 15%; height: 35%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.gender-btn.active {
  border-color: var(--amber); background: var(--amber-lt);
  color: var(--ink);
}
.gender-press { box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.08) !important; transform: translateY(2rpx); }

/* 底部 */
.bottom-action {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: 32rpx 32rpx calc(64rpx + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, var(--paper) 30%);
}
.back-link { display: block; text-align: center; margin-top: 20rpx; font-size: 26rpx; color: var(--ink-md); }
</style>
