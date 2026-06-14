/**
 * 家庭 API — 邀请、加入、查询
 */
import { request } from './client'
import type { ApiResponse } from './types'

export interface FamilyInfo {
  hasFamily: boolean
  familyId?: string
  memberCount?: number
  members?: Array<{ id: string; nickname: string; role: string; avatar: string }>
  babyCount?: number
  babies?: Array<{ id: string; name: string; nickname: string; gender: string; birth_date: string }>
}

export interface InviteResult {
  token: string
  inviterName: string
  expiresIn: string
  sharePath: string
}

/** 获取当前家庭信息 */
export async function getFamily(): Promise<ApiResponse<FamilyInfo>> {
  return request('/family')
}

/** 创建家庭 */
export async function createFamily(name?: string): Promise<ApiResponse<FamilyInfo>> {
  return request('/family/create', { method: 'POST', data: { name } })
}

/** 生成邀请令牌 */
export async function createInvite(): Promise<ApiResponse<InviteResult>> {
  return request('/family/invite', { method: 'POST' })
}

/** 接受邀请加入家庭 */
export async function joinFamily(token: string): Promise<ApiResponse<FamilyInfo>> {
  return request('/family/join', { method: 'POST', data: { token } })
}

/** 离开家庭 */
export async function leaveFamily(): Promise<ApiResponse<null>> {
  return request('/family/leave', { method: 'POST' })
}
