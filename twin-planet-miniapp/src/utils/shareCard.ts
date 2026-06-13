/**
 * 并蒂时光对比卡 — Canvas 生成器
 * 生成一周双宝成长对比卡，保存到相册，供用户分享到微信群/朋友圈
 */

export interface WeekStats {
  babyAName: string
  babyBName: string
  babyAFeedings: number
  babyBFeedings: number
  babyASleepMin: number
  babyBSleepMin: number
  babyADiapers: number
  babyBDiapers: number
  daysGrowing: number
}

/** 在指定 canvasId 上绘制对比卡，返回临时文件路径 */
export function drawShareCard(
  canvasId: string,
  stats: WeekStats,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext(canvasId)

    const W = 345 // 卡片宽度 (rpx → px 在 375 屏宽下约 345px)
    const H = 480
    const pad = 20

    // 背景
    ctx.setFillStyle('#FAF7F2')
    ctx.fillRect(0, 0, W, H)

    // 白色内容区
    ctx.setFillStyle('#FFFFFF')
    roundRect(ctx, 12, 12, W - 24, H - 24, 16)
    ctx.fill()

    // 顶部品牌条
    ctx.setFillStyle('#A45C40')
    ctx.fillRect(12, 12, W - 24, 4)

    // 标题
    ctx.setFillStyle('#2D2B28')
    ctx.setFontSize(18)
    ctx.setTextAlign('center')
    ctx.fillText('并蒂时光', W / 2, 50)

    // 副标题
    ctx.setFillStyle('#9C9892')
    ctx.setFontSize(12)
    ctx.fillText(`一起长大的第 ${stats.daysGrowing} 天`, W / 2, 72)

    // 分隔线
    ctx.setStrokeStyle('#EFEBE4')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(pad + 20, 90)
    ctx.lineTo(W - pad - 20, 90)
    ctx.stroke()

    // 左栏 — 大宝
    const colW = (W - 24 - pad * 2) / 2
    const leftX = pad + 20
    const rightX = W / 2 + 12
    const dataY = 115

    // 大宝色条
    ctx.setFillStyle('#A45C40')
    ctx.fillRect(leftX, dataY - 5, 4, 24)
    ctx.setFillStyle('#2D2B28')
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText(stats.babyAName, leftX + 12, dataY + 14)

    // 二宝色条
    ctx.setFillStyle('#C7866A')
    ctx.fillRect(rightX, dataY - 5, 4, 24)
    ctx.setFillStyle('#2D2B28')
    ctx.fillText(stats.babyBName, rightX + 12, dataY + 14)

    // 数据行
    const rows = [
      { label: '🍼 喂奶', a: `${stats.babyAFeedings}次`, b: `${stats.babyBFeedings}次` },
      { label: '😴 睡眠', a: `${Math.round(stats.babyASleepMin / 60)}h`, b: `${Math.round(stats.babyBSleepMin / 60)}h` },
      { label: '🧷 换尿布', a: `${stats.babyADiapers}次`, b: `${stats.babyBDiapers}次` },
    ]

    rows.forEach((row, i) => {
      const y = dataY + 50 + i * 52
      // 行背景
      ctx.setFillStyle(i % 2 === 0 ? '#FAF7F2' : '#FFFFFF')
      roundRect(ctx, pad + 16, y - 8, W - pad * 2 - 32, 44, 8)
      ctx.fill()

      // 标签
      ctx.setFillStyle('#2D2B28')
      ctx.setFontSize(13)
      ctx.fillText(row.label, pad + 28, y + 16)

      // 大宝数据
      ctx.setFillStyle('#A45C40')
      ctx.setFontSize(14)
      ctx.setTextAlign('left')
      ctx.fillText(row.a, leftX + 24, y + 16)

      // 二宝数据
      ctx.setFillStyle('#C7866A')
      ctx.fillText(row.b, rightX + 24, y + 16)
    })

    // 底部寄语
    const bottomY = dataY + 50 + rows.length * 52 + 30
    ctx.setFillStyle('#9C9892')
    ctx.setFontSize(11)
    ctx.setTextAlign('center')
    ctx.fillText('他们不一样，但他们一起长大。', W / 2, bottomY)

    // 品牌水印
    ctx.setFillStyle('#C4C0BB')
    ctx.setFontSize(10)
    ctx.fillText('—— 并蒂星球 · 中国首款双胞胎育儿伴侣', W / 2, bottomY + 24)

    // 底部品牌色条
    ctx.setFillStyle('#C7866A')
    ctx.fillRect(12, H - 20, W - 24, 4)

    ctx.draw(false, () => {
      uni.canvasToTempFilePath({
        canvasId,
        destWidth: W * 2,
        destHeight: H * 2,
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => reject(err),
      })
    })
  })
}

/** 保存图片到相册 */
export function saveToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: (err) => {
        if (err.errMsg?.includes('auth deny')) {
          uni.showModal({
            title: '需要相册权限',
            content: '请在设置中允许并蒂星球访问你的相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting({})
              }
            },
          })
        }
        reject(err)
      },
    })
  })
}

/** 绘制圆角矩形路径 */
function roundRect(
  ctx: ReturnType<typeof uni.createCanvasContext>,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
  ctx.lineTo(x + w, y + h - r)
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
  ctx.lineTo(x + r, y + h)
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  ctx.closePath()
}
