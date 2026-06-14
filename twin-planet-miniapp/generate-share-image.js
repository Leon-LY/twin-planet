// 生成分享品牌图 400x320
const { createCanvas } = require('canvas') || {};
if (!createCanvas) {
  console.log('Canvas not available. Install with: npm install canvas');
  console.log('Creating placeholder...');
  // Fallback: create a minimal valid PNG (amber colored)
  const fs = require('fs');
  // Minimal PNG: 1x1 amber pixel base64
  const miniPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==', 'base64');
  fs.writeFileSync('static/share-brand.png', miniPng);
  console.log('Placeholder created at static/share-brand.png');
  process.exit(0);
}

const canvas = createCanvas(400, 320);
const ctx = canvas.getContext('2d');

// Background - warm paper
ctx.fillStyle = '#FEF9F0';
ctx.fillRect(0, 0, 400, 320);

// Decorative border
ctx.strokeStyle = '#E8DCC8';
ctx.lineWidth = 2;
ctx.setLineDash([4, 4]);
ctx.strokeRect(20, 20, 360, 280);

// "双" stamp circle
ctx.fillStyle = '#E07B3E';
ctx.beginPath();
ctx.arc(200, 120, 50, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 48px "KaiTi", "STKaiti", serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('双', 200, 120);

// Main title
ctx.fillStyle = '#2D2318';
ctx.font = 'bold 32px "Georgia", "KaiTi", serif';
ctx.fillText('双宝手帐', 200, 210);

// Subtitle
ctx.fillStyle = '#9C8E7C';
ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
ctx.fillText('中国首款双胞胎育儿伴侣', 200, 245);

// Bottom bar
ctx.fillStyle = '#E07B3E';
ctx.fillRect(0, 300, 200, 20);
ctx.fillStyle = '#D48068';
ctx.fillRect(200, 300, 200, 20);

const fs = require('fs');
fs.writeFileSync('static/share-brand.png', canvas.toBuffer('image/png'));
console.log('Brand share image created at static/share-brand.png');
