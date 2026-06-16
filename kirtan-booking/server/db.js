// PostgreSQL database — SSBBN Kirtan Panel backend
// Schema mirrors the snake_case row shapes the Expo app expects (see services/api.ts).
// Works against managed Postgres (Neon/Render — SSL required) and a local
// Postgres for development/testing (no SSL).
require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

if (!process.env.DATABASE_URL) {
  console.error(
    'FATAL: DATABASE_URL is not set. Point it at your Postgres connection string ' +
    '(e.g. the Neon connection string ending in ?sslmode=require).'
  );
  process.exit(1);
}

// Managed Postgres (Neon, Render, Supabase, …) terminates TLS with a cert that
// node-postgres can\'t verify by default, so we relax verification for it.
// A local/dev Postgres on localhost speaks plain TCP — disable SSL there.
function resolveSsl() {
  if (process.env.PGSSL === 'disable') return false;
  if (process.env.PGSSL === 'require') return { rejectUnauthorized: false };
  const url = process.env.DATABASE_URL || '';
  if (/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) return false;
  return { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: resolveSsl(),
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Surface unexpected pool errors instead of crashing the process silently.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function setupSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'admin',
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      event_type  TEXT NOT NULL,
      date        TEXT NOT NULL,
      "time"      TEXT NOT NULL DEFAULT '',
      location    TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'confirmed',
      notes       TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      body       TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS push_tokens (
      token      TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
  `);

  // Auto-create the first admin on boot when ADMIN_EMAIL + ADMIN_PASSWORD are set
  // and no admin exists yet. Lets a fresh Render deploy be usable with zero manual steps.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admins');
    if (rows[0].count === 0) {
      const email = process.env.ADMIN_EMAIL.toLowerCase();
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      await pool.query(
        'INSERT INTO admins (id, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5)',
        [crypto.randomUUID(), email, hash, 'admin', new Date().toISOString()]
      );
      console.log(`✔ Auto-created admin: ${email}`);
    }
  }
}

module.exports = { pool, setupSchema };
