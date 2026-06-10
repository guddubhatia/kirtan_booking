// JWT auth helpers + middleware — SSBBN Kirtan Panel backend
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const TOKEN_TTL = process.env.JWT_TTL || '30d';

function signToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

// Express middleware — rejects requests without a valid Bearer token.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
