import { createApp as createVueApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 微信基础库兼容：__route__ 在 3.10/3.15 版本可能未注入
if (typeof globalThis !== 'undefined' && !globalThis.__route__) {
  globalThis.__route__ = ''
}

export function createApp() {
  const app = createVueApp(App)
  app.use(createPinia())

  app.config.errorHandler = (err, _vm, info) => {
    console.error('[双宝星球] 全局错误:', err)
    console.error('[双宝星球] 错误信息:', info)
  }

  return { app }
}
