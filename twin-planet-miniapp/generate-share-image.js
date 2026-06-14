/**
 * 生成双宝手帐品牌分享图 (400x320 PNG)
 * 方案1: npm install canvas && node generate-share-image.js
 * 方案2: 浏览器打开下方HTML截图保存为 static/share-brand.png
 */

const fs = require('fs');

try {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(400, 320);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FEF9F0'; ctx.fillRect(0, 0, 400, 320);
  ctx.strokeStyle = '#E8DCC8'; ctx.lineWidth = 2; ctx.setLineDash([6,4]);
  ctx.strokeRect(20, 20, 360, 280); ctx.setLineDash([]);

  ctx.fillStyle = '#E07B3E'; ctx.beginPath(); ctx.arc(200, 110, 48, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 46px "KaiTi", serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('双', 200, 110);

  ctx.fillStyle = '#2D2318'; ctx.font = 'bold 30px "Georgia", serif'; ctx.fillText('双宝手帐', 200, 195);
  ctx.fillStyle = '#9C8E7C'; ctx.font = '16px "PingFang SC", sans-serif'; ctx.fillText('双胞胎的成长记录本', 200, 230);

  ctx.fillStyle = '#E07B3E'; ctx.fillRect(0, 300, 200, 20);
  ctx.fillStyle = '#D48068'; ctx.fillRect(200, 300, 200, 20);

  fs.writeFileSync('static/share-brand.png', canvas.toBuffer('image/png'));
  console.log('Brand image generated');

} catch (e) {
  const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAZAAAAFACAYAAAAI2pw2AAAA','base64');
  fs.mkdirSync('static',{recursive:true});
  fs.writeFileSync('static/share-brand.png', placeholder);
  console.log('Placeholder created. Run: npm install canvas && node generate-share-image.js');
}
