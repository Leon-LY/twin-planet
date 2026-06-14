<!--
  并蒂光桥 · LightBridge
  连接两颗孪生星球的能量桥梁。整个 app 最重要的视觉元素。

  状态：
    bright     - 明亮脉动：双宝今天互动频繁
    steady     - 稳定温和：正常连接
    faint       - 微弱：今天还没记录互动
    one-sided-a - 单向流光（大宝 → 二宝）
    one-sided-b - 单向流光（二宝 → 大宝）

  Props:
    state    - 光桥状态
    height   - 光桥高度 (rpx)
    animated - 是否播放脉动动画
-->
<template>
  <view class="light-bridge" :style="{ height: height + 'rpx' }">
    <view
      class="light-bridge-line"
      :class="[stateClass, { 'anim-bridge': animated }]"
    />
    <view class="bridge-node bridge-node-top" :class="nodeTopClass" />
    <view class="bridge-node bridge-node-bottom" :class="nodeBottomClass" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  state?: 'bright' | 'steady' | 'faint' | 'one-sided-a' | 'one-sided-b'
  height?: number
  animated?: boolean
}>(), {
  state: 'steady',
  height: 48,
  animated: true,
})

const stateClass = computed(() => {
  const map: Record<string, string> = {
    bright: 'bright',
    steady: 'steady',
    faint: 'faint',
    'one-sided-a': 'one-sided-a',
    'one-sided-b': 'one-sided-b',
  }
  return map[props.state] || 'steady'
})

const nodeTopClass = computed(() => props.state === 'one-sided-a' ? 'active-a' : '')
const nodeBottomClass = computed(() => props.state === 'one-sided-b' ? 'active-b' : '')
</script>

<style scoped>
.light-bridge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32rpx;
}

.light-bridge-line {
  width: 6rpx;
  min-height: 24rpx;
  border-radius: 3rpx;
  background: linear-gradient(
    to bottom,
    var(--amber) 0%,
    var(--gold) 50%,
    var(--rose) 100%
  );
  opacity: 0.7;
  box-shadow: 0 0 12rpx var(--gold-lt);
  transition: opacity var(--dur-normal) var(--ease-soft),
              box-shadow var(--dur-normal) var(--ease-soft);
}

.light-bridge-line.bright {
  opacity: 1;
  width: 8rpx;
  box-shadow: 0 0 24rpx rgba(200,153,62,0.5),
              0 0 48rpx rgba(200,153,62,0.2);
  background: linear-gradient(
    to bottom,
    var(--amber) 0%,
    var(--gold) 25%,
    #FFFFFF 50%,
    var(--gold) 75%,
    var(--rose) 100%
  );
}

.light-bridge-line.steady {
  opacity: 0.7;
  box-shadow: 0 0 16rpx var(--gold-lt);
}

.light-bridge-line.faint {
  opacity: 0.2;
  box-shadow: none;
  width: 3rpx;
}

.light-bridge-line.one-sided-a {
  opacity: 0.5;
  background: linear-gradient(to bottom, var(--amber), var(--gold), transparent);
}
.light-bridge-line.one-sided-b {
  opacity: 0.5;
  background: linear-gradient(to bottom, transparent, var(--gold), var(--rose));
}

.bridge-node {
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0.5;
  left: 50%;
  transform: translateX(-50%);
}
.bridge-node-top { top: -2rpx; }
.bridge-node-bottom { bottom: -2rpx; }
.bridge-node.active-a { background: var(--amber); box-shadow: 0 0 12rpx rgba(224,123,62,0.4); }
.bridge-node.active-b { background: var(--rose); box-shadow: 0 0 12rpx rgba(212,128,104,0.4); }

.anim-bridge {
  animation: bridgePulse 3s var(--ease-soft) infinite;
}

@keyframes bridgePulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
</style>
