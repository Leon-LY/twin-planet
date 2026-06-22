<!-- 品牌Loading · 双狐背对背→尾巴围成心形→品牌名浮现 -->
<template>
  <view class="brand-loading" v-if="visible">
    <view class="bl-scene">
      <!-- 双狐轮廓 -->
      <view class="bl-fox bl-fox-a">
        <view class="bl-ear bl-ear-l"></view>
        <view class="bl-ear bl-ear-r"></view>
        <view class="bl-body"></view>
        <view class="bl-tail"></view>
      </view>
      <view class="bl-fox bl-fox-b">
        <view class="bl-ear bl-ear-l"></view>
        <view class="bl-ear bl-ear-r"></view>
        <view class="bl-body"></view>
        <view class="bl-tail"></view>
      </view>
      <!-- 中间心形（尾巴围成） -->
      <view class="bl-heart"></view>
    </view>
    <text class="bl-brand" :class="{ show: brandShow }">双宝记</text>
    <text class="bl-slogan" :class="{ show: brandShow }">并蒂而生 · 同步成长</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  visible?: boolean
  duration?: number
}>(), {
  visible: true,
  duration: 2000,
})

const emit = defineEmits<{ done: [] }>()
const brandShow = ref(false)

onMounted(() => {
  setTimeout(() => { brandShow.value = true }, 800)
  setTimeout(() => { emit('done') }, props.duration)
})
</script>

<style scoped>
.brand-loading {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--paper, #FEF9F0);
  gap: 24rpx;
}

/* === 双狐场景 === */
.bl-scene {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* === 单只狐狸（CSS纯绘制） === */
.bl-fox {
  position: relative;
  width: 80rpx;
  height: 100rpx;
  animation: blFoxIn 0.6s var(--ease-bounce, cubic-bezier(0.34,1.3,0.64,1)) both;
}
.bl-fox-a {
  --fox-color: #E07B3E;
  margin-right: -10rpx;
  animation-delay: 0.1s;
}
.bl-fox-b {
  --fox-color: #C08552;
  margin-left: -10rpx;
  animation-delay: 0.3s;
}

.bl-body {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 56rpx;
  background: var(--fox-color);
  border-radius: 30rpx 30rpx 28rpx 28rpx;
}

.bl-ear {
  position: absolute;
  top: 0;
  width: 24rpx;
  height: 32rpx;
  background: var(--fox-color);
}
.bl-ear-l {
  left: 8rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(-15deg);
}
.bl-ear-r {
  right: 8rpx;
  border-radius: 50% 50% 0 0;
  transform: rotate(15deg);
}

.bl-tail {
  position: absolute;
  bottom: 8rpx;
  width: 28rpx;
  height: 40rpx;
  background: var(--fox-color);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: blTailWag 1.5s ease-in-out infinite;
}
.bl-fox-a .bl-tail {
  right: -16rpx;
  transform-origin: top left;
}
.bl-fox-b .bl-tail {
  left: -16rpx;
  transform-origin: top right;
}

/* === 中间心形 === */
.bl-heart {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%) scale(0);
  width: 24rpx;
  height: 24rpx;
  background: #C8993E;
  animation: blHeartPop 0.5s var(--ease-bounce, cubic-bezier(0.34,1.3,0.64,1)) 0.9s both;
}
.bl-heart::before,
.bl-heart::after {
  content: '';
  position: absolute;
  width: 14rpx;
  height: 14rpx;
  background: #C8993E;
  border-radius: 50%;
}
.bl-heart::before { top: -6rpx; left: 0; }
.bl-heart::after { top: -6rpx; right: 0; }

/* === 品牌名 === */
.bl-brand {
  font-family: Georgia, KaiTi, STKaiti, serif;
  font-size: 48rpx;
  font-weight: 700;
  color: #2D2318;
  letter-spacing: 8rpx;
  opacity: 0;
  transform: translateY(10rpx);
  transition: all 0.5s var(--ease-soft, cubic-bezier(0.16,1,0.3,1));
}
.bl-brand.show {
  opacity: 1;
  transform: translateY(0);
}

.bl-slogan {
  font-size: 22rpx;
  color: #9C8E7C;
  letter-spacing: 4rpx;
  opacity: 0;
  transition: opacity 0.5s ease 0.2s;
}
.bl-slogan.show { opacity: 1; }

/* === 动画 === */
@keyframes blFoxIn {
  0% { transform: translateY(40rpx); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes blTailWag {
  0%, 100% { transform: rotate(0deg) scaleY(1); }
  50% { transform: rotate(-10deg) scaleY(0.95); }
}

@keyframes blHeartPop {
  0% { transform: translateX(-50%) scale(0); }
  60% { transform: translateX(-50%) scale(1.3); }
  100% { transform: translateX(-50%) scale(1); }
}
</style>
