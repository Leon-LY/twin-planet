/**
 * Post-build: 将 echarts.min.js（492KB）从主包 static/ 搬运到 growth 分包
 * 避免计入主包体积限制。WeChat require.async 从分包按需加载。
 */
const fs = require('fs')
const path = require('path')

const src = path.resolve(__dirname, 'dist/build/mp-weixin/static/echarts/echarts.min.js')
const destDir = path.resolve(__dirname, 'dist/build/mp-weixin/pages/growth')
const dest = path.join(destDir, 'echarts.min.js')
const srcDir = path.dirname(src)

if (!fs.existsSync(src)) {
  console.log('[copy-echarts] Source not found, skip.')
  process.exit(0)
}

fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(src, dest)
fs.unlinkSync(src)
// 清理空目录
try { fs.rmdirSync(srcDir) } catch {}
console.log('[copy-echarts] echarts.min.js → pages/growth/ (subpackage, removed from main)')
