/**
 * 并蒂星球 · 数据库 Schema
 * 6 张 MVP 核心表 + 延后表的类型占位
 */
import {
  pgTable, uuid, varchar, text, integer, real,
  timestamp, jsonb, boolean, uniqueIndex, foreignKey,
} from 'drizzle-orm/pg-core'

// ============================================================
// 1. users — 微信登录用户
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  openid: varchar('openid', { length: 128 }).notNull(),
  nickname: varchar('nickname', { length: 64 }),
  avatar: text('avatar'),
  phone: text('phone'),                     // AES-256-GCM 加密存储
  role: varchar('role', { length: 16 }).notNull().default('mom'),
  preferredUiMode: varchar('preferred_ui_mode', { length: 16 }).notNull().default('normal'),
  uiConfig: jsonb('ui_config').notNull().default({
    fontSize: 14,
    showTTS: false,
    simplifiedHome: false,
    autoNightMode: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  openidIdx: uniqueIndex('users_openid_idx').on(table.openid),
}))

// ============================================================
// 2. twin_groups — 双胞胎家庭组
// ============================================================
export const twinGroups = pgTable('twin_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// 3. babies — 宝宝档案
// ============================================================
export const babies = pgTable('babies', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  twinGroupId: uuid('twin_group_id').references(() => twinGroups.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 32 }).notNull(),
  nickname: varchar('nickname', { length: 32 }),
  gender: varchar('gender', { length: 8 }).notNull(),  // 'male' | 'female'
  birthDate: varchar('birth_date', { length: 10 }).notNull(),  // ISO date string
  birthOrder: integer('birth_order').notNull(),          // 1 or 2
  color: varchar('color', { length: 7 }).notNull(),      // #4299E1 / #F56565
  avatar: text('avatar'),
  birthWeight: real('birth_weight'),
  birthHeight: real('birth_height'),
  isActive: boolean('is_active').notNull().default(true),
})

// ============================================================
// 4. records — 统一记录表（喂养/睡眠/换尿布）
// ============================================================
export const records = pgTable('records', {
  id: uuid('id').defaultRandom().primaryKey(),
  babyId: uuid('baby_id').notNull().references(() => babies.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 16 }).notNull(),       // 'feeding' | 'sleep' | 'diaper'
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
  durationMin: integer('duration_min').notNull().default(0),
  detail: text('detail'),                                 // "母乳左 120ml 20分钟"
  // 喂养专用
  feedingSide: varchar('feeding_side', { length: 8 }),   // 'left' | 'right' | 'bottle'
  amountMl: integer('amount_ml'),
  // 睡眠专用
  sleepQuality: integer('sleep_quality'),                 // 1-5
  // 换尿布专用
  diaperType: varchar('diaper_type', { length: 8 }),     // 'wet' | 'dirty' | 'both'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// 5. sibling_interactions — 萌芽日记
// ============================================================
export const siblingInteractions = pgTable('sibling_interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  twinGroupId: uuid('twin_group_id').notNull().references(() => twinGroups.id, { onDelete: 'cascade' }),
  babyIds: jsonb('baby_ids').notNull(),                   // [babyIdA, babyIdB]
  type: varchar('type', { length: 16 }).notNull(),        // 'share'|'fight'|'imitate'|'comfort'|'compete'|'cooperate'|'first'
  note: text('note'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// 6. parent_contributions — 今天我做了什么
// ============================================================
export const parentContributions = pgTable('parent_contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userName: varchar('user_name', { length: 32 }).notNull(),
  category: varchar('category', { length: 16 }).notNull(), // 'night_feed'|'diaper'|'bath'|'play'|'cook'|'clean'|'errand'|'other'
  note: text('note'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// 类型导出
// ============================================================
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type TwinGroup = typeof twinGroups.$inferSelect
export type Baby = typeof babies.$inferSelect
export type NewBaby = typeof babies.$inferInsert
export type Record = typeof records.$inferSelect
export type NewRecord = typeof records.$inferInsert
export type SiblingInteraction = typeof siblingInteractions.$inferSelect
export type ParentContribution = typeof parentContributions.$inferSelect
