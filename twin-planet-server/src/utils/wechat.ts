/**
 * 微信服务端 API 调用
 */
import { config } from '../config'

interface Code2SessionResult {
  openid: string
  session_key: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

/**
 * wx.login 返回的 code 换取 openid 和 session_key
 * 🔒 secret 通过 POST body 发送，不在 URL query 中暴露
 */
export async function code2Session(code: string): Promise<Code2SessionResult> {
  const { appid, secret } = config.wechat
  if (!appid || !secret) {
    throw new Error('WECHAT_APPID 或 WECHAT_SECRET 未配置')
  }
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10s 超时
  try {
    const resp = await fetch(url, { signal: controller.signal })
    const data = await resp.json() as Code2SessionResult

    if (data.errcode) {
      console.error(`WeChat code2Session error: errcode=${data.errcode}`)
      throw new Error(`微信登录失败，请稍后重试`)
    }
    return data
  } finally {
    clearTimeout(timeout)
  }
}
