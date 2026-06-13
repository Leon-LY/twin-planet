<!--
  星球组件 · PlanetOrb
  可复用的天体渲染器。

  轨道环用分段圆点技术 — 36 个圆点均匀分布在圆周上，
  按进度点亮。每个圆点 = transform: rotate + translateY。
  只用了 border-radius + background + transform。
  微信 WXSS 完全兼容。

  Props:
    color      - 星球颜色
    size       - 星球直径 (rpx)
    label      - 星球标签文字
    running    - 计时器运行中
    atmosphere - 大气层脉冲环
    orbitRing  - 轨道环进度 0-1
    biome      - 表面生物群系类型
    interactive - 是否可交互
-->
<template>
  <view
    class="planet-wrapper"
    :class="{ interactive }"
    :style="{ width: totalSize + 'rpx', height: totalSize + 'rpx' }"
    @click="$emit('click')"
  >
    <!--
      轨道环 — 分段圆点
      36 个圆点，每个占 10°，按 orbitRing 进度亮起
    -->
    <view v-if="showOrbitRing" class="orbit-segments">
      <view
        v-for="seg in 36"
        :key="seg"
        class="orbit-dot"
        :style="orbitDotStyle(seg)"
      />
    </view>

    <!-- 主球体 -->
    <view
      class="planet-orb"
      :class="[{ 'anim-breathe': running }, biomeClass]"
      :style="planetStyle"
    >
      <view v-if="biome" class="planet-surface" />
      <text v-if="label" class="planet-label">{{ label }}</text>
      <slot>
        <text v-if="!label && initialText" class="planet-initial">{{ initialText }}</text>
      </slot>
    </view>

    <!-- 计时脉冲光环 -->
    <view v-if="running" class="planet-halo" :class="runningClass" />
    <!-- 大气层脉冲 -->
    <view v-if="atmosphere" class="planet-atmosphere" :class="atmosphereClass" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color?: string
  size?: number
  label?: string
  initialText?: string
  glowing?: boolean
  running?: boolean
  atmosphere?: boolean
  atmosphereType?: 'a' | 'b' | 'green'
  orbitRing?: number
  biome?: 'ocean' | 'mountain' | 'forest' | 'cloud' | 'barren'
  level?: number
  interactive?: boolean
  twin?: 'a' | 'b'
}>(), {
  color: 'var(--twin-a)',
  size: 120,
  interactive: true,
  twin: 'a',
})

defineEmits<{ click: [] }>()

const totalSize = computed(() => props.size + 48)
const showOrbitRing = computed(() => props.orbitRing !== undefined && props.orbitRing > 0)

const planetStyle = computed(() => ({
  width: props.size + 'rpx',
  height: props.size + 'rpx',
  background: `radial-gradient(circle at 35% 35%, ${props.color}66, ${props.color} 70%, ${props.color}88 100%)`,
  boxShadow: props.glowing
    ? `0 0 ${props.size * 0.3}rpx ${props.color}44, 0 0 ${props.size * 0.15}rpx ${props.color}22`
    : 'none',
}))

/**
 * 轨道环分段圆点
 * 36 段 = 每段 10°
 * 圆点定位：先旋转到对应角度，再沿 Y 轴负方向平移半径距离
 */
function orbitDotStyle(seg: number) {
  const total = 36
  const progress = Math.min(props.orbitRing || 0, 1)
  const litCount = Math.floor(progress * total)
  const isLit = seg <= litCount
  const angle = ((seg - 1) / total) * 360
  const radius = props.size / 2 + 14

  return {
    transform: `rotate(${angle}deg) translateY(${-radius}rpx)`,
    background: isLit ? props.color : 'transparent',
    borderColor: isLit ? props.color : 'var(--border-void)',
    opacity: isLit ? 1 : 0.3,
  }
}

const biomeClass = computed(() => props.biome ? `biome-${props.biome}` : '')
const runningClass = computed(() => props.twin === 'a' ? 'running-a' : 'running-b')
const atmosphereClass = computed(() => {
  if (props.atmosphereType === 'green') return 'pulse-green'
  return props.twin === 'a' ? 'pulse-a' : 'pulse-b'
})
</script>

<style scoped>
.planet-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.planet-wrapper.interactive:active {
  transform: scale(0.94);
  transition: transform 0.15s ease;
}

/* ============================================
   轨道环 — 分段圆点
   每个圆点绝对定位于圆心，rotate + translateY 送出到圆周
   ============================================ */
.orbit-segments {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.orbit-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6rpx;
  height: 6rpx;
  margin-left: -3rpx;
  margin-top: -3rpx;
  border-radius: 50%;
  border: 1rpx solid var(--border-void);
  transition: background 0.3s ease, border-color 0.3s ease, opacity 0.3s ease;
}

/* ============================================
   主球体
   ============================================ */
.planet-orb {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: transform var(--dur-flow) var(--ease-orbit),
              box-shadow var(--dur-flow) var(--ease-orbit);
  overflow: hidden;
}

.planet-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.2;
}

/* 生物群系 */
.biome-ocean .planet-surface {
  background:
    radial-gradient(circle at 20% 30%, rgba(0,229,255,0.35) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(0,229,255,0.15) 0%, transparent 40%);
}
.biome-mountain .planet-surface {
  background:
    radial-gradient(circle at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 40%),
    radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 30%);
}
.biome-forest .planet-surface {
  background:
    radial-gradient(circle at 40% 50%, rgba(0,255,163,0.25) 0%, transparent 45%),
    radial-gradient(circle at 60% 40%, rgba(0,255,163,0.12) 0%, transparent 35%);
}
.biome-cloud .planet-surface {
  background:
    radial-gradient(circle at 30% 40%, rgba(255,255,255,0.18) 0%, transparent 50%),
    radial-gradient(circle at 60% 50%, rgba(255,255,255,0.08) 0%, transparent 40%);
}
.biome-barren .planet-surface {
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%);
}

.planet-label {
  font-size: var(--font-body);
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.5);
  z-index: 1;
  max-width: 80%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.planet-initial {
  font-size: 48rpx;
  font-weight: 800;
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.5);
  z-index: 1;
}

/* 计时脉冲光环 */
.planet-halo {
  position: absolute;
  inset: -8rpx;
  border-radius: 50%;
  border: 4rpx solid;
  pointer-events: none;
  z-index: 0;
}
.planet-halo.running-a {
  border-color: var(--twin-a);
  animation: planetBreathe var(--dur-breathe) var(--ease-pulse) infinite;
}
.planet-halo.running-b {
  border-color: var(--twin-b);
  animation: planetBreathe var(--dur-breathe) var(--ease-pulse) infinite;
}

/* 大气层脉冲 */
.planet-atmosphere {
  position: absolute;
  inset: -16rpx;
  border-radius: 50%;
  border: 3rpx solid;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}
.planet-atmosphere.pulse-a {
  border-color: var(--twin-a);
  animation: haloExpand 1.5s var(--ease-pulse) infinite;
}
.planet-atmosphere.pulse-b {
  border-color: var(--twin-b);
  animation: haloExpand 1.5s var(--ease-pulse) infinite;
}
.planet-atmosphere.pulse-green {
  border-color: var(--cosmic-green);
  animation: haloExpand 1.5s var(--ease-pulse) infinite;
}
</style>
