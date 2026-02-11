---------------------------------------------------
-- USERS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------
-- LOCATIONS TABLE
---------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_code TEXT NOT NULL,     -- uk, ie
  city_name TEXT NOT NULL,        -- Manchester
  slug TEXT NOT NULL UNIQUE       -- mcr, ldn, dub, etc.
);

---------------------------------------------------
-- ADS TABLE (LOCATION-AWARE)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,

  -- NEW: location slug (short, URL-friendly)
  location_slug TEXT NOT NULL,    -- e.g. mcr, ldn, dub

  -- Moderation workflow (your existing fields)
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

---------------------------------------------------
-- SESSIONS TABLE (if using express-session SQLite)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire DATETIME NOT NULL
);

