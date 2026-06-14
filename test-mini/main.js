import { createSSRApp } from 'vue'
export function createApp() { return createSSRApp(require('./App.vue').default) }
