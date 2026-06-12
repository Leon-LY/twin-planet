<script setup lang="ts">
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  // 检查登录状态，决定启动页
  const userStore = useUserStore()
  // 开发阶段默认进入 login，后续接入真实登录后在此判断
  // if (!userStore.isLoggedIn) { uni.reLaunch({ url: '/pages/login/index' }) }
})
</script>

<style>
/* 全局公共样式 */
page {
  background: #FFFBF5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
