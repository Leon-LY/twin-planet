<!--
  星尘粒子 · StardustParticles
  记录完成时的星光粒子爆发效果。纯 CSS 实现。

  Props:
    count   - 粒子数量
    color   - 粒子颜色: 'amber' | 'violet' | 'gold' | 'cyan' | 'mixed'
    trigger - 大于 0 时触发粒子爆发 (通常用递增计数器)
-->
<template>
  <view class="stardust-container" aria-hidden="true">
    <view
      v-for="p in particles"
      :key="p.id"
      class="stardust-particle"
      :class="[p.colorClass]"
      :style="{
        left: p.originX + '%',
        top: p.originY + '%',
        '--arc-x': p.arcX + 'rpx',
        '--arc-y': p.arcY + 'rpx',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        width: p.size + 'rpx',
        height: p.size + 'rpx',
      }"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'

const props = withDefaults(defineProps<{
  count?: number
  color?: 'amber' | 'violet' | 'gold' | 'cyan' | 'mixed'
  trigger?: number
}>(), {
  count: 12,
  color: 'mixed',
  trigger: 0,
})

interface Particle {
  id: number
  originX: number
  originY: number
  arcX: number
  arcY: number
  delay: number
  duration: number
  size: number
  colorClass: string
}

const colorList = ['amber', 'violet', 'gold', 'cyan']
const particles = ref<Particle[]>([])

function generateParticles(): Particle[] {
  const result: Particle[] = []
  for (let i = 0; i < props.count; i++) {
    const angle = (Math.PI * 2 * i) / props.count + (Math.random() - 0.5) * 0.5
    const distance = 60 + Math.random() * 80
    const colorKey = props.color === 'mixed'
      ? colorList[i % 4]
      : props.color
    result.push({
      id: i,
      originX: 50,
      originY: 50,
      arcX: Math.cos(angle) * distance,
      arcY: Math.sin(angle) * distance,
      delay: Math.random() * 0.15,
      duration: 0.5 + Math.random() * 0.5,
      size: 4 + Math.random() * 6,
      colorClass: colorKey,
    })
  }
  return result
}

watch(() => props.trigger, (newVal) => {
  if (newVal > 0) {
    particles.value = generateParticles()
  }
}, { immediate: false })

// 初始不显示粒子
</script>

<style scoped>
.stardust-container {
  position: absolute;
  inset: -40rpx;
  pointer-events: none;
  overflow: visible;
}

.stardust-particle {
  position: absolute;
  border-radius: 50%;
  animation: stardustArc var(--dur-stardust) var(--ease-stardust) both;
}

.stardust-particle.amber {
  background: var(--twin-a);
  box-shadow: 0 0 8rpx var(--twin-a-glow);
}
.stardust-particle.violet {
  background: var(--twin-b);
  box-shadow: 0 0 8rpx var(--twin-b-glow);
}
.stardust-particle.gold {
  background: var(--cosmic-gold);
  box-shadow: 0 0 8rpx rgba(255,210,63,0.4);
}
.stardust-particle.cyan {
  background: var(--cosmic-cyan);
  box-shadow: 0 0 8rpx rgba(0,229,255,0.4);
}

@keyframes stardustArc {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translate(calc(var(--arc-x) * 0.3), calc(var(--arc-y) * 0.3)) scale(1.2);
  }
  100% {
    transform: translate(var(--arc-x), var(--arc-y)) scale(0);
    opacity: 0;
  }
}
</style>
