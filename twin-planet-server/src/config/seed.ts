/**
 * 开发环境种子数据
 * 运行: npm run db:seed
 */
import { pool, query } from './database'

const SEED = {
  users: [
    { id: 'u-seed-mom', openid: 'seed-mom', nickname: '小云', role: 'mom', phone: '13800001111' },
    { id: 'u-seed-dad', openid: 'seed-dad', nickname: '大雷', role: 'dad', phone: '13800002222' },
    { id: 'u-seed-grandma', openid: 'seed-grandma', nickname: '姥姥', role: 'grandma' },
  ],
  families: [
    { id: 'f-seed-1', name: '我们的家', created_by: 'u-seed-mom' },
  ],
  babies: [
    // 注：color 按出生顺序决定（大宝=amber 暖阳，小宝=terracotta 陶土色 暖土），与 gender 无关
    // 种子数据用龙凤胎仅作功能演示；同性别双胞胎同样适用此配色规则
    { id: 'b-seed-a', user_id: 'u-seed-mom', family_id: 'f-seed-1', name: '安宁', nickname: '大宝', gender: 'male', birth_date: '2025-01-15', birth_order: 1, color: '#E07B3E', birth_weight: 3.2, birth_height: 50 },
    { id: 'b-seed-b', user_id: 'u-seed-mom', family_id: 'f-seed-1', name: '安然', nickname: '二宝', gender: 'female', birth_date: '2025-01-15', birth_order: 2, color: '#C08552', birth_weight: 2.9, birth_height: 48 },
  ],
}

async function seed() {
  console.log('[Seed] 开始写入种子数据...')

  // 用户
  for (const u of SEED.users) {
    await query(
      `INSERT INTO users (id, openid, nickname, role, phone, family_id)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.openid, u.nickname, u.role, u.phone, 'f-seed-1']
    )
  }
  console.log(`  ✓ ${SEED.users.length} users`)

  // 家庭
  for (const f of SEED.families) {
    await query(
      `INSERT INTO families (id, name, created_by) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`,
      [f.id, f.name, f.created_by]
    )
  }
  console.log(`  ✓ ${SEED.families.length} families`)

  // 更新用户 family_id
  await query(`UPDATE users SET family_id = 'f-seed-1' WHERE id IN ('u-seed-mom','u-seed-dad','u-seed-grandma')`)

  // 宝宝
  for (const b of SEED.babies) {
    await query(
      `INSERT INTO babies (id, user_id, family_id, name, nickname, gender, birth_date, birth_order, color, birth_weight, birth_height)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
      [b.id, b.user_id, b.family_id, b.name, b.nickname, b.gender, b.birth_date, b.birth_order, b.color, b.birth_weight, b.birth_height]
    )
  }
  console.log(`  ✓ ${SEED.babies.length} babies`)

  // 示例记录
  const now = Date.now()
  const sampleRecords = [
    { id: 'r-seed-1', baby_id: 'b-seed-a', user_id: 'u-seed-mom', type: 'feeding', started_at: new Date(now-7200000), ended_at: new Date(now-7140000), duration_min: 10, detail: '母乳左 120ml 10分钟', recorded_by: 'mom', created_at: new Date(now-7140000) },
    { id: 'r-seed-2', baby_id: 'b-seed-b', user_id: 'u-seed-mom', type: 'feeding', started_at: new Date(now-7000000), ended_at: new Date(now-6920000), duration_min: 13, detail: '母乳右 90ml 13分钟', recorded_by: 'mom', created_at: new Date(now-6920000) },
    { id: 'r-seed-3', baby_id: 'b-seed-a', user_id: 'u-seed-dad', type: 'diaper', started_at: new Date(now-3600000), ended_at: new Date(now-3600000), duration_min: 0, detail: '换尿布 💧', recorded_by: 'dad', created_at: new Date(now-3600000) },
    { id: 'r-seed-4', baby_id: 'b-seed-b', user_id: 'u-seed-dad', type: 'diaper', started_at: new Date(now-3500000), ended_at: new Date(now-3500000), duration_min: 0, detail: '换尿布 💩', recorded_by: 'dad', created_at: new Date(now-3500000) },
    { id: 'r-seed-5', baby_id: 'b-seed-a', user_id: 'u-seed-mom', type: 'sleep', started_at: new Date(now-14400000), ended_at: new Date(now-10800000), duration_min: 60, detail: '午睡 60分钟', recorded_by: 'mom', created_at: new Date(now-10800000) },
  ]
  for (const r of sampleRecords) {
    await query(
      `INSERT INTO records (id, baby_id, user_id, type, started_at, ended_at, duration_min, detail, recorded_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
      [r.id, r.baby_id, r.user_id, r.type, r.started_at, r.ended_at, r.duration_min, r.detail, r.recorded_by, r.created_at]
    )
  }
  console.log(`  ✓ ${sampleRecords.length} sample records`)

  console.log('[Seed] 完成！')
  await pool.end()
}

seed().catch(err => { console.error('[Seed] 失败:', err); process.exit(1) })
