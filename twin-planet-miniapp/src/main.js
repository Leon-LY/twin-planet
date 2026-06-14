import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())

  // 全局错误边界
  app.config.errorHandler = (err, _vm, info) => {
    console.error('[双宝星球] 全局错误:', err)
    console.error('[双宝星球] 错误信息:', info)
  }

  return { app }
}
