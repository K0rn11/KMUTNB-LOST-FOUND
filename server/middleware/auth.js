const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'kmutnb-lost-found-secret-key-2026';

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare('SELECT userId, username, email, role, banned FROM users WHERE userId = ?').get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'ไม่พบผู้ใช้งาน' });
    }
    if (user.banned) {
      return res.status(403).json({ error: 'บัญชีของคุณถูกระงับ' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'สิทธิ์ Admin เท่านั้น' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, JWT_SECRET };
