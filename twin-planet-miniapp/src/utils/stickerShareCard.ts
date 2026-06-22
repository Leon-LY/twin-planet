/**
 * 贴纸收集分享卡片 — Canvas 动态生成
 * 学自 Pokémon TCG Zukan / AuraBinder 导出模式
 */
import { TWIN_COLORS, SURFACE_COLORS } from '@/constants/design'

const C = {
  amber: TWIN_COLORS.A,
  terracotta: TWIN_COLORS.B,
  bg: SURFACE_COLORS.paper,
  cream: SURFACE_COLORS.cream,
  ink: SURFACE_COLORS.ink,
  inkMd: SURFACE_COLORS.inkMd,
  inkLt: SURFACE_COLORS.inkLt,
  dot: SURFACE_COLORS.dot,
} as const

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

export interface StickerShareData {
  earned: number
  total: number
  rate: number
  collections: {
    icon: string
    title: string
    earned: number
    total: number
    completed: boolean
  }[]
}

/**
 * 绘制贴纸收集分享卡片
 * @param canvasId Canvas 组件 id
 * @param data 贴纸收集数据
 * @returns 临时文件路径
 */
export function drawStickerShareCard(
  canvasId: string,
  data: StickerShareData,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext(canvasId)
    const W = 345
    const H = data.collections.length > 6 ? 500 : 440
    const pad = 18

    // 背景 — 暖纸色
    ctx.setFillStyle(C.bg)
    ctx.fillRect(0, 0, W, H)

    // 白色卡片
    ctx.setFillStyle('#FFFFFF')
    roundRect(ctx, 10, 10, W - 20, H - 20, 14)
    ctx.fill()

    // 顶部装饰条
    ctx.setFillStyle(C.amber)
    ctx.fillRect(20, 20, W - 40, 4)

    // 标题
    ctx.setFillStyle(C.ink)
    ctx.setFontSize(18)
    ctx.setTextAlign('center')
    ctx.fillText('🦊 双宝记 · 贴纸收集册', W / 2, 54)

    // 统计行
    ctx.setFontSize(13)
    ctx.setFillStyle(C.inkMd)
    ctx.fillText(`${data.earned}/${data.total} 贴纸  ·  ${data.rate}% 收集率`, W / 2, 76)

    // 分隔线
    ctx.setStrokeStyle(C.dot)
    ctx.setLineWidth(0.8)
    ctx.beginPath()
    ctx.moveTo(28, 86)
    ctx.lineTo(W - 28, 86)
    ctx.stroke()

    // 绘制收藏册列表（2列布局）
    const colW = (W - 60) / 2
    const startY = 100
    const rowH = 52
    let y = startY

    for (let i = 0; i < data.collections.length; i++) {
      const col = data.collections[i]
      const x = i % 2 === 0 ? 28 : 28 + colW + 4
      if (i > 0 && i % 2 === 0) y += rowH

      // 册子背景
      ctx.setFillStyle(col.completed ? 'rgba(79,174,110,0.06)' : C.cream)
      roundRect(ctx, x, y, colW, rowH - 4, 8)
      ctx.fill()

      // 册子图标 + 标题
      ctx.setFontSize(16)
      ctx.setTextAlign('left')
      ctx.fillText(`${col.icon} ${col.title}`, x + 8, y + 22)

      // 进度条背景
      const barX = x + 8
      const barY = y + 32
      const barW = colW - 16
      const barH = 6
      ctx.setFillStyle(C.dot)
      roundRect(ctx, barX, barY, barW, barH, 3)
      ctx.fill()

      // 进度条填充
      if (col.total > 0) {
        const pct = col.earned / col.total
        const fillColor = col.completed ? '#4FAE6E' : C.amber
        ctx.setFillStyle(fillColor)
        roundRect(ctx, barX, barY, Math.max(barW * pct, col.earned > 0 ? 6 : 0), barH, 3)
        ctx.fill()
      }

      // 收集计数
      ctx.setFontSize(11)
      ctx.setFillStyle(col.completed ? '#4FAE6E' : C.inkMd)
      ctx.setTextAlign('right')
      const countText = col.completed ? `${col.earned}/${col.total} ✓` : `${col.earned}/${col.total}`
      ctx.fillText(countText, x + colW - 8, y + 22)
    }

    // 底部
    const footerY = H - 30
    ctx.setFontSize(11)
    ctx.setFillStyle(C.inkLt)
    ctx.setTextAlign('center')
    ctx.fillText('并蒂而生 · 同步成长', W / 2, footerY)
    ctx.fillText('双宝记 Twin Journal', W / 2, footerY + 16)

    // 渲染输出（延迟 400ms 确保 Canvas 完成光栅化，与 clinicCard.ts 一致）
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId,
          destWidth: W * 2,
          destHeight: H * 2,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => reject(err),
        })
      }, 400)
    })
    // 超时保护：10 秒未完成则 reject，防止 loading 永久卡死
    setTimeout(() => reject(new Error('Canvas render timed out')), 10000)
  })
}
