<!-- 空状态统一组件 · 双狐剪影 + 提示 -->
<template>
  <view class="empty-state">
    <!-- 双狐剪影（CSS纯绘制） -->
    <view class="es-silhouette">
      <view class="es-fox es-fox-a">
        <view class="es-ear es-ear-l"></view>
        <view class="es-ear es-ear-r"></view>
        <view class="es-body"></view>
      </view>
      <view class="es-fox es-fox-b">
        <view class="es-ear es-ear-l"></view>
        <view class="es-ear es-ear-r"></view>
        <view class="es-body"></view>
      </view>
    </view>
    <text class="es-title">{{ title }}</text>
    <text class="es-desc" v-if="desc">{{ desc }}</text>
    <view class="es-action" v-if="actionText" @click="$emit('action')">
      <text>{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
  actionText?: string
}>()

defineEmits<{ action: [] }>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  gap: 16rpx;
}

/* === 双狐剪影 === */
.es-silhouette {
  position: relative;
  width: 160rpx;
  height: 120rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4rpx;
  margin-bottom: 12rpx;
}

.es-fox {
  position: relative;
  width: 64rpx;
  height: 80rpx;
}
.es-fox-a { opacity: 0.12; }
.es-fox-b { opacity: 0.10; }

.es-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 48rpx;
  background: #2D2318;
  border-radius: 24rpx 24rpx 22rpx 22rpx;
}

.es-ear {
  position: absolute;
  top: 0;
  width: 20rpx;
  height: 28rpx;
  background: #2D2318;
}
.es-ear-l {
  left: 6rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-15deg);
}
.es-ear-r {
  right: 6rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(15deg);
}

.es-title {
  font-family: Georgia, KaiTi, STKaiti, serif;
  font-size: 32rpx;
  color: #2D2318;
  font-weight: 600;
}

.es-desc {
  font-size: 26rpx;
  color: #9C8E7C;
  text-align: center;
  max-width: 400rpx;
  line-height: 1.5;
}

.es-action {
  margin-top: 12rpx;
  padding: 16rpx 40rpx;
  background: rgba(224,123,62,0.1);
  border: 2rpx solid #E07B3E;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #E07B3E;
  font-weight: 600;
  transition: transform 0.2s ease;
}
.es-action:active { transform: scale(0.96); }
</style>
