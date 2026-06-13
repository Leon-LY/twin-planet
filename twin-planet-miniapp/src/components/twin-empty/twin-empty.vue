<template>
  <view class="empty-state">
    <text class="es-emoji">{{ emoji }}</text>
    <text class="es-title">{{ title }}</text>
    <text class="es-desc">{{ desc }}</text>
    <text class="es-whisper" v-if="whisper">{{ whisper }}</text>
    <view class="es-action" v-if="$slots.action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  emoji: string
  title: string
  desc: string
  whisper?: string
}>()
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 80rpx var(--space-md);
}
.es-emoji {
  font-size: 64rpx;
}
.es-title {
  display: block;
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-starlight);
  margin: var(--space-sm) 0 var(--space-xs);
  line-height: var(--leading-tight);
}
.es-desc {
  font-size: var(--font-base);
  color: var(--text-dust);
  line-height: var(--leading-relaxed);
}
.es-whisper {
  display: block;
  font-size: var(--font-sm);
  color: var(--text-whisper);
  margin-top: var(--space-xs);
  font-style: italic;
}
.es-action {
  margin-top: var(--space-md);
}
</style>
