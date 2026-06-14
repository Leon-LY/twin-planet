// 构建后处理: 从编译产物中移除 WXSS 不兼容的 font-large 选择器
const fs = require('fs');
const path = 'dist/build/mp-weixin/app.wxss';
try {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace('.font-large *{animation-duration:0s!important;transition-duration:0s!important}','');
  content = content.replace('.font-large .bg-spot,.font-large .page-enter{animation:none!important}','');
  fs.writeFileSync(path, content, 'utf8');
  console.log('[strip-wxss] Cleaned font-large selectors');
} catch(e) { console.error('[strip-wxss] Error:', e.message); }
