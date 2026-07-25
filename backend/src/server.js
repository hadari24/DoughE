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

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('MySQL connection OK.');
    await db.sequelize.sync();
    console.log('Models synced.');
    server.listen(PORT, () => {
      console.log(`Dough-E API + Socket.IO running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
