PRAGMA foreign_keys = OFF;

-- DROP TABLES
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS users;

PRAGMA foreign_keys = ON;

---------------------------------------------------
-- USERS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- ADS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  location TEXT,

  status TEXT NOT NULL DEFAULT 'in_review',

  is_reported INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_sensitive INTEGER NOT NULL DEFAULT 0,
  is_shadow_hidden INTEGER NOT NULL DEFAULT 0,
  review_priority TEXT DEFAULT 'normal',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

---------------------------------------------------
-- MESSAGES TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);

