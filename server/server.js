const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const uploadDirs = ['uploads/items', 'uploads/evidence'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});
app.use(cors()); // Allow all origins for production Vercel apps
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const db = require('./db');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err instanceof multer?.MulterError) {
    return res.status(400).json({ error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' });
  }
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
});

db.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🔍 KMUTNB Lost & Found API Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
