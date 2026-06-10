// SSBBN Kirtan Panel — REST backend (Express + SQLite + JWT)
// Implements exactly the endpoints the Expo app calls in services/api.ts
// and services/notifications.ts.
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./db');
const { signToken, requireAuth } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

// ── Health ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, time: now() }));

// ── Auth ───────────────────────────────────────────────────────────
// POST /api/auth/login  { email, password } -> { email, role, token }
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(String(email).toLowerCase());
  if (!admin || !bcrypt.compareSync(String(password), admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ email: admin.email, role: admin.role, token: signToken(admin) });
});

// ── Events ─────────────────────────────────────────────────────────
const EVENT_FIELDS = ['title', 'event_type', 'date', 'time', 'location', 'description', 'status', 'notes'];

// GET /api/events (public) -> EventRow[]
app.get('/api/events', (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY date ASC, time ASC').all();
  res.json(rows);
});

// GET /api/events/:id (public) -> EventRow
app.get('/api/events/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Event not found' });
  res.json(row);
});

// POST /api/events (admin) -> EventRow
app.post('/api/events', requireAuth, (req, res) => {
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
  db.prepare(`
    INSERT INTO events (id, title, event_type, date, time, location, description, status, notes, created_at)
    VALUES (@id, @title, @event_type, @date, @time, @location, @description, @status, @notes, @created_at)
  `).run(row);
  res.status(201).json(row);
});

// PUT /api/events/:id (admin) -> EventRow
app.put('/api/events/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Event not found' });

  const updates = {};
  for (const f of EVENT_FIELDS) {
    if (req.body && req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (Object.keys(updates).length > 0) {
    const setClause = Object.keys(updates).map(f => `${f} = @${f}`).join(', ');
    db.prepare(`UPDATE events SET ${setClause} WHERE id = @id`).run({ ...updates, id: req.params.id });
  }
  res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id));
});

// DELETE /api/events/:id (admin)
app.delete('/api/events/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Announcements ──────────────────────────────────────────────────
// GET /api/announcements (public) -> AnnRow[]
app.get('/api/announcements', (req, res) => {
  res.json(db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all());
});

// POST /api/announcements (admin) -> AnnRow
app.post('/api/announcements', requireAuth, (req, res) => {
  const { title, body } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const row = { id: uuid(), title, body: body || '', created_at: now() };
  db.prepare('INSERT INTO announcements (id, title, body, created_at) VALUES (@id, @title, @body, @created_at)').run(row);
  res.status(201).json(row);
});

// DELETE /api/announcements/:id (admin)
app.delete('/api/announcements/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Push notifications ─────────────────────────────────────────────
// POST /api/notifications/register  { token }  (public — devices self-register)
app.post('/api/notifications/register', (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token is required' });
  db.prepare('INSERT OR IGNORE INTO push_tokens (token, created_at) VALUES (?, ?)').run(token, now());
  res.json({ ok: true });
});

// GET /api/notifications/tokens (admin) -> string[]
// Wire the app's services/api.ts getPushTokens() to this so admin broadcast works.
app.get('/api/notifications/tokens', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT token FROM push_tokens').all();
  res.json(rows.map(r => r.token));
});

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
app.post('/send-notifications', async (req, res) => {
  try {
    const result = await pushToExpo((req.body || {}).messages);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Expo push service' });
  }
});

// POST /api/notifications/broadcast  { title, body }  (admin) — recommended path:
// reads all stored tokens server-side and broadcasts. No need to ship tokens to the client.
app.post('/api/notifications/broadcast', requireAuth, async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
  const tokens = db.prepare('SELECT token FROM push_tokens').all().map(r => r.token);
  const messages = tokens.map(token => ({
    to: token, sound: 'default', title, body, data: { type: 'announcement' },
  }));
  try {
    const result = await pushToExpo(messages);
    res.json({ ok: true, recipients: tokens.length, ...result });
  } catch {
    res.status(502).json({ error: 'Failed to reach Expo push service' });
  }
});

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`☬ SSBBN Kirtan backend listening on http://localhost:${PORT}`);
});
