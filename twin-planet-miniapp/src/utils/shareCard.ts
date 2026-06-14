/**
 * 双宝时光对比卡 — Canvas 生成器
 * 生成一周双宝成长对比卡，保存到相册，供用户分享到微信群/朋友圈
 * V4 暖纸手帐配色
 */

import { TWIN_COLORS, SURFACE_COLORS } from '@/constants/design'
import { saveToAlbum } from './media'

const C = {
  a: TWIN_COLORS.A,    // 大宝·姜黄
  b: TWIN_COLORS.B,    // 二宝·豆沙
  bg: SURFACE_COLORS.paper,
  ink: SURFACE_COLORS.ink,
  inkMd: SURFACE_COLORS.inkMd,
} as const

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
  /** 双宝同步率 0-100 */
  syncRate?: number
  /** 本周新贴纸数 */
  newStickers?: number
  /** 本周神同步时刻（趣味文案） */
  syncMoment?: string
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
    ctx.setFillStyle(C.bg)
    ctx.fillRect(0, 0, W, H)

    // 白色内容区
    ctx.setFillStyle('#FFFFFF')
    roundRect(ctx, 12, 12, W - 24, H - 24, 16)
    ctx.fill()

    // 顶部品牌条
    ctx.setFillStyle(C.a)
    ctx.fillRect(12, 12, W - 24, 4)

    // 标题
    ctx.setFillStyle(C.ink)
    ctx.setFontSize(18)
    ctx.setTextAlign('center')
    ctx.fillText('双宝时光', W / 2, 50)

    // 副标题
    ctx.setFillStyle(C.inkMd)
    ctx.setFontSize(12)
    ctx.fillText(`一起长大的第 ${stats.daysGrowing} 天`, W / 2, 72)

    // 分隔线
    ctx.setStrokeStyle('#E8DCC8')
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
    ctx.setFillStyle(C.a)
    ctx.fillRect(leftX, dataY - 5, 4, 24)
    ctx.setFillStyle(C.ink)
    ctx.setFontSize(16)
    ctx.setTextAlign('left')
    ctx.fillText(stats.babyAName, leftX + 12, dataY + 14)

    // 二宝色条
    ctx.setFillStyle(C.b)
    ctx.fillRect(rightX, dataY - 5, 4, 24)
    ctx.setFillStyle(C.ink)
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
      ctx.setFillStyle(i % 2 === 0 ? C.bg : '#FFFFFF')
      roundRect(ctx, pad + 16, y - 8, W - pad * 2 - 32, 44, 8)
      ctx.fill()

      // 标签
      ctx.setFillStyle(C.ink)
      ctx.setFontSize(13)
      ctx.fillText(row.label, pad + 28, y + 16)

      // 大宝数据
      ctx.setFillStyle(C.a)
      ctx.setFontSize(14)
      ctx.setTextAlign('left')
      ctx.fillText(row.a, leftX + 24, y + 16)

      // 二宝数据
      ctx.setFillStyle(C.b)
      ctx.fillText(row.b, rightX + 24, y + 16)
    })

    // 🆕 本周神同步时刻
    let syncY = dataY + 50 + rows.length * 52 + 20
    if (stats.syncRate !== undefined && stats.syncRate > 0) {
      ctx.setFillStyle(C.bg)
      roundRect(ctx, pad + 16, syncY, W - pad * 2 - 32, 56, 8)
      ctx.fill()
      ctx.setFillStyle(C.ink)
      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.fillText(`🔗 本周同步率 ${stats.syncRate}% · 神同步！`, W / 2, syncY + 24)
      if (stats.syncMoment) {
        ctx.setFillStyle(C.inkMd)
        ctx.setFontSize(10)
        ctx.fillText(stats.syncMoment, W / 2, syncY + 42)
      }
      syncY += 64
    }

    // 🆕 贴纸收集
    if (stats.newStickers !== undefined && stats.newStickers > 0) {
      ctx.setFillStyle(C.ink)
      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.fillText(`🌟 本周新贴纸 ${stats.newStickers} 张`, W / 2, syncY + 16)
      syncY += 28
    }

    // 底部寄语
    const bottomY = syncY + 28
    ctx.setFillStyle(C.inkMd)
    ctx.setFontSize(11)
    ctx.setTextAlign('center')
    ctx.fillText('他们不一样，但他们一起长大。', W / 2, bottomY)

    // 品牌水印
    ctx.setFillStyle('#D4C8B8')
    ctx.setFontSize(10)
    ctx.fillText('—— 双宝记', W / 2, bottomY + 24)

    // 底部品牌色条
    ctx.setFillStyle(C.b)
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

export { saveToAlbum }

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
