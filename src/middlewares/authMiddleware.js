require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'supersecret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, error: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Invalid token' });

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { id, role, school_id, can_edit_students }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

module.exports = { authMiddleware, sign };
