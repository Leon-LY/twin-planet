// 构建后处理: 复制原生 custom-tab-bar 到 dist（uni-app 不编译此目录）
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'native', 'custom-tab-bar');
const dest = path.join(__dirname, 'dist', 'build', 'mp-weixin', 'custom-tab-bar');

try {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const files = fs.readdirSync(src).filter(f => f !== 'index.vue');
  for (const file of files) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
    console.log(`[copy-tabbar] ${file}`);
  }
} catch(e) { console.error('[copy-tabbar] Error:', e.message); }
