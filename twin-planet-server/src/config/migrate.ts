import { pool } from './database'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS families (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL DEFAULT '我们的家',
  created_by VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_invites (
  token VARCHAR(64) PRIMARY KEY,
  family_id VARCHAR(64) NOT NULL REFERENCES families(id),
  created_by VARCHAR(64) NOT NULL,
  used BOOLEAN DEFAULT false,
  used_by VARCHAR(64),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  openid VARCHAR(128) UNIQUE NOT NULL,
  nickname VARCHAR(64) DEFAULT '',
  avatar VARCHAR(512) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  role VARCHAR(20) DEFAULT 'mom' CHECK (role IN ('mom','dad','grandma','grandpa','nanny','other')),
  family_id VARCHAR(64) REFERENCES families(id),
  preferred_ui_mode VARCHAR(10) DEFAULT 'normal' CHECK (preferred_ui_mode IN ('normal','large')),
  ui_config JSONB DEFAULT '{"fontSize":14,"showTTS":false,"simplifiedHome":false,"autoNightMode":true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twin_groups (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  name VARCHAR(64) NOT NULL DEFAULT '',
  baby_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS babies (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  twin_group_id VARCHAR(64) REFERENCES twin_groups(id),
  name VARCHAR(32) NOT NULL,
  nickname VARCHAR(32) DEFAULT '',
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male','female')),
  birth_date DATE NOT NULL,
  birth_order INT NOT NULL CHECK (birth_order IN (1,2)),
  color VARCHAR(7) NOT NULL,
  avatar VARCHAR(512) DEFAULT '',
  birth_weight REAL DEFAULT 0,
  birth_height REAL DEFAULT 0,
  gestational_weeks INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS records (
  id VARCHAR(64) PRIMARY KEY,
  baby_id VARCHAR(64) NOT NULL REFERENCES babies(id),
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('feeding','sleep','diaper','temperature','medicine','bath')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_min INT DEFAULT 0,
  detail TEXT DEFAULT '',
  feeding_side VARCHAR(10),
  amount_ml INT,
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
  diaper_type VARCHAR(10) CHECK (diaper_type IN ('wet','dirty','both')),
  recorded_by VARCHAR(20) DEFAULT 'mom' CHECK (recorded_by IN ('mom','dad','grandma','grandpa','nanny','other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_measurements (
  id VARCHAR(64) PRIMARY KEY,
  baby_id VARCHAR(64) NOT NULL REFERENCES babies(id),
  date DATE NOT NULL,
  age_months INT NOT NULL,
  weight REAL DEFAULT 0,
  height REAL DEFAULT 0,
  head_circ REAL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sprout_entries (
  id VARCHAR(64) PRIMARY KEY,
  twin_group_id VARCHAR(64) NOT NULL REFERENCES twin_groups(id),
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('share','fight','imitate','comfort','compete','cooperate','first')),
  baby_a_name VARCHAR(32) NOT NULL,
  baby_b_name VARCHAR(32) NOT NULL,
  note TEXT DEFAULT '',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contribution_entries (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  category VARCHAR(20) NOT NULL,
  note TEXT DEFAULT '',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duty_tasks (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  category VARCHAR(20) NOT NULL,
  title VARCHAR(128) NOT NULL,
  baby_a_need BOOLEAN DEFAULT true,
  baby_b_need BOOLEAN DEFAULT true,
  done BOOLEAN DEFAULT false,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_decisions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  twin_group_id VARCHAR(64) REFERENCES twin_groups(id),
  term VARCHAR(20) NOT NULL,
  same_class BOOLEAN NOT NULL,
  coupling_score JSONB NOT NULL DEFAULT '{"emotional":0,"social":0,"identity":0}',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS handover_messages (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  family_id VARCHAR(64) REFERENCES families(id),
  baby_id VARCHAR(64),
  audio_url TEXT,
  duration_sec INT DEFAULT 0,
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_records_baby ON records(baby_id);
CREATE INDEX IF NOT EXISTS idx_records_user ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at);
CREATE INDEX IF NOT EXISTS idx_growth_baby ON growth_measurements(baby_id);
CREATE INDEX IF NOT EXISTS idx_babies_user ON babies(user_id);
CREATE INDEX IF NOT EXISTS idx_sprout_group ON sprout_entries(twin_group_id);
`

async function migrate() {
  console.log('[DB] Running migrations...')
  try {
    await pool.query(SCHEMA)
    console.log('[DB] Migrations completed successfully')
  } catch (err) {
    console.error('[DB] Migration failed:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
