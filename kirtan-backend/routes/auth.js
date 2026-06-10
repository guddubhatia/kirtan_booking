const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin credentials come from env; hash lazily on first use
let _hashedPassword = null;
function getHash() {
  if (!_hashedPassword) {
    _hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  }
  return _hashedPassword;
}

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (
    email !== process.env.ADMIN_EMAIL ||
    !bcrypt.compareSync(password, getHash())
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, email, role: 'admin' });
});

module.exports = router;
