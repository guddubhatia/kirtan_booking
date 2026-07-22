// Cloud Functions — SSBBN Kirtan Panel
// Server-side push notifications (deliver even when the app is closed):
//   1) pushAnnouncementOnCreate — admin posts an announcement → notify everyone.
//   2) sendKirtanMorningReminder — daily at 10:00 IST → notify everyone about
//      any confirmed kirtan happening that day.
//
// Delivery uses Expo's push service (the app registers Expo push tokens in the
// `pushTokens` collection). Requires the Blaze plan. Region: asia-south1
// (matches the Firestore database).
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { setGlobalOptions } = require('firebase-functions/v2');
const logger = require('firebase-functions/logger');

initializeApp();
const db = getFirestore();

setGlobalOptions({ region: 'asia-south1', maxInstances: 5 });

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Read every registered Expo push token from Firestore.
async function getAllTokens() {
  const snap = await db.collection('pushTokens').get();
  const tokens = [];
  snap.forEach((doc) => {
    const t = doc.get('token');
    if (typeof t === 'string' && t.startsWith('ExponentPushToken')) tokens.push(t);
  });
  return tokens;
}

// Push one payload to many tokens, chunked to Expo's 100-messages-per-request
// limit. Tokens Expo reports as DeviceNotRegistered are pruned so dead devices
// don't pile up (the doc id IS the token — see services/api.ts savePushToken).
async function sendPush(tokens, title, body, data) {
  if (!tokens.length) {
    logger.info('No push tokens registered — nothing to send.');
    return;
  }
  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100);
    const messages = chunk.map((to) => ({ to, sound: 'default', title, body, data: data || {} }));
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });
      const json = await res.json();
      const tickets = (json && json.data) || [];
      const dead = [];
      tickets.forEach((ticket, idx) => {
        if (
          ticket &&
          ticket.status === 'error' &&
          ticket.details &&
          ticket.details.error === 'DeviceNotRegistered'
        ) {
          dead.push(chunk[idx]);
        }
      });
      await Promise.all(
        dead.map((t) => db.collection('pushTokens').doc(t).delete().catch(() => {}))
      );
      if (dead.length) logger.info(`Pruned ${dead.length} unregistered token(s).`);
    } catch (err) {
      logger.error('Expo push request failed', err);
    }
  }
  logger.info(`Push dispatched to ${tokens.length} device(s): "${title}"`);
}

// 1) Announcement created → notify everyone at that moment.
exports.pushAnnouncementOnCreate = onDocumentCreated('announcements/{id}', async (event) => {
  const doc = event.data;
  if (!doc) return;
  const ann = doc.data() || {};
  const title = (ann.title && String(ann.title).trim()) || 'SSBBN Announcement';
  const body = (ann.body && String(ann.body).trim()) || '';
  const tokens = await getAllTokens();
  await sendPush(tokens, title, body, { type: 'announcement', id: event.params.id });
});

// 2) Every morning at 10:00 IST → remind everyone about today's confirmed kirtans.
exports.sendKirtanMorningReminder = onSchedule(
  { schedule: '0 10 * * *', timeZone: 'Asia/Kolkata' },
  async () => {
    // "Today" in IST as YYYY-MM-DD (matches how event dates are stored).
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    // Single-field equality → no composite index needed; filter the rest in code.
    const snap = await db.collection('events').where('date', '==', todayStr).get();
    const kirtans = [];
    snap.forEach((d) => {
      const e = d.data() || {};
      if (e.eventType === 'kirtan' && e.status === 'confirmed') kirtans.push(e);
    });
    if (!kirtans.length) {
      logger.info(`No confirmed kirtan on ${todayStr} — no reminder sent.`);
      return;
    }
    const title = kirtans.length === 1 ? '🎵 Kirtan Today' : `🎵 ${kirtans.length} Kirtans Today`;
    const lines = kirtans.map((k) => {
      const parts = [k.title || 'Kirtan'];
      if (k.time) parts.push(`at ${k.time}`);
      if (k.location) parts.push(`— ${k.location}`);
      return parts.join(' ');
    });
    const body = `${lines.join('\n')}\n\nJai Babe Di 🙏`;
    const tokens = await getAllTokens();
    await sendPush(tokens, title, body, { type: 'kirtan-reminder', date: todayStr });
  }
);
