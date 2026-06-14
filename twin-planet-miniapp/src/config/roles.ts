/**
 * 角色自适应配置
 * 不同角色看到不同的功能、不同的首页布局、不同的问候风格。
 * 不是改 CSS，是改逻辑。
 */

export type Role = 'mom' | 'dad' | 'grandma' | 'grandpa' | 'nanny'
export type HomeLayout = 'full' | 'compact' | 'granny'
export type GreetingStyle = 'warm' | 'efficient' | 'simple'

export interface RoleConfig {
  role: Role
  label: string
  emoji: string
  homeLayout: HomeLayout
  features: string[]
  quickActions: string[]
  greetingStyle: GreetingStyle
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  mom: {
    role: 'mom',
    label: '妈妈',
    emoji: '👩',
    homeLayout: 'full',
    features: ['record', 'growth', 'sprout', 'contribution', 'handover', 'guardian', 'snapshot', 'stickers'],
    quickActions: ['feeding', 'sleep', 'diaper'],
    greetingStyle: 'warm',
  },
  dad: {
    role: 'dad',
    label: '爸爸',
    emoji: '👨',
    homeLayout: 'compact',
    features: ['record', 'growth', 'duty', 'handover', 'snapshot', 'stickers'],
    quickActions: ['feeding', 'sleep', 'diaper'],
    greetingStyle: 'efficient',
  },
  grandma: {
    role: 'grandma',
    label: '奶奶',
    emoji: '👵',
    homeLayout: 'granny',
    features: ['record', 'growth'],
    quickActions: [],
    greetingStyle: 'simple',
  },
  grandpa: {
    role: 'grandpa',
    label: '爷爷',
    emoji: '👴',
    homeLayout: 'granny',
    features: ['record', 'growth'],
    quickActions: [],
    greetingStyle: 'simple',
  },
  nanny: {
    role: 'nanny',
    label: '育儿嫂',
    emoji: '👩‍🍼',
    homeLayout: 'compact',
    features: ['record', 'growth', 'handover', 'snapshot'],
    quickActions: ['feeding', 'diaper'],
    greetingStyle: 'efficient',
  },
}

/** 获取角色配置，默认妈妈 */
export function getRoleConfig(role?: string): RoleConfig {
  return ROLE_CONFIGS[role as Role] ?? ROLE_CONFIGS.mom
}

/** 功能名称映射 */
export const FEATURE_LABELS: Record<string, string> = {
  record: '记录',
  growth: '生长曲线',
  sprout: '萌芽日记',
  contribution: '星尘日志',
  handover: '语音交接',
  duty: '值班清单',
  guardian: '守护中心',
  snapshot: '快照',
  school: '入园助手',
  milestones: '能力观察',
}

/** 发现页功能列表（按角色过滤） */
export function getDiscoverFeatures(role?: string): Array<{ label: string; path: string }> {
  const config = getRoleConfig(role)
  const allFeatures = [
    { key: 'sprout', label: '萌芽日记', path: '/pages/sprout/index' },
    { key: 'contribution', label: '今天我做了', path: '/pages/contribution/index' },
    { key: 'duty', label: '值班清单', path: '/pages/duty/index' },
    { key: 'guardian', label: '守护中心', path: '/pages/guardian/index' },
    { key: 'handover', label: '语音便签', path: '/pages/handover/index' },
    { key: 'stickers', label: '贴纸收集册', path: '/pages/stickers/index' },
  ]
  return allFeatures.filter(f => config.features.includes(f.key))
}
