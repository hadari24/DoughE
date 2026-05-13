// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Built-in middlewares
app.use(cors());
app.use(express.json());

// Logger middleware (written by Hadar in middleware/logger.js)
const logger = require('./middleware/logger');
app.use(logger);

// Routes — each route file is written by its owner
const usersRoutes = require('./routes/users');
const recipesRoutes = require('./routes/recipes');

app.use('/users', usersRoutes);
app.use('/recipes', recipesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Dough-E API is running' }, error: null });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route does not exist', details: { path: req.path } }
  });
});

// Global error handler (written by Hadar in middleware/errorHandler.js)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Dough-E API running on http://localhost:${PORT}`);
});
