<!--
  星座轮盘 · ConstellationWheel
  放射状动作选择器。围绕选中星球出现的 6 个星座（星点连线）。

  Props:
    actions    - [{ key, emoji, label }] 动作列表
    twin       - 'a' | 'b' 双胞胎标识（影响主色调）
    activeKey  - 当前激活的星座 key
    visible    - 是否显示轮盘
    selectedPlanets - 'a' | 'b' | 'both' 当前选中的星球

  Events:
    @select    - 用户选择星座 (key)
-->
<template>
  <view v-if="visible" class="constellation-wheel">
    <!-- 中心指示 -->
    <view class="wheel-center" :class="`twin-${twin}`">
      <text class="wheel-center-text">{{ centerLabel }}</text>
    </view>

    <!-- 星座点 + 连线 -->
    <view
      v-for="(action, index) in actions"
      :key="action.key"
      class="constellation-item"
      :class="{ active: activeKey === action.key }"
      :style="getPosition(index, actions.length)"
      @click="$emit('select', action.key)"
    >
      <!-- 连线到中心 -->
      <view class="constellation-line" :style="getLineStyle(index, actions.length)" />

      <!-- 星座点 -->
      <view class="constellation-node" :class="`twin-${twin}`">
        <text class="constellation-emoji">{{ action.emoji }}</text>
      </view>

      <!-- 标签 -->
      <text class="constellation-label">{{ action.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ConstellationAction {
  key: string
  emoji: string
  label: string
}

const props = withDefaults(defineProps<{
  actions?: ConstellationAction[]
  twin?: 'a' | 'b'
  activeKey?: string
  visible?: boolean
  selectedPlanets?: 'a' | 'b' | 'both'
}>(), {
  actions: () => [],
  twin: 'a',
  activeKey: '',
  visible: false,
  selectedPlanets: 'a',
})

defineEmits<{ select: [key: string] }>()

const centerLabel = computed(() => {
  if (props.selectedPlanets === 'both') return '双星'
  return props.twin === 'a' ? '大宝' : '二宝'
})

/**
 * 计算每个星座在轮盘上的位置。
 * 使用固定角度分布，6 个动作均匀围绕上半圆 (210° → 330°，底部留给星球)。
 */
function getPosition(index: number, total: number) {
  // 星座分布在上半圆: 从 210° 到 330° (逆时针，顶部 = 270°)
  const startAngle = 210
  const endAngle = 330
  const angleRange = endAngle - startAngle
  const step = total > 1 ? angleRange / (total - 1) : 0
  const angle = startAngle + step * index
  const rad = (angle * Math.PI) / 180
  const radius = 160 // rpx

  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius

  return {
    transform: `translate(${x}rpx, ${y}rpx)`,
  }
}

function getLineStyle(index: number, total: number) {
  const startAngle = 210
  const endAngle = 330
  const angleRange = endAngle - startAngle
  const step = total > 1 ? angleRange / (total - 1) : 0
  const angle = startAngle + step * index
  const rad = (angle * Math.PI) / 180
  const radius = 160

  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  const length = Math.sqrt(x * x + y * y)
  const rotation = (Math.atan2(y, x) * 180) / Math.PI

  return {
    width: length + 'rpx',
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    transformOrigin: 'left center',
  }
}
</script>

<style scoped>
.constellation-wheel {
  position: relative;
  width: 400rpx;
  height: 400rpx;
  margin: 32rpx auto;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80rpx;
  height: 80rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.wheel-center.twin-a {
  background: rgba(255,107,53,0.15);
  border: 2rpx solid rgba(255,107,53,0.3);
}
.wheel-center.twin-b {
  background: rgba(168,85,247,0.15);
  border: 2rpx solid rgba(168,85,247,0.3);
}

.wheel-center-text {
  font-size: var(--font-caption);
  font-weight: 700;
  color: var(--text-starlight);
}

.constellation-item {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  transition: transform var(--dur-quick) var(--ease-spring);
}
.constellation-item:active {
  transform: scale(0.9);
}

/* 连线 */
.constellation-line {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 1rpx;
  background: var(--border-void);
  opacity: 0.3;
  pointer-events: none;
}
.constellation-item.active .constellation-line {
  background: var(--cosmic-cyan);
  opacity: 0.6;
}

/* 星点 */
.constellation-node {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-card);
  border: 2rpx solid var(--border-void);
  transition: border-color var(--dur-quick), box-shadow var(--dur-quick);
  z-index: 1;
}
.constellation-node.twin-a { border-color: rgba(255,107,53,0.2); }
.constellation-node.twin-b { border-color: rgba(168,85,247,0.2); }

.constellation-item.active .constellation-node {
  border-color: var(--cosmic-cyan);
  box-shadow: 0 0 20rpx rgba(0,229,255,0.2);
}

.constellation-emoji {
  font-size: 28rpx;
}

/* 标签 */
.constellation-label {
  font-size: var(--font-caption);
  color: var(--text-whisper);
  margin-top: 4rpx;
  white-space: nowrap;
}

.constellation-item.active .constellation-label {
  color: var(--text-starlight);
}
</style>
