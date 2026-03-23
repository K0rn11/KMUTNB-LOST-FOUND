const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'lostfound.db');
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
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
const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
if (adminExists.count === 0) {
  const { v4: uuidv4 } = require('uuid');
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (userId, username, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(), 'admin', 'admin@kmutnb.ac.th', hash, 'admin'
  );
  console.log('✓ Default admin created (admin / admin123)');
}

module.exports = db;
