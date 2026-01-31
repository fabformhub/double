-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ADS TABLE (with moderation workflow)
CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  location TEXT,

  -- Moderation state machine
  status TEXT NOT NULL DEFAULT 'draft',
  -- allowed values (by convention):
  -- 'draft', 'in-review', 'needs-edit', 'rejected',
  -- 'approved', 'scheduled', 'published',
  -- 'archived', 'flagged', 'quarantined',
  -- 'soft-deleted', 'escalated'

  -- Admin workflow metadata
  admin_reviewer_id INTEGER,
  admin_notes TEXT,
  flagged_reason TEXT,

  -- Lifecycle timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  reviewed_at DATETIME,
  published_at DATETIME,
  archived_at DATETIME,
  scheduled_for DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_reviewer_id) REFERENCES users(id)
);

-- MESSAGES TABLE (user-to-user messaging)
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ad_id) REFERENCES ads(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- SESSIONS TABLE (optional, if you ever want DB-backed sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

