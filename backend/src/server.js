require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const db = require('../models');
const { initSocket } = require('./socket');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/users', require('./routes/users'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Dough-E API is running' }, error: null });
});

app.use((req, res) => {
  res.status(404).json({
    success: false, data: null,
    error: { code: 'NOT_FOUND', message: 'Route does not exist', details: { path: req.path } },
  });
});

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
initSocket(io);

// lightweight dev migration: add columns that were introduced after a table
// was first created, so existing databases pick them up on restart (no data loss).
async function ensureColumns() {
  const checks = [
    { table: 'recipe_likes', column: 'note', ddl: 'ALTER TABLE recipe_likes ADD COLUMN note TEXT' },
    { table: 'comments', column: 'rating', ddl: 'ALTER TABLE comments ADD COLUMN rating INT' },
  ];
  for (const c of checks) {
    const [rows] = await db.sequelize.query(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${c.table}' AND COLUMN_NAME = '${c.column}'`
    );
    if (Number(rows[0].n) === 0) {
      await db.sequelize.query(c.ddl);
      console.log(`Migration: added ${c.table}.${c.column}`);
    }
  }
}

// create the database/schema itself if it doesn't exist yet (e.g. a brand-new
// RDS instance created without an initial database name). Connects without a
// database selected, creates it, then the normal Sequelize connection can use it.
async function ensureDatabase() {
  const mysql = require('mysql2/promise');
  const name = process.env.DB_NAME || 'doughe';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\`;`);
  await conn.end();
  console.log(`Database "${name}" ready.`);
}

async function start() {
  try {
    await ensureDatabase();
    await db.sequelize.authenticate();
    console.log('MySQL connection OK.');
    await db.sequelize.sync();
    console.log('Models synced.');
    await ensureColumns();
    server.listen(PORT, () => {
      console.log(`Dough-E API + Socket.IO running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
