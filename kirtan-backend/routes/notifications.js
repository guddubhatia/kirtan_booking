const router = require('express').Router();
const { Queries, generateId } = require('../db');
const { requireAuth } = require('../middleware/auth');

// Register a push token (called by the mobile app)
router.post('/register', (req, res) => {
  const { token } = req.body ?? {};
  if (!token) return res.status(400).json({ error: 'token required' });
  Queries.tokens.upsert.run(token, new Date().toISOString());
  res.json({ registered: true });
});

// Send broadcast push notification via Expo Push API (admin only)
router.post('/send', requireAuth, async (req, res) => {
  const { title, body } = req.body ?? {};
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });

  const tokens = Queries.tokens.getAll.all().map(r => r.token);
  if (tokens.length === 0) return res.json({ sent: 0 });

  const messages = tokens.map(to => ({ to, sound: 'default', title, body }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    const result = await response.json();
    res.json({ sent: messages.length, result });
  } catch (err) {
    res.status(500).json({ error: 'Push delivery failed', detail: err.message });
  }
});

module.exports = router;
