const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'kirtan.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY NOT NULL,
    title       TEXT NOT NULL,
    event_type  TEXT NOT NULL DEFAULT 'kirtan',
    date        TEXT NOT NULL,
    time        TEXT NOT NULL DEFAULT '',
    location    TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'confirmed',
    notes       TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id         TEXT PRIMARY KEY NOT NULL,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS push_tokens (
    token      TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Seed sample data on first run
const count = db.prepare('SELECT COUNT(*) as c FROM events').get();
if (count.c === 0) {
  const now = new Date().toISOString();
  const fmt = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const insertEvent = db.prepare(
    `INSERT INTO events (id,title,event_type,date,time,location,description,status,notes,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  );
  const insertAnn = db.prepare(
    `INSERT INTO announcements (id,title,body,created_at) VALUES (?,?,?,?)`
  );
  [
    ['seed-1','Evening Kirtan Sabha','kirtan',fmt(0),'18:30','Main Hall','Daily evening kirtan with sangat.','confirmed','All are welcome.',now],
    ['seed-2','Sunday Morning Kirtan','kirtan',fmt(2),'07:00','Main Hall','Weekly Sunday kirtan program.','confirmed','Langar after kirtan.',now],
    ['seed-3','Gurpurab Kirtan Samagam','kirtan',fmt(5),'06:00','Main Hall','Special kirtan for Gurpurab.','confirmed','Starts with Asa di Var.',now],
    ['seed-4','Temple Closed — Renovation','unavailable',fmt(7),'','Temple','Temple closed for renovation work.','confirmed','',now],
    ['seed-5','Akhand Path Bhog Kirtan','kirtan',fmt(10),'08:00','Main Hall','Bhog ceremony and kirtan.','tentative','',now],
    ['seed-6','Ladies Kirtan Samagam','kirtan',fmt(12),'10:00','Main Hall','Monthly ladies kirtan gathering.','confirmed','',now],
    ['seed-7','Youth Kirtan Program','kirtan',fmt(15),'16:00','Community Hall','Youth kirtan and learning session.','confirmed','Ages 10–25 welcome.',now],
  ].forEach(row => insertEvent.run(...row));

  [
    ['ann-1','Welcome to SSBBN Kirtan Panel','Stay updated with all kirtan events and schedules. Jai Babe Di!',now],
    ['ann-2','Sunday Kirtan Schedule Update','Sunday morning kirtan now starts at 7:00 AM instead of 7:30 AM.',now],
    ['ann-3','Gurpurab Special Program','A special all-day kirtan program is planned for the upcoming Gurpurab. Volunteers needed.',now],
  ].forEach(row => insertAnn.run(...row));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Events ────────────────────────────────────────────────────────
const Queries = {
  events: {
    getAll:    db.prepare('SELECT * FROM events ORDER BY date ASC'),
    getById:   db.prepare('SELECT * FROM events WHERE id = ?'),
    insert:    db.prepare(`INSERT INTO events (id,title,event_type,date,time,location,description,status,notes,created_at)
                           VALUES (@id,@title,@event_type,@date,@time,@location,@description,@status,@notes,@created_at)`),
    update:    db.prepare(`UPDATE events SET title=@title,event_type=@event_type,date=@date,time=@time,
                           location=@location,description=@description,status=@status,notes=@notes WHERE id=@id`),
    delete:    db.prepare('DELETE FROM events WHERE id = ?'),
  },
  announcements: {
    getAll:    db.prepare('SELECT * FROM announcements ORDER BY created_at DESC'),
    getById:   db.prepare('SELECT * FROM announcements WHERE id = ?'),
    insert:    db.prepare('INSERT INTO announcements (id,title,body,created_at) VALUES (@id,@title,@body,@created_at)'),
    delete:    db.prepare('DELETE FROM announcements WHERE id = ?'),
  },
  tokens: {
    getAll:    db.prepare('SELECT token FROM push_tokens'),
    upsert:    db.prepare('INSERT OR IGNORE INTO push_tokens (token,created_at) VALUES (?,?)'),
    delete:    db.prepare('DELETE FROM push_tokens WHERE token = ?'),
  },
};

module.exports = { Queries, generateId };
