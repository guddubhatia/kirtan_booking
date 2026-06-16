// Seed an admin user (and optional demo events) — SSBBN Kirtan Panel backend
// Usage:  node seed.js   (or: npm run seed)
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from server/.env (falls back to defaults).
require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool, setupSchema } = require('./db');

async function seed() {
  await setupSchema();

  const email = (process.env.ADMIN_EMAIL || 'admin@ssbbn.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'changeme123';

  const existing = (await pool.query('SELECT id FROM admins WHERE email = $1', [email])).rows[0];
  if (existing) {
    // Reset the password to the env value so you can always get back in.
    await pool.query(
      'UPDATE admins SET password_hash = $1 WHERE email = $2',
      [bcrypt.hashSync(password, 10), email]
    );
    console.log(`✔ Admin already existed — password reset for ${email}`);
  } else {
    await pool.query(
      'INSERT INTO admins (id, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), email, bcrypt.hashSync(password, 10), 'admin', new Date().toISOString()]
    );
    console.log(`✔ Created admin ${email}`);
  }

  console.log(`  Login with:  ${email} / ${password}`);
  console.log('  (Change ADMIN_PASSWORD in server/.env and re-run `npm run seed` to rotate.)');

  // ── Demo data ──────────────────────────────────────────────────────
  // Fixed IDs + ON CONFLICT DO NOTHING → safe to re-run without duplicating.
  const ts = new Date().toISOString();

  const demoEvents = [
    {
      id: 'demo-event-1', title: 'Sunday Diwan & Kirtan', event_type: 'kirtan',
      date: '2026-06-14', time: '18:00', location: 'Main Darbar Hall',
      description: 'Weekly evening kirtan followed by ardas.',
      status: 'confirmed', notes: 'Langar served afterwards.',
    },
    {
      id: 'demo-event-2', title: 'Gurpurab Celebration', event_type: 'temple_event',
      date: '2026-06-21', time: '09:00', location: 'Temple Grounds',
      description: 'Akhand Path bhog, kirtan darbar and community langar.',
      status: 'confirmed', notes: 'Volunteers requested from 07:00.',
    },
    {
      id: 'demo-event-3', title: 'Hall Maintenance — Temple Closed', event_type: 'unavailable',
      date: '2026-06-28', time: '', location: '',
      description: 'Darbar hall closed for annual flooring repair.',
      status: 'confirmed', notes: '',
    },
    {
      id: 'demo-event-4', title: 'Youth Kirtan Workshop', event_type: 'kirtan',
      date: '2026-07-05', time: '11:00', location: 'Community Room',
      description: 'Beginner tabla and vaja session for children.',
      status: 'tentative', notes: 'Confirming the raagi jatha availability.',
    },
  ];

  let added = 0;
  for (const e of demoEvents) {
    const r = await pool.query(
      `INSERT INTO events (id, title, event_type, date, "time", location, description, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
      [e.id, e.title, e.event_type, e.date, e.time, e.location, e.description, e.status, e.notes, ts]
    );
    added += r.rowCount;
  }

  const annRes = await pool.query(
    `INSERT INTO announcements (id, title, body, created_at) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING`,
    [
      'demo-ann-1',
      'Welcome to the SSBBN Kirtan Panel',
      'Check the calendar for upcoming kirtan and temple events. Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh.',
      ts,
    ]
  );

  console.log(`✔ Demo data: ${added} new event(s), ${annRes.rowCount} new announcement(s) (existing rows left untouched).`);
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
