const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
router.use(authenticate, requireAdmin);
router.get('/stats', (req, res) => {
  try {
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE status != ?').get('DELETED');
    const lostItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE type = ? AND status != ?').get('lost', 'DELETED');
    const foundItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE type = ? AND status != ?').get('found', 'DELETED');
    const activeItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE status = ?').get('ACTIVE');
    const pendingItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE status = ?').get('PENDING_CLAIM');
    const returnedItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE status = ?').get('RETURNED');
    const expiredItems = db.prepare('SELECT COUNT(*) as count FROM items WHERE status = ?').get('EXPIRED');
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user');
    const totalClaims = db.prepare('SELECT COUNT(*) as count FROM claim_requests').get();
    const pendingClaims = db.prepare('SELECT COUNT(*) as count FROM claim_requests WHERE status = ?').get('WAITING');
    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM items WHERE status != 'DELETED' GROUP BY category ORDER BY count DESC
    `).all();
    const monthlyStats = db.prepare(`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as total,
        SUM(CASE WHEN type = 'lost' THEN 1 ELSE 0 END) as lost,
        SUM(CASE WHEN type = 'found' THEN 1 ELSE 0 END) as found
      FROM items 
      WHERE status != 'DELETED' AND createdAt >= datetime('now', '-6 months')
      GROUP BY month 
      ORDER BY month DESC
    `).all();

    res.json({
      stats: {
        totalItems: totalItems.count,
        lostItems: lostItems.count,
        foundItems: foundItems.count,
        activeItems: activeItems.count,
        pendingItems: pendingItems.count,
        returnedItems: returnedItems.count,
        expiredItems: expiredItems.count,
        totalUsers: totalUsers.count,
        totalClaims: totalClaims.count,
        pendingClaims: pendingClaims.count
      },
      byCategory,
      monthlyStats
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT userId, username, email, role, banned, createdAt,
        (SELECT COUNT(*) FROM items WHERE userId = users.userId) as itemCount
      FROM users
      ORDER BY createdAt DESC
    `).all();

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.put('/users/:id/ban', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE userId = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'ไม่สามารถระงับบัญชี Admin ได้' });
    }

    const newBanned = user.banned ? 0 : 1;
    db.prepare('UPDATE users SET banned = ? WHERE userId = ?').run(newBanned, req.params.id);

    res.json({ message: newBanned ? 'ระงับบัญชีเรียบร้อย' : 'ยกเลิกการระงับบัญชีเรียบร้อย' });
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.put('/items/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'PENDING_CLAIM', 'RETURNED', 'EXPIRED', 'DELETED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const item = db.prepare('SELECT * FROM items WHERE itemId = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการนี้' });
    }

    db.prepare('UPDATE items SET status = ? WHERE itemId = ?').run(status, req.params.id);
    res.json({ message: `อัปเดตสถานะเป็น ${status} เรียบร้อย` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/claims', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT cr.*, u.username as requesterName, i.title as itemTitle, i.photoUrl as itemPhotoUrl,
        owner.username as ownerName
      FROM claim_requests cr
      JOIN users u ON cr.requesterId = u.userId
      JOIN items i ON cr.itemId = i.itemId
      JOIN users owner ON i.userId = owner.userId
    `;
    const params = [];

    if (status) {
      query += ' WHERE cr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cr.createdAt DESC';

    const claims = db.prepare(query).all(...params);
    res.json({ claims });
  } catch (err) {
    console.error('List all claims error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/items', (req, res) => {
  try {
    const { status, type, search } = req.query;
    let where = [];
    let params = [];

    if (status) {
      where.push('i.status = ?');
      params.push(status);
    }
    if (type) {
      where.push('i.type = ?');
      params.push(type);
    }
    if (search) {
      where.push('(i.title LIKE ? OR i.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const items = db.prepare(`
      SELECT i.*, u.username as postedBy
      FROM items i
      JOIN users u ON i.userId = u.userId
      ${whereClause}
      ORDER BY i.createdAt DESC
    `).all(...params);

    res.json({ items });
  } catch (err) {
    console.error('Admin list items error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
