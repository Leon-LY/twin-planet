<!-- 双宝星球 · 吉祥物 — 两颗有表情的小星球 -->
<template>
  <view class="mascot-wrap" :class="[`size-${size}`, { linked: linked }]">
    <!-- 大宝星球 — 姜黄 -->
    <view class="mascot-planet planet-a" :class="{ bounce: bouncing === 'a' }">
      <view class="planet-body">
        <view class="planet-highlight" />
        <view class="planet-face">
          <view class="eye left" /><view class="eye right" />
          <view class="mouth" :class="{ happy: mood==='happy', wink: mood==='wink' }" />
        </view>
        <view class="planet-sparkle s1" /><view class="planet-sparkle s2" />
      </view>
      <view class="planet-shadow" />
      <text class="planet-label" v-if="showLabels">大宝</text>
    </view>

    <!-- 连接线 — 虚线 + 小星星 -->
    <view class="mascot-link" v-if="linked">
      <view class="link-dash" />
      <text class="link-star">✦</text>
      <view class="link-dash" />
    </view>

    <!-- 二宝星球 — 豆沙 -->
    <view class="mascot-planet planet-b" :class="{ bounce: bouncing === 'b' }">
      <view class="planet-body">
        <view class="planet-highlight" />
        <view class="planet-face">
          <view class="eye left" /><view class="eye right" />
          <view class="mouth" :class="{ happy: mood==='happy', wink: mood==='wink' }" />
        </view>
        <view class="planet-sparkle s1" /><view class="planet-sparkle s2" />
      </view>
      <view class="planet-shadow" />
      <text class="planet-label" v-if="showLabels">二宝</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  linked?: boolean    // 是否显示连接线
  mood?: 'happy' | 'wink' | 'neutral'
  showLabels?: boolean
  bouncing?: '' | 'a' | 'b'  // 哪个星球在弹跳
}>()
</script>

<style scoped>
.mascot-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

/* === Sizing === */
.mascot-planet { display: flex; flex-direction: column; align-items: center; }
.size-sm .planet-body { width: 64rpx; height: 64rpx; }
.size-sm .eye { width: 8rpx; height: 8rpx; }
.size-sm .mouth { width: 16rpx; height: 8rpx; }
.size-sm .planet-label { font-size: 16rpx; }
.size-sm .link-dash { width: 16rpx; }

.size-md .planet-body { width: 120rpx; height: 120rpx; }
.size-md .eye { width: 14rpx; height: 14rpx; }
.size-md .mouth { width: 28rpx; height: 14rpx; }
.size-md .planet-label { font-size: 20rpx; }
.size-md .link-dash { width: 28rpx; }

.size-lg .planet-body { width: 200rpx; height: 200rpx; }
.size-lg .eye { width: 22rpx; height: 22rpx; }
.size-lg .mouth { width: 44rpx; height: 22rpx; }
.size-lg .planet-label { font-size: 28rpx; }
.size-lg .link-dash { width: 40rpx; }

/* === Planet Body === */
.planet-body {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(0,0,0,.06), inset 0 -8rpx 16rpx rgba(0,0,0,.08);
}
.planet-a .planet-body {
  background: radial-gradient(circle at 35% 30%, #F0A870 0%, #E07B3E 45%, #C0682A 100%);
}
.planet-b .planet-body {
  background: radial-gradient(circle at 35% 30%, #E8AA98 0%, #D48068 45%, #B05A40 100%);
}

/* 高光 */
.planet-highlight {
  position: absolute;
  top: 12%;
  left: 22%;
  width: 30%;
  height: 22%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,.45) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* === Face === */
.planet-face {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0;
}
.eye {
  border-radius: 50%;
  background: #2D2318;
  margin: 0 3rpx;
  flex-shrink: 0;
}
/* 鼻子区域 — 小雀斑 */
.planet-face::before {
  content: '';
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6rpx;
  height: 4rpx;
  border-radius: 50%;
  background: rgba(45,35,24,.15);
  z-index: 3;
}
.mouth {
  width: 100%;
  border-radius: 0 0 50% 50%;
  background: #2D2318;
  margin-top: 6rpx;
  flex-shrink: 0;
}
.mouth.happy {
  border-radius: 0 0 60% 60%;
  height: 60%;
}
.mouth.wink {
  border-radius: 50%;
  width: 60%;
}

/* 腮红斑点 */
.planet-a .planet-face::after {
  content: '';
  position: absolute;
  top: 52%;
  left: -20%;
  width: 30%;
  height: 16%;
  background: rgba(255,180,140,.3);
  border-radius: 50%;
  pointer-events: none;
}
.planet-b .planet-face::after {
  content: '';
  position: absolute;
  top: 52%;
  left: -20%;
  width: 30%;
  height: 16%;
  background: rgba(255,170,150,.3);
  border-radius: 50%;
  pointer-events: none;
}

/* 星光点缀 */
.planet-sparkle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,.6);
  pointer-events: none;
  animation: sparkleTwinkle 2s ease-in-out infinite;
}
.planet-sparkle.s1 { width: 10%; height: 10%; top: 15%; right: 18%; animation-delay: 0s; }
.planet-sparkle.s2 { width: 6%; height: 6%; bottom: 22%; right: 28%; animation-delay: 1.2s; }
@keyframes sparkleTwinkle {
  0%, 100% { opacity: .3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

/* 阴影 */
.planet-shadow {
  width: 60%;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(45,35,24,.06);
  margin-top: 6rpx;
}

/* === 标签 === */
.planet-label {
  font-family: var(--font-journal);
  color: var(--ink-md);
  margin-top: 8rpx;
  font-weight: 600;
}

/* === 连接线 === */
.mascot-link {
  display: flex;
  align-items: center;
  margin: 0 6rpx;
}
.link-dash {
  height: 2rpx;
  border-top: 2rpx dashed var(--dot);
}
.link-star {
  font-size: 20rpx;
  color: var(--gold);
  margin: 0 2rpx;
}

/* === 弹跳动画 === */
.planet-a.bounce .planet-body {
  animation: mascotBounceA .5s var(--ease-bounce);
}
.planet-b.bounce .planet-body {
  animation: mascotBounceB .5s var(--ease-bounce);
}
@keyframes mascotBounceA {
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-24rpx) scale(1.08); }
  70% { transform: translateY(-4rpx) scale(.96); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes mascotBounceB {
  0% { transform: translateY(0) scale(1); }
  35% { transform: translateY(-20rpx) scale(1.06); }
  65% { transform: translateY(-6rpx) scale(.97); }
  85% { transform: translateY(2rpx) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}
</style>
