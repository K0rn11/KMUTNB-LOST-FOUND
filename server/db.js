const { createClient } = require('@libsql/client');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = {
  prepare: (sql) => {
    return {
      get: async (...args) => {
        const res = await client.execute({ sql, args });
        if (res.rows.length > 0) {
          return Object.assign({}, res.rows[0]);
        }
        return undefined;
      },
      all: async (...args) => {
        const res = await client.execute({ sql, args });
        return res.rows.map(r => Object.assign({}, r));
      },
      run: async (...args) => {
        const res = await client.execute({ sql, args });
        return { lastInsertRowid: res.lastInsertRowid, changes: res.rowsAffected };
      }
    };
  },
  exec: async (sql) => {
    await client.executeMultiple(sql);
  },
  initDB: async () => {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        banned INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS items (
        itemId TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        photoUrl TEXT,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
        status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'PENDING_CLAIM', 'RETURNED', 'EXPIRED', 'DELETED')),
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(userId)
      );

      CREATE TABLE IF NOT EXISTS claim_requests (
        claimId TEXT PRIMARY KEY,
        itemId TEXT NOT NULL,
        requesterId TEXT NOT NULL,
        evidencePhotoUrl TEXT,
        message TEXT,
        status TEXT DEFAULT 'WAITING' CHECK(status IN ('WAITING', 'ACCEPTED', 'REJECTED')),
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (itemId) REFERENCES items(itemId),
        FOREIGN KEY (requesterId) REFERENCES users(userId)
      );

      CREATE TABLE IF NOT EXISTS chat_rooms (
        chatId TEXT PRIMARY KEY,
        itemId TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (itemId) REFERENCES items(itemId)
      );

      CREATE TABLE IF NOT EXISTS chat_participants (
        chatId TEXT NOT NULL,
        userId TEXT NOT NULL,
        PRIMARY KEY (chatId, userId),
        FOREIGN KEY (chatId) REFERENCES chat_rooms(chatId),
        FOREIGN KEY (userId) REFERENCES users(userId)
      );

      CREATE TABLE IF NOT EXISTS messages (
        messageId TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (chatId) REFERENCES chat_rooms(chatId),
        FOREIGN KEY (senderId) REFERENCES users(userId)
      );

      CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
      CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
      CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
      CREATE INDEX IF NOT EXISTS idx_items_userId ON items(userId);
      CREATE INDEX IF NOT EXISTS idx_claims_itemId ON claim_requests(itemId);
      CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages(chatId);
    `);

    const res = await client.execute({ sql: 'SELECT COUNT(*) as count FROM users WHERE role = ?', args: ['admin'] });
    const adminCount = res.rows[0].count;
    
    if (adminCount == 0) {
      const { v4: uuidv4 } = require('uuid');
      const hash = bcrypt.hashSync('admin123', 10);
      await client.execute({
        sql: 'INSERT INTO users (userId, username, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
        args: [uuidv4(), 'admin', 'admin@kmutnb.ac.th', hash, 'admin']
      });
      console.log('✓ Default admin created (admin / admin123)');
    }
  }
};

module.exports = db;
