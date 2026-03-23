const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
router.post('/rooms', authenticate, async (req, res) => {
  try {
    const { itemId, otherUserId } = req.body;

    if (!itemId || !otherUserId) {
      return res.status(400).json({ error: 'กรุณาระบุรายการและผู้ใช้' });
    }
    const existingRoom = await db.prepare(`
      SELECT cr.chatId FROM chat_rooms cr
      JOIN chat_participants cp1 ON cr.chatId = cp1.chatId AND cp1.userId = ?
      JOIN chat_participants cp2 ON cr.chatId = cp2.chatId AND cp2.userId = ?
      WHERE cr.itemId = ?
    `).get(req.user.userId, otherUserId, itemId);

    if (existingRoom) {
      const room = await db.prepare(`
        SELECT cr.*, 
          (SELECT GROUP_CONCAT(u.username) FROM chat_participants cp JOIN users u ON cp.userId = u.userId WHERE cp.chatId = cr.chatId) as participants
        FROM chat_rooms cr WHERE cr.chatId = ?
      `).get(existingRoom.chatId);
      return res.json({ room });
    }
    const chatId = uuidv4();
    await db.prepare('INSERT INTO chat_rooms (chatId, itemId) VALUES (?, ?)').run(chatId, itemId);
    await db.prepare('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)').run(chatId, req.user.userId);
    await db.prepare('INSERT INTO chat_participants (chatId, userId) VALUES (?, ?)').run(chatId, otherUserId);

    const room = await db.prepare('SELECT * FROM chat_rooms WHERE chatId = ?').get(chatId);
    res.status(201).json({ room: { ...room, participants: `${req.user.username}` } });
  } catch (err) {
    console.error('Create chat room error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const rooms = await db.prepare(`
      SELECT cr.chatId, cr.itemId, cr.createdAt,
        i.title as itemTitle, i.photoUrl as itemPhotoUrl,
        (SELECT content FROM messages WHERE chatId = cr.chatId ORDER BY createdAt DESC LIMIT 1) as lastMessage,
        (SELECT createdAt FROM messages WHERE chatId = cr.chatId ORDER BY createdAt DESC LIMIT 1) as lastMessageAt,
        (SELECT GROUP_CONCAT(u.username) FROM chat_participants cp JOIN users u ON cp.userId = u.userId WHERE cp.chatId = cr.chatId AND cp.userId != ?) as otherUser
      FROM chat_rooms cr
      JOIN chat_participants cp ON cr.chatId = cp.chatId
      JOIN items i ON cr.itemId = i.itemId
      WHERE cp.userId = ?
      ORDER BY COALESCE(lastMessageAt, cr.createdAt) DESC
    `).all(req.user.userId, req.user.userId);

    res.json({ rooms });
  } catch (err) {
    console.error('List chat rooms error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.get('/rooms/:chatId/messages', authenticate, async (req, res) => {
  try {
    const participant = await db.prepare(
      'SELECT * FROM chat_participants WHERE chatId = ? AND userId = ?'
    ).get(req.params.chatId, req.user.userId);
    
    if (!participant) {
      return res.status(403).json({ error: 'คุณไม่ได้เป็นสมาชิกห้องแชทนี้' });
    }

    const messages = await db.prepare(`
      SELECT m.*, u.username as senderName
      FROM messages m
      JOIN users u ON m.senderId = u.userId
      WHERE m.chatId = ?
      ORDER BY m.createdAt ASC
    `).all(req.params.chatId);

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});
router.post('/rooms/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'กรุณาพิมพ์ข้อความ' });
    }
    const participant = await db.prepare(
      'SELECT * FROM chat_participants WHERE chatId = ? AND userId = ?'
    ).get(req.params.chatId, req.user.userId);
    
    if (!participant) {
      return res.status(403).json({ error: 'คุณไม่ได้เป็นสมาชิกห้องแชทนี้' });
    }

    const messageId = uuidv4();
    await db.prepare('INSERT INTO messages (messageId, chatId, senderId, content) VALUES (?, ?, ?, ?)').run(
      messageId, req.params.chatId, req.user.userId, content.trim()
    );

    const message = await db.prepare(`
      SELECT m.*, u.username as senderName
      FROM messages m
      JOIN users u ON m.senderId = u.userId
      WHERE m.messageId = ?
    `).get(messageId);

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
