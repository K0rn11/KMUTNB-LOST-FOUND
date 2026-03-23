const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'items'));
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
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif)'));
    }
  }
});
router.get('/', async (req, res) => {
  try {
    const { category, location, type, status, search, page = 1, limit = 20 } = req.query;
    
    let where = ['i.status != ?'];
    let params = ['DELETED'];

    if (category) {
      where.push('i.category = ?');
      params.push(category);
    }
    if (location) {
      where.push('i.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (type) {
      where.push('i.type = ?');
      params.push(type);
    }
    if (status) {
      where.push('i.status = ?');
      params.push(status);
    }
    if (search) {
      where.push('(i.title LIKE ? OR i.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = await db.prepare(`SELECT COUNT(*) as total FROM items i ${whereClause}`).get(...params);
    
    const items = await db.prepare(`
      SELECT i.*, u.username as postedBy
      FROM items i
      JOIN users u ON i.userId = u.userId
      ${whereClause}
      ORDER BY i.createdAt DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      items,
      total: countRow.total,
      page: parseInt(page),
      totalPages: Math.ceil(countRow.total / parseInt(limit))
    });
  } catch (err) {
    console.error('List items error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const item = await db.prepare(`
      SELECT i.*, u.username as postedBy
      FROM items i
      JOIN users u ON i.userId = u.userId
      WHERE i.itemId = ?
    `).get(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการนี้' });
    }

    res.json({ item });
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.post('/', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, location, type } = req.body;

    if (!title || !category || !location || !type) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' });
    }

    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({ error: 'ประเภทต้องเป็น lost หรือ found' });
    }

    const itemId = uuidv4();
    const photoUrl = req.file ? `/uploads/items/${req.file.filename}` : null;

    await db.prepare(`
      INSERT INTO items (itemId, userId, title, description, photoUrl, category, location, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(itemId, req.user.userId, title, description || '', photoUrl, category, location, type);

    const item = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(itemId);
    res.status(201).json({ item });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.put('/:id', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const item = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการนี้' });
    }
    if (item.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขรายการนี้' });
    }

    const { title, description, category, location } = req.body;
    const photoUrl = req.file ? `/uploads/items/${req.file.filename}` : item.photoUrl;

    await db.prepare(`
      UPDATE items SET title = ?, description = ?, photoUrl = ?, category = ?, location = ?
      WHERE itemId = ?
    `).run(
      title || item.title,
      description !== undefined ? description : item.description,
      photoUrl,
      category || item.category,
      location || item.location,
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(req.params.id);
    res.json({ item: updated });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await db.prepare('SELECT * FROM items WHERE itemId = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการนี้' });
    }
    if (item.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ลบรายการนี้' });
    }

    await db.prepare('UPDATE items SET status = ? WHERE itemId = ?').run('DELETED', req.params.id);
    res.json({ message: 'ลบรายการเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
