const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'evidence'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});
router.post('/', authenticate, upload.single('evidence'), async (req, res) => {)
  try {
    const { itemId, message } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'กรุณาระบุรายการที่ต้องการขอรับคืน' });
    }

    const item = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(itemId);
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการนี้' });
    }
    if (item.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'รายการนี้ไม่สามารถขอรับคืนได้ในตอนนี้' });
    }
    if (item.userId === req.user.userId) {
      return res.status(400).json({ error: 'คุณไม่สามารถขอรับคืนรายการของตัวเองได้' });
    }
    const existingClaim = await db.prepare(
      'SELECT * FROM claim_requests WHERE itemId = ? AND requesterId = ? AND status = ?'
    ).get(itemId, req.user.userId, 'WAITING');
    if (existingClaim) {
      return res.status(409).json({ error: 'คุณมีคำขอรับคืนรายการนี้อยู่แล้ว' });
    }

    const claimId = uuidv4();
    const evidencePhotoUrl = req.file ? `/uploads/evidence/${req.file.filename}` : null;

    await db.prepare(`
      INSERT INTO claim_requests (claimId, itemId, requesterId, evidencePhotoUrl, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(claimId, itemId, req.user.userId, evidencePhotoUrl, message || '');
    await db.prepare('UPDATE items SET status = ? WHERE itemId = ?').run('PENDING_CLAIM', itemId);

    const claim = await db.prepare('SELECT * FROM claim_requests WHERE claimId = ?').get(claimId);
    res.status(201).json({ claim });
  } catch (err) {
    console.error('Create claim error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/item/:itemId', authenticate, async (req, res) => {)
  try {
    const claims = await db.prepare(`
      SELECT cr.*, u.username as requesterName
      FROM claim_requests cr
      JOIN users u ON cr.requesterId = u.userId
      WHERE cr.itemId = ?
      ORDER BY cr.createdAt DESC
    `).all(req.params.itemId);

    res.json({ claims });
  } catch (err) {
    console.error('List claims error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/my', authenticate, async (req, res) => {)
  try {
    const claims = await db.prepare(`
      SELECT cr.*, i.title as itemTitle, i.photoUrl as itemPhotoUrl
      FROM claim_requests cr
      JOIN items i ON cr.itemId = i.itemId
      WHERE cr.requesterId = ?
      ORDER BY cr.createdAt DESC
    `).all(req.user.userId);

    res.json({ claims });
  } catch (err) {
    console.error('List my claims error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.put('/:id/accept', authenticate, async (req, res) => {)
  try {
    const claim = await db.prepare('SELECT * FROM claim_requests WHERE claimId = ?').get(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'ไม่พบคำขอนี้' });
    }

    const item = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(claim.itemId);
    if (item.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์อนุมัติคำขอนี้' });
    }
    await db.prepare('UPDATE claim_requests SET status = ? WHERE claimId = ?').run('ACCEPTED', req.params.id);
    await db.prepare(
      'UPDATE claim_requests SET status = ? WHERE itemId = ? AND claimId != ? AND status = ?'
    ).run('REJECTED', claim.itemId, req.params.id, 'WAITING');
    await db.prepare('UPDATE items SET status = ? WHERE itemId = ?').run('RETURNED', claim.itemId);

    res.json({ message: 'อนุมัติคำขอเรียบร้อย — สถานะเปลี่ยนเป็น RETURNED' });
  } catch (err) {
    console.error('Accept claim error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.put('/:id/reject', authenticate, async (req, res) => {)
  try {
    const claim = await db.prepare('SELECT * FROM claim_requests WHERE claimId = ?').get(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'ไม่พบคำขอนี้' });
    }

    const item = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(claim.itemId);
    if (item.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ปฏิเสธคำขอนี้' });
    }

    await db.prepare('UPDATE claim_requests SET status = ? WHERE claimId = ?').run('REJECTED', req.params.id);
    const remaining = await db.prepare(
      'SELECT COUNT(*) as count FROM claim_requests WHERE itemId = ? AND status = ?'
    ).get(claim.itemId, 'WAITING');
    
    if (remaining.count === 0) {
      await db.prepare('UPDATE items SET status = ? WHERE itemId = ?').run('ACTIVE', claim.itemId);
    }

    res.json({ message: 'ปฏิเสธคำขอเรียบร้อย' });
  } catch (err) {
    console.error('Reject claim error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
