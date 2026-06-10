// Seed an admin user (and optional demo events) — SSBBN Kirtan Panel backend
// Usage:  node seed.js
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from server/.env (falls back to defaults).
require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const email = (process.env.ADMIN_EMAIL || 'admin@ssbbn.local').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'changeme123';

const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
if (existing) {
  // Reset the password to the env value so you can always get back in.
  db.prepare('UPDATE admins SET password_hash = ? WHERE email = ?')
    .run(bcrypt.hashSync(password, 10), email);
  console.log(`✔ Admin already existed — password reset for ${email}`);
} else {
  db.prepare('INSERT INTO admins (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), email, bcrypt.hashSync(password, 10), 'admin', new Date().toISOString());
  console.log(`✔ Created admin ${email}`);
}

console.log(`  Login with:  ${email} / ${password}`);
console.log('  (Change ADMIN_PASSWORD in server/.env and re-run `npm run seed` to rotate.)');

// ── Demo data ──────────────────────────────────────────────────────
// Fixed IDs + INSERT OR IGNORE → safe to re-run without duplicating.
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

const insertEvent = db.prepare(`
  INSERT OR IGNORE INTO events (id, title, event_type, date, time, location, description, status, notes, created_at)
  VALUES (@id, @title, @event_type, @date, @time, @location, @description, @status, @notes, @created_at)
`);
let added = 0;
for (const e of demoEvents) {
  const r = insertEvent.run({ ...e, created_at: ts });
  added += r.changes;
}

const insertAnn = db.prepare(
  'INSERT OR IGNORE INTO announcements (id, title, body, created_at) VALUES (?, ?, ?, ?)'
);
const annRes = insertAnn.run(
  'demo-ann-1',
  'Welcome to the SSBBN Kirtan Panel',
  'Check the calendar for upcoming kirtan and temple events. Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh.',
  ts
);

console.log(`✔ Demo data: ${added} new event(s), ${annRes.changes} new announcement(s) (existing rows left untouched).`);
