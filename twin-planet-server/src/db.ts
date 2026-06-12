/**
 * 数据库连接 + Drizzle ORM 实例
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { config } from './config'
import * as schema from '../drizzle/schema'

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
})

export const db = drizzle(pool, { schema })
export { schema }
