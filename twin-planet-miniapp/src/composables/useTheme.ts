/**
 * useTheme — 宇宙苗圃主题系统
 * 管理：暗色/亮色模式、大字模式、减动模式
 */
import { computed, type ComputedRef } from 'vue'
import { useUserStore } from '@/stores/user'

function isNightHours(): boolean {
  const hour = new Date().getHours()
  return hour >= 22 || hour < 6
}

export function useTheme(): {
  themeClass: ComputedRef<string>
  isDark: ComputedRef<boolean>
  isLarge: ComputedRef<boolean>
  reduceMotion: ComputedRef<boolean>
} {
  const userStore = useUserStore()

  const isDark = computed(() => {
    const autoNight = userStore.profile?.uiConfig?.autoNightMode ?? true
    return autoNight ? isNightHours() : false
  })

  const isLarge = computed(() => {
    return userStore.isGrandmaMode || (userStore.profile?.uiConfig?.fontSize ?? 14) >= 18
  })

  const reduceMotion = computed(() => {
    return userStore.profile?.uiConfig?.reduceMotion ?? false
  })

  const themeClass = computed(() => {
    const classes: string[] = ['page-root']
    if (isDark.value) classes.push('theme-dark')
    if (isLarge.value) classes.push('font-large')
    if (reduceMotion.value) classes.push('reduce-motion')
    return classes.join(' ')
  })

  return { themeClass, isDark, isLarge, reduceMotion }
}
