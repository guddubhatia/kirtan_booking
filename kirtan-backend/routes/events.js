const router = require('express').Router();
const { Queries, generateId } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(Queries.events.getAll.all());
});

router.get('/:id', (req, res) => {
  const row = Queries.events.getById.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', requireAuth, (req, res) => {
  const { title, event_type, date, time, location, description, status, notes } = req.body ?? {};
  if (!title || !date) return res.status(400).json({ error: 'title and date are required' });
  const row = {
    id: generateId(),
    title,
    event_type: event_type || 'kirtan',
    date,
    time: time || '',
    location: location || '',
    description: description || '',
    status: status || 'confirmed',
    notes: notes || '',
    created_at: new Date().toISOString(),
  };
  Queries.events.insert.run(row);
  res.status(201).json(row);
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = Queries.events.getById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const merged = { ...existing, ...req.body, id: req.params.id };
  Queries.events.update.run(merged);
  res.json(merged);
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = Queries.events.getById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  Queries.events.delete.run(req.params.id);
  res.json({ deleted: req.params.id });
});

module.exports = router;
