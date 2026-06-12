import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())

  // 路由守卫：App.vue onLaunch 中处理
  return { app }
}
