require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const WEB_DIST = path.resolve(__dirname, '../kirtan-booking/dist');

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'kirtan-backend' }));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve web app static files (if dist exists)
if (fs.existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  // SPA fallback — let expo-router handle all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(WEB_DIST, 'index.html'));
  });
} else {
  app.use((_, res) => res.status(404).json({ error: 'Not found' }));
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nKirtan Backend running on http://localhost:${PORT}`);
  console.log(`  Admin login: POST /api/auth/login`);
  console.log(`  Events:      GET  /api/events`);
  console.log(`  Health:      GET  /health\n`);
});
