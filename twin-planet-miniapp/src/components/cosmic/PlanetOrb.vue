<!--
  PlanetOrb · 专业级天体渲染
  - 6层 radial-gradient 真实感球体（高光→漫反射→次表面散射→边缘光）
  - 8层 box-shadow 大气光晕（1/r² 衰减）
  - 4层微渐变表面纹理（Moire 噪点）
  - 多层 text-shadow 发光排版
  - 轨道环 36 段圆点（进度可视化）
-->
<template>
  <view class="planet-wrapper" :class="{ interactive }"
    :style="{ width: totalSize + 'rpx', height: totalSize + 'rpx' }"
    @click="$emit('click')"
  >
    <!-- 大气光晕（box-shadow 替代 border） -->
    <view class="planet-atmo" :class="[`atmo-${twin}`, { 'atmo-pulse': atmosphere }]" />

    <!-- 轨道环 -->
    <view v-if="showOrbitRing" class="orbit-segments">
      <view v-for="seg in 36" :key="seg" class="orbit-dot" :style="orbitDotStyle(seg)" />
    </view>

    <!-- 主球体 -->
    <view class="planet-orb" :class="[{ 'anim-breathe': running }]" :style="sphereStyle">
      <!-- 高光新月 (::before 等效层) -->
      <view class="orb-specular" />
      <!-- 表面纹理 -->
      <view class="orb-grain" />
      <!-- 暗面阴影 -->
      <view class="orb-shadow" />
      <!-- 标签 -->
      <text v-if="label" class="planet-label" :class="`label-${twin}`">{{ label }}</text>
      <slot>
        <text v-if="!label && initialText" class="planet-initial" :class="`initial-${twin}`">{{ initialText }}</text>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color?: string; size?: number; label?: string; initialText?: string
  glowing?: boolean; running?: boolean; atmosphere?: boolean
  atmosphereType?: 'a' | 'b' | 'green'; orbitRing?: number
  biome?: 'ocean' | 'mountain' | 'forest' | 'cloud' | 'barren'
  level?: number; interactive?: boolean; twin?: 'a' | 'b'
}>(), { color: '#FF6B35', size: 120, interactive: true, twin: 'a' })

defineEmits<{ click: [] }>()

const totalSize = computed(() => props.size + 56)
const showOrbitRing = computed(() => props.orbitRing !== undefined && props.orbitRing > 0)

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '')
  return `rgba(${parseInt(c.substring(0,2),16)},${parseInt(c.substring(2,4),16)},${parseInt(c.substring(4,6),16)},${alpha})`
}

/** 6 层光照模型基色 */
const sphereStyle = computed(() => {
  const s = props.size; const c = props.color
  return {
    width: s + 'rpx', height: s + 'rpx',
    background: `
      radial-gradient(circle at 32% 28%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 4%, rgba(255,255,255,0.08) 10%, transparent 20%),
      radial-gradient(circle at 38% 34%, ${hexToRgba(c,0.85)} 0%, ${c} 40%, ${hexToRgba(c,0.35)} 75%, ${hexToRgba(c,0.1)} 100%),
      radial-gradient(circle at 68% 72%, ${hexToRgba(c,0.25)} 0%, transparent 55%)
    `,
  }
})

function orbitDotStyle(seg: number) {
  const progress = Math.min(props.orbitRing || 0, 1)
  const lit = seg <= Math.floor(progress * 36)
  const angle = ((seg - 1) / 36) * 360
  const radius = props.size / 2 + 16
  return {
    transform: `rotate(${angle}deg) translateY(${-radius}rpx)`,
    background: lit ? props.color : 'transparent',
    borderColor: lit ? props.color : 'var(--border-void)',
    opacity: lit ? 0.9 : 0.2,
    boxShadow: lit ? `0 0 6rpx ${hexToRgba(props.color, 0.5)}` : 'none',
  }
}
</script>

<style scoped>
.planet-wrapper { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.planet-wrapper.interactive:active { transform: scale(0.94); transition: transform 0.15s ease; }

/* ================================================================
   大气光晕 — 零尺寸元素 + 8 层 box-shadow (1/r² 衰减)
   ================================================================ */
.planet-atmo {
  position: absolute; top: 50%; left: 50%; width: 0; height: 0;
  border-radius: 50%; transform: translate(-50%, -50%);
  pointer-events: none; z-index: 0;
  transition: box-shadow 0.6s var(--ease-pulse);
}
.atmo-a {
  box-shadow:
    0 0 8rpx 6rpx    rgba(255,140,90,0.45),
    0 0 18rpx 10rpx  rgba(255,120,70,0.28),
    0 0 32rpx 18rpx  rgba(255,107,53,0.16),
    0 0 50rpx 28rpx  rgba(255,100,50,0.09),
    0 0 72rpx 40rpx  rgba(255,90,45,0.05),
    0 0 98rpx 56rpx  rgba(255,80,40,0.025),
    0 0 130rpx 76rpx rgba(255,70,35,0.012),
    0 0 170rpx 100rpx rgba(255,60,30,0.006);
}
.atmo-b {
  box-shadow:
    0 0 8rpx 6rpx    rgba(180,130,255,0.45),
    0 0 18rpx 10rpx  rgba(170,110,250,0.28),
    0 0 32rpx 18rpx  rgba(168,85,247,0.16),
    0 0 50rpx 28rpx  rgba(155,70,240,0.09),
    0 0 72rpx 40rpx  rgba(140,60,230,0.05),
    0 0 98rpx 56rpx  rgba(130,50,220,0.025),
    0 0 130rpx 76rpx rgba(120,40,210,0.012),
    0 0 170rpx 100rpx rgba(110,30,200,0.006);
}
.atmo-green {
  box-shadow:
    0 0 8rpx 6rpx    rgba(50,255,180,0.45),
    0 0 18rpx 10rpx  rgba(30,240,160,0.28),
    0 0 32rpx 18rpx  rgba(0,255,163,0.16),
    0 0 50rpx 28rpx  rgba(0,230,145,0.09),
    0 0 72rpx 40rpx  rgba(0,200,130,0.05),
    0 0 98rpx 56rpx  rgba(0,180,115,0.025),
    0 0 130rpx 76rpx rgba(0,160,100,0.012),
    0 0 170rpx 100rpx rgba(0,140,85,0.006);
}

/* 脉冲大气（计时器运行时） */
.atmo-pulse.atmo-a { animation: atmoBreatheA 3s var(--ease-pulse) infinite; }
.atmo-pulse.atmo-b { animation: atmoBreatheB 3s var(--ease-pulse) infinite 0.5s; }
.atmo-pulse.atmo-green { animation: atmoBreatheGreen 3s var(--ease-pulse) infinite; }

@keyframes atmoBreatheA {
  0%,100% { box-shadow: 0 0 8rpx 6rpx rgba(255,140,90,0.45),0 0 18rpx 10rpx rgba(255,120,70,0.28),0 0 32rpx 18rpx rgba(255,107,53,0.16),0 0 50rpx 28rpx rgba(255,100,50,0.09),0 0 72rpx 40rpx rgba(255,90,45,0.05),0 0 98rpx 56rpx rgba(255,80,40,0.025),0 0 130rpx 76rpx rgba(255,70,35,0.012),0 0 170rpx 100rpx rgba(255,60,30,0.006); }
  50%     { box-shadow: 0 0 12rpx 8rpx rgba(255,150,100,0.6),0 0 26rpx 14rpx rgba(255,130,80,0.4),0 0 42rpx 24rpx rgba(255,110,60,0.26),0 0 62rpx 36rpx rgba(255,105,55,0.16),0 0 86rpx 50rpx rgba(255,95,48,0.09),0 0 114rpx 68rpx rgba(255,85,42,0.05),0 0 148rpx 90rpx rgba(255,75,38,0.025),0 0 190rpx 116rpx rgba(255,65,32,0.012); }
}
@keyframes atmoBreatheB {
  0%,100% { box-shadow: 0 0 8rpx 6rpx rgba(180,130,255,0.45),0 0 18rpx 10rpx rgba(170,110,250,0.28),0 0 32rpx 18rpx rgba(168,85,247,0.16),0 0 50rpx 28rpx rgba(155,70,240,0.09),0 0 72rpx 40rpx rgba(140,60,230,0.05),0 0 98rpx 56rpx rgba(130,50,220,0.025),0 0 130rpx 76rpx rgba(120,40,210,0.012),0 0 170rpx 100rpx rgba(110,30,200,0.006); }
  50%     { box-shadow: 0 0 12rpx 8rpx rgba(200,150,255,0.6),0 0 26rpx 14rpx rgba(185,125,255,0.4),0 0 42rpx 24rpx rgba(175,95,250,0.26),0 0 62rpx 36rpx rgba(165,80,245,0.16),0 0 86rpx 50rpx rgba(155,65,235,0.09),0 0 114rpx 68rpx rgba(145,50,225,0.05),0 0 148rpx 90rpx rgba(135,40,215,0.025),0 0 190rpx 116rpx rgba(125,30,205,0.012); }
}
@keyframes atmoBreatheGreen {
  0%,100% { box-shadow: 0 0 8rpx 6rpx rgba(50,255,180,0.45),0 0 18rpx 10rpx rgba(30,240,160,0.28),0 0 32rpx 18rpx rgba(0,255,163,0.16),0 0 50rpx 28rpx rgba(0,230,145,0.09),0 0 72rpx 40rpx rgba(0,200,130,0.05),0 0 98rpx 56rpx rgba(0,180,115,0.025),0 0 130rpx 76rpx rgba(0,160,100,0.012),0 0 170rpx 100rpx rgba(0,140,85,0.006); }
  50%     { box-shadow: 0 0 12rpx 8rpx rgba(80,255,200,0.6),0 0 26rpx 14rpx rgba(50,250,170,0.4),0 0 42rpx 24rpx rgba(20,255,165,0.26),0 0 62rpx 36rpx rgba(10,240,150,0.16),0 0 86rpx 50rpx rgba(5,220,135,0.09),0 0 114rpx 68rpx rgba(0,200,120,0.05),0 0 148rpx 90rpx rgba(0,180,105,0.025),0 0 190rpx 116rpx rgba(0,160,90,0.012); }
}

/* ================================================================
   轨道环
   ================================================================ */
.orbit-segments { position: absolute; inset: 0; z-index: 0; }
.orbit-dot {
  position: absolute; top: 50%; left: 50%;
  width: 6rpx; height: 6rpx; margin-left: -3rpx; margin-top: -3rpx;
  border-radius: 50%; border: 1rpx solid var(--border-void);
  transition: background 0.4s ease, border-color 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease;
}

/* ================================================================
   主球体 — 6 层光照模型
   ================================================================ */
.planet-orb {
  position: relative; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 1; overflow: hidden;
  transition: transform 0.5s var(--ease-spring), box-shadow 0.6s var(--ease-pulse);
  /* Layer 1-3: Specular + Body + Subsurface (set by inline style) */
  /* Layer 4: Ambient occlusion (inset shadow) */
  box-shadow:
    inset 0 -8rpx 24rpx rgba(0,0,0,0.45),
    inset 0 0 48rpx rgba(0,0,0,0.12);
}

/* 高光新月 */
.orb-specular {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none; z-index: 3;
  background: radial-gradient(circle at 28% 24%,
    rgba(255,255,255,0.65) 0%,
    rgba(255,255,255,0.2) 5%,
    transparent 14%
  );
}
/* 表面纹理 — Moire 噪点 */
.orb-grain {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none; z-index: 2; opacity: 0.05;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 2rpx, rgba(255,255,255,0.3) 2rpx, rgba(255,255,255,0.3) 3rpx),
    repeating-linear-gradient(37deg, transparent, transparent 2rpx, rgba(0,0,0,0.2) 2rpx, rgba(0,0,0,0.2) 3rpx),
    repeating-linear-gradient(73deg, transparent, transparent 3rpx, rgba(255,255,255,0.15) 3rpx, rgba(255,255,255,0.15) 4rpx),
    repeating-linear-gradient(110deg, transparent, transparent 2rpx, rgba(0,0,0,0.15) 2rpx, rgba(0,0,0,0.15) 3rpx);
}
/* 暗面阴影 + 边缘光 */
.orb-shadow {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none; z-index: 1;
  background:
    radial-gradient(circle at 70% 74%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 45%, transparent 70%),
    radial-gradient(circle at 74% 70%, transparent 88%, rgba(255,255,255,0.03) 94%, transparent 100%);
}

/* ================================================================
   排版 — 多层发光
   ================================================================ */
.planet-label {
  position: relative; z-index: 4;
  font-size: var(--font-body); font-weight: 700; color: #FFFFFF;
  letter-spacing: 2rpx; max-width: 75%; text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.label-a { text-shadow: 0 0 4rpx rgba(255,255,255,0.9),0 0 8rpx rgba(255,140,90,0.5),0 0 16rpx rgba(255,107,53,0.3),0 2rpx 6rpx rgba(0,0,0,0.5); }
.label-b { text-shadow: 0 0 4rpx rgba(255,255,255,0.9),0 0 8rpx rgba(180,130,255,0.5),0 0 16rpx rgba(168,85,247,0.3),0 2rpx 6rpx rgba(0,0,0,0.5); }

.planet-initial {
  position: relative; z-index: 4;
  font-size: 52rpx; font-weight: 900; color: #FFFFFF;
  letter-spacing: -1rpx;
}
.initial-a { text-shadow: 0 0 4rpx rgba(255,255,255,0.9),0 0 10rpx rgba(255,140,90,0.5),0 0 20rpx rgba(255,107,53,0.3),0 0 36rpx rgba(255,107,53,0.12),0 2rpx 8rpx rgba(0,0,0,0.5); }
.initial-b { text-shadow: 0 0 4rpx rgba(255,255,255,0.9),0 0 10rpx rgba(180,130,255,0.5),0 0 20rpx rgba(168,85,247,0.3),0 0 36rpx rgba(168,85,247,0.12),0 2rpx 8rpx rgba(0,0,0,0.5); }
</style>
