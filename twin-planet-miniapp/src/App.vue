<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  // 检查登录状态，决定启动页
  // 开发阶段暂不强制路由跳转
  // const userStore = useUserStore()
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
