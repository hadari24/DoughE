const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// logger middleware
const logger = require('./middleware/logger');
app.use(logger);

// routes
const usersRoutes = require('./routes/users');
const recipesRoutes = require('./routes/recipes');

app.use('/api/users', usersRoutes);
app.use('/api/recipes', recipesRoutes);

const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Dough-E API is running' }, error: null });
});

// 404 for unknown
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route does not exist', details: { path: req.path } }
  });
});

// global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Dough-E API running on http://localhost:${PORT}`);
});
