<template>
  <view class="j-page-header">
    <view v-if="$slots.icon || icon" class="j-page-icon">
      <slot name="icon">
        <!-- 如果 icon 是 emoji 或者普通文本，直接当文字渲染；否则当 iconfont 类名 -->
        <text v-if="isEmoji" class="j-page-emoji">{{ icon }}</text>
        <text v-else class="iconfont" :class="icon"></text>
      </slot>
    </view>
    <view class="j-page-titles">
      <text class="j-page-title">{{ title }}</text>
      <text v-if="subtitle" class="j-page-subtitle">{{ subtitle }}</text>
    </view>
    <view v-if="$slots.extra" class="j-page-extra">
      <slot name="extra" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon?: string
  title: string
  subtitle?: string
}>()

const isEmoji = computed(() => {
  const i = props.icon
  if (!i) return false
  // emoji 检测：包含 emoji 范围的 Unicode 字符，或不是 icon- 前缀
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{2000}-\u{2BFF}\u{FE00}-\u{FEFF}\u{2300}-\u{23FF}\u{2934}\u{2935}\u{25AA}\u{25AB}\u{25FB}\u{25FC}\u{25FE}\u{25FD}\u{2B05}\u{2B06}\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/u.test(i) || !i.startsWith('icon-')
})
</script>

<style scoped>
.j-page-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx dashed var(--dot);
}
.j-page-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--amber);
}
.j-page-emoji {
  font-size: 36rpx;
}
.j-page-titles {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.j-page-title {
  font-family: var(--font-journal);
  font-size: var(--font-title);
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -1rpx;
}
.j-page-subtitle {
  font-size: var(--font-caption);
  color: var(--ink-md);
}
.j-page-extra {
  flex-shrink: 0;
}
</style>
