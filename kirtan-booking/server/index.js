// SSBBN Kirtan Panel — REST backend (Express + PostgreSQL + JWT)
// Implements exactly the endpoints the Expo app calls in services/api.ts
// and services/notifications.ts.
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { pool, setupSchema } = require('./db');
const { signToken, requireAuth } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

// Wrap async route handlers so rejected promises hit the error middleware
// instead of crashing the process.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── Health ─────────────────────────────────────────────────────────
app.get('/api/health', wrap(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, time: now() });
}));

// ── Auth ───────────────────────────────────────────────────────────
// POST /api/auth/login  { email, password } -> { email, role, token }
app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const { rows } = await pool.query(
    'SELECT * FROM admins WHERE email = $1',
    [String(email).toLowerCase()]
  );
  const admin = rows[0];
  if (!admin || !bcrypt.compareSync(String(password), admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ email: admin.email, role: admin.role, token: signToken(admin) });
}));

// ── Events ─────────────────────────────────────────────────────────
const EVENT_FIELDS = ['title', 'event_type', 'date', 'time', 'location', 'description', 'status', 'notes'];
// "time" is a reserved word in PostgreSQL — it is quoted everywhere it appears.
const EVENT_SELECT = 'id, title, event_type, date, "time", location, description, status, notes, created_at';

// GET /api/events (public) -> EventRow[]
app.get('/api/events', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${EVENT_SELECT} FROM events ORDER BY date ASC, "time" ASC`
  );
  res.json(rows);
}));

// GET /api/events/:id (public) -> EventRow
app.get('/api/events/:id', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${EVENT_SELECT} FROM events WHERE id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json(rows[0]);
}));

// POST /api/events (admin) -> EventRow
app.post('/api/events', requireAuth, wrap(async (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.event_type || !b.date) {
    return res.status(400).json({ error: 'title, event_type and date are required' });
  }
  const row = {
    id: uuid(),
    title: b.title,
    event_type: b.event_type,
    date: b.date,
    time: b.time || '',
    location: b.location || '',
    description: b.description || '',
    status: b.status || 'confirmed',
    notes: b.notes || '',
    created_at: now(),
  };
  await pool.query(
    `INSERT INTO events (id, title, event_type, date, "time", location, description, status, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [row.id, row.title, row.event_type, row.date, row.time, row.location, row.description, row.status, row.notes, row.created_at]
  );
  res.status(201).json(row);
}));

// PUT /api/events/:id (admin) -> EventRow
app.put('/api/events/:id', requireAuth, wrap(async (req, res) => {
  const existing = (await pool.query('SELECT id FROM events WHERE id = $1', [req.params.id])).rows[0];
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  const updates = {};
  for (const f of EVENT_FIELDS) {
    if (req.body && req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length > 0) {
    const keys = Object.keys(updates);
    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const values = keys.map((k) => updates[k]);
    values.push(req.params.id);
    await pool.query(`UPDATE events SET ${setClauses} WHERE id = $${values.length}`, values);
  }

  const { rows } = await pool.query(`SELECT ${EVENT_SELECT} FROM events WHERE id = $1`, [req.params.id]);
  res.json(rows[0]);
}));

// DELETE /api/events/:id (admin)
app.delete('/api/events/:id', requireAuth, wrap(async (req, res) => {
  await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

// ── Announcements ──────────────────────────────────────────────────
// GET /api/announcements (public) -> AnnRow[]
app.get('/api/announcements', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json(rows);
}));

// POST /api/announcements (admin) -> AnnRow
app.post('/api/announcements', requireAuth, wrap(async (req, res) => {
  const { title, body } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const row = { id: uuid(), title, body: body || '', created_at: now() };
  await pool.query(
    'INSERT INTO announcements (id, title, body, created_at) VALUES ($1, $2, $3, $4)',
    [row.id, row.title, row.body, row.created_at]
  );
  res.status(201).json(row);
}));

// DELETE /api/announcements/:id (admin)
app.delete('/api/announcements/:id', requireAuth, wrap(async (req, res) => {
  await pool.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

// ── Push notifications ─────────────────────────────────────────────
// POST /api/notifications/register  { token }  (public — devices self-register)
app.post('/api/notifications/register', wrap(async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token is required' });
  await pool.query(
    'INSERT INTO push_tokens (token, created_at) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING',
    [token, now()]
  );
  res.json({ ok: true });
}));

// GET /api/notifications/tokens (admin) -> string[]
app.get('/api/notifications/tokens', requireAuth, wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT token FROM push_tokens');
  res.json(rows.map((r) => r.token));
}));

// Forward an array of Expo push messages to Expo's push service.
async function pushToExpo(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return { sent: 0 };
  const resp = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  const data = await resp.json().catch(() => ({}));
  return { sent: messages.length, expo: data };
}

// POST /send-notifications  { messages: [...] }
// Matches services/notifications.ts (note: not under /api, and the app sends no auth header).
app.post('/send-notifications', wrap(async (req, res) => {
  try {
    const result = await pushToExpo((req.body || {}).messages);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Expo push service' });
  }
}));

// POST /api/notifications/broadcast  { title, body }  (admin) — recommended path:
// reads all stored tokens server-side and broadcasts. No need to ship tokens to the client.
app.post('/api/notifications/broadcast', requireAuth, wrap(async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
  const { rows } = await pool.query('SELECT token FROM push_tokens');
  const tokens = rows.map((r) => r.token);
  const messages = tokens.map((token) => ({
    to: token, sound: 'default', title, body, data: { type: 'announcement' },
  }));
  try {
    const result = await pushToExpo(messages);
    res.json({ ok: true, recipients: tokens.length, ...result });
  } catch {
    res.status(502).json({ error: 'Failed to reach Expo push service' });
  }
}));

// ── Serve the exported web build (dist/) so web runs same-origin ───
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA fallback for non-API GET routes
  app.get(/^(?!\/api|\/send-notifications).*/, (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

// ── Error + 404 ────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start (after the schema is ready) ──────────────────────────────
const PORT = process.env.PORT || 4000;
setupSchema()
  .then(() => app.listen(PORT, () => {
    console.log(`☬ SSBBN Kirtan backend listening on http://localhost:${PORT}`);
  }))
  .catch((err) => {
    console.error('DB setup failed:', err);
    process.exit(1);
  });
