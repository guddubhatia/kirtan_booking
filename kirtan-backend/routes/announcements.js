const router = require('express').Router();
const { Queries, generateId } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(Queries.announcements.getAll.all());
});

router.post('/', requireAuth, (req, res) => {
  const { title, body } = req.body ?? {};
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
  const row = {
    id: generateId(),
    title,
    body,
    created_at: new Date().toISOString(),
  };
  Queries.announcements.insert.run(row);
  res.status(201).json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  const existing = Queries.announcements.getById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  Queries.announcements.delete.run(req.params.id);
  res.json({ deleted: req.params.id });
});

module.exports = router;
