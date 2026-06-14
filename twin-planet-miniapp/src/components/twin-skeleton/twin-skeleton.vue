<template>
  <view class="skeleton-wrapper">
    <!-- 标题占位 -->
    <view v-if="type === 'brand'" class="sk-brand">
      <view class="sk-line w-60 center" />
      <view class="sk-line w-40 center short" />
    </view>

    <!-- 双宝卡片占位 -->
    <view v-if="type === 'twins'" class="sk-twins">
      <view class="sk-twin-card">
        <view class="sk-circle" />
        <view class="sk-line w-70" />
        <view class="sk-line w-40 short" />
      </view>
      <view class="sk-divider" />
      <view class="sk-twin-card">
        <view class="sk-circle" />
        <view class="sk-line w-70" />
        <view class="sk-line w-40 short" />
      </view>
    </view>

    <!-- 功能列表占位 -->
    <view v-if="type === 'list'" class="sk-list">
      <view v-for="i in count" :key="i" class="sk-list-item">
        <view class="sk-circle small" />
        <view class="sk-list-body">
          <view class="sk-line w-80" />
          <view class="sk-line w-55 short" />
        </view>
        <view class="sk-arrow" />
      </view>
    </view>

    <!-- 操作按钮网格占位 -->
    <view v-if="type === 'grid'" class="sk-grid">
      <view v-for="i in count" :key="i" class="sk-grid-item">
        <view class="sk-circle" />
        <view class="sk-line w-70 center" />
        <view class="sk-line w-40 center short" />
      </view>
    </view>

    <!-- 日志列表占位 -->
    <view v-if="type === 'logs'" class="sk-logs">
      <view v-for="i in count" :key="i" class="sk-log-item">
        <view class="sk-circle small" />
        <view class="sk-list-body">
          <view class="sk-line w-85" />
          <view class="sk-line w-30 short" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  type: 'brand' | 'twins' | 'list' | 'grid' | 'logs'
  count?: number
}>()
</script>

<style scoped>
.skeleton-wrapper { padding: 0 8rpx; }

/* 骨架动画 — 暖纸微光 */
.sk-line, .sk-circle, .sk-divider, .sk-arrow {
  background: linear-gradient(90deg,
    var(--dot) 25%,
    rgba(224,123,62,0.05) 50%,
    var(--dot) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s var(--ease-soft) infinite;
}
.sk-line { height: 24rpx; border-radius: 8rpx; margin-bottom: 12rpx; }
.sk-line.short { height: 18rpx; }
.sk-line.center { margin-left: auto; margin-right: auto; }
.sk-line.w-30 { width: 30%; }
.sk-line.w-40 { width: 40%; }
.sk-line.w-55 { width: 55%; }
.sk-line.w-60 { width: 60%; }
.sk-line.w-70 { width: 70%; }
.sk-line.w-80 { width: 80%; }
.sk-line.w-85 { width: 85%; }

.sk-circle { width: 64rpx; height: 64rpx; border-radius: 50%; flex-shrink: 0; }
.sk-circle.small { width: 40rpx; height: 40rpx; }

.sk-arrow { width: 24rpx; height: 24rpx; border-radius: 50%; flex-shrink: 0; }
.sk-divider { width: 2rpx; height: 80rpx; border-radius: 2rpx; }

/* 品牌区 */
.sk-brand { padding: 60rpx 0 40rpx; text-align: center; }

/* 双宝卡片 */
.sk-twins {
  display: flex;
  background: var(--cream);
  border-radius: var(--radius-lg);
  border: 2rpx solid var(--dot);
  padding: 32rpx;
  margin-bottom: 32rpx;
}
.sk-twin-card { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12rpx; }

/* 列表 */
.sk-list { display: flex; flex-direction: column; gap: 16rpx; }
.sk-list-item {
  display: flex; align-items: center; gap: 24rpx;
  padding: 28rpx;
  background: var(--cream);
  border-radius: var(--radius-md);
  border: 1rpx solid var(--dot);
}
.sk-list-body { flex: 1; }

/* 网格 */
.sk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.sk-grid-item {
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  padding: 36rpx 12rpx;
  background: var(--cream);
  border-radius: var(--radius-md);
  border: 1rpx solid var(--dot);
}

/* 日志 */
.sk-logs { display: flex; flex-direction: column; gap: 12rpx; }
.sk-log-item {
  display: flex; align-items: center; gap: 16rpx;
  padding: 20rpx 24rpx;
  background: var(--cream);
  border-radius: var(--radius-md);
  border: 1rpx solid var(--dot);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
