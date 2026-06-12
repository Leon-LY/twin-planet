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
 */
export async function code2Session(code: string): Promise<Code2SessionResult> {
  const { appid, secret } = config.wechat
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`

  const resp = await fetch(url)
  const data = await resp.json() as Code2SessionResult

  if (data.errcode) {
    throw new Error(`WeChat code2session failed: ${data.errmsg} (code: ${data.errcode})`)
  }
  return data
}
