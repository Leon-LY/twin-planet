/**
 * V6.0 就诊速查卡
 * Canvas 2D 生成双胞胎对比摘要，供儿科医生查看
 * 纯前端，一键导出图片
 * V4 暖纸手帐配色
 */

import { TWIN_COLORS, SURFACE_COLORS } from '@/constants/design'
import { saveToAlbum } from './media'

const C = {
  a: TWIN_COLORS.A,
  b: TWIN_COLORS.B,
  bg: SURFACE_COLORS.paper,
  ink: SURFACE_COLORS.ink,
  inkMd: SURFACE_COLORS.inkMd,
  inkLt: SURFACE_COLORS.inkLt,
} as const

export interface ClinicCardData {
  babyAName: string
  babyBName: string
  babyAGender: string
  babyBGender: string
  babyABirth: string       // 'YYYY-MM-DD'
  babyBBirth: string
  babyAWeight: number      // kg, latest
  babyBWeight: number
  babyAHeight: number      // cm, latest
  babyBHeight: number
  babyAPercentileW: number // weight percentile
  babyBPercentileW: number
  babyAPercentileH: number // height percentile
  babyBPercentileH: number
  recentFeedA: number      // 最近7天喂养次数
  recentFeedB: number
  recentSleepA: number     // 最近7天睡眠次数
  recentSleepB: number
  dateRange: string        // e.g. '2026-06-07 ~ 2026-06-13'
}

const W = 375
const H = 580
const PAD = 24

/** 生成就诊速查卡图片 */
export function drawClinicCard(
  canvasId: string,
  data: ClinicCardData,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext(canvasId)

    // -- 背景 --
    ctx.setFillStyle(C.bg)
    ctx.fillRect(0, 0, W, H)

    // -- 顶部品牌条 --
    ctx.setFillStyle(C.a)
    ctx.fillRect(0, 0, W, 100)

    // 品牌名
    ctx.setFillStyle('#FFFFFF')
    ctx.setFontSize(22)
    ctx.setTextAlign('center')
    ctx.fillText('双宝星球 · 就诊速查卡', W / 2, 48)

    // 副标题
    ctx.setFontSize(12)
    ctx.setFillStyle('rgba(255,255,255,0.7)')
    ctx.fillText('Twin Journal · Clinic Quick Card', W / 2, 72)

    // 日期范围
    ctx.setFillStyle('rgba(255,255,255,0.5)')
    ctx.setFontSize(10)
    ctx.fillText(data.dateRange, W / 2, 90)

    // -- 双宝对比区 --
    let y = 128

    // 分割线
    ctx.setStrokeStyle('#E8DCC8')
    ctx.setLineWidth(1)
    ctx.moveTo(PAD, y)
    ctx.lineTo(W - PAD, y)
    ctx.stroke()

    y += 24
    ctx.setFillStyle(C.ink)
    ctx.setFontSize(15)
    ctx.setTextAlign('center')
    ctx.fillText(`${data.babyAName}  ·  ${data.babyBName}`, W / 2, y)

    y += 22
    ctx.setFontSize(11)
    ctx.setFillStyle(C.inkMd)
    const genderLabel = (g: string) => g === 'male' ? '男' : g === 'female' ? '女' : '—'
    ctx.fillText(`${genderLabel(data.babyAGender)} · ${data.babyABirth}    |    ${genderLabel(data.babyBGender)} · ${data.babyBBirth}`, W / 2, y)

    // -- 测量数据 --
    y += 32
    drawSectionHeader(ctx, '生长测量', y)
    y += 6

    // 体重行
    y += 22
    drawDataRow(ctx, '体重 (kg)', y,
      `${data.babyAWeight.toFixed(1)}`, `P${data.babyAPercentileW}`,
      `${data.babyBWeight.toFixed(1)}`, `P${data.babyBPercentileW}`,
    )

    // 身高行
    y += 28
    drawDataRow(ctx, '身高 (cm)', y,
      `${data.babyAHeight.toFixed(1)}`, `P${data.babyAPercentileH}`,
      `${data.babyBHeight.toFixed(1)}`, `P${data.babyBPercentileH}`,
    )

    // -- 近期喂养/睡眠 --
    y += 36
    drawSectionHeader(ctx, '近 7 天记录', y)
    y += 6

    y += 22
    drawDataRow(ctx, '喂养次数', y,
      `${data.recentFeedA}`, '',
      `${data.recentFeedB}`, '',
    )

    y += 28
    drawDataRow(ctx, '睡眠次数', y,
      `${data.recentSleepA}`, '',
      `${data.recentSleepB}`, '',
    )

    // -- 免责声明 --
    y += 44
    ctx.setFillStyle(C.inkLt)
    ctx.setFontSize(9)
    ctx.setTextAlign('center')
    ctx.fillText('此卡片仅为数据摘要，不代表医学诊断。', W / 2, y)
    y += 14
    ctx.fillText('所有数据基于 WHO 儿童生长标准（2006），仅供参考。', W / 2, y)

    // -- 底部品牌 --
    y += 28
    ctx.setFillStyle(C.inkMd)
    ctx.setFontSize(10)
    ctx.fillText('双宝星球 · 中国首款双胞胎育儿伴侣', W / 2, y)

    // 底部色条
    ctx.setFillStyle(C.a)
    ctx.fillRect(0, H - 4, W / 2, 4)
    ctx.setFillStyle(C.b)
    ctx.fillRect(W / 2, H - 4, W / 2, 4)

    ctx.draw(false, () => {
      // 延迟一点等渲染完成
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
  })
}

function drawSectionHeader(ctx: any, text: string, y: number) {
  ctx.setFillStyle(C.a)
  ctx.setFontSize(11)
  ctx.setTextAlign('left')
  ctx.fillText(text, 24, y)
}

function drawDataRow(
  ctx: any,
  label: string,
  y: number,
  valA: string,
  subA: string,
  valB: string,
  subB: string,
) {
  const col1 = 24
  const col2 = 120
  const col3 = 210
  const col4 = 300

  // 标签
  ctx.setFillStyle(C.inkMd)
  ctx.setFontSize(11)
  ctx.setTextAlign('left')
  ctx.fillText(label, col1, y)

  // 大宝值
  ctx.setFillStyle(C.a)
  ctx.setFontSize(18)
  ctx.setFontWeight('bold')
  ctx.fillText(valA, col2, y)
  if (subA) {
    ctx.setFillStyle(C.a)
    ctx.setFontSize(9)
    ctx.setFontWeight('normal')
    ctx.fillText(subA, col2 + 50, y)
  }

  // 二宝值
  ctx.setFillStyle(C.b)
  ctx.setFontSize(18)
  ctx.setFontWeight('bold')
  ctx.fillText(valB, col3, y)
  if (subB) {
    ctx.setFillStyle(C.b)
    ctx.setFontSize(9)
    ctx.setFontWeight('normal')
    ctx.fillText(subB, col3 + 50, y)
  }
}

export { saveToAlbum }
