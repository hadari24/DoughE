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

// on a brand-new (empty) database, insert starter data so the app is usable
// right after deploy. Runs only when there are no users yet, so restarts never
// duplicate or wipe data (unlike the destructive npm run seed script).
async function ensureSeed() {
  const userCount = await db.User.count();
  if (userCount > 0) return;
  console.log('Empty database detected — seeding starter data...');

  const users = [
    { firstName: 'Hadar', lastName: 'Ofer', userName: 'Hadar', email: 'hadar@dough.com', password: '123456', userRole: 'admin', theme: 'light' },
    { firstName: 'Shir', lastName: 'Battat', userName: 'Shir', email: 'shir@dough.com', password: 'abcdef', userRole: 'admin', theme: 'light' },
    { firstName: 'Noa', lastName: 'Kirel', userName: 'Noa', email: 'noa@dough.com', password: 'password', userRole: 'manager', theme: 'light' },
    { firstName: 'Matan', lastName: 'Perez', userName: 'Matan', email: 'matan@dough.com', password: 'password', userRole: 'user', theme: 'light' },
  ];
  const recipes = [
    { title: 'Classic Pizza Dough', doughFamily: 'yeast-based', hydration: 65, difficulty: 'easy', totalTimeMinutes: 120,
      steps: ['Mix flour and salt', 'Add water and yeast', 'Knead 10 min', 'Rise 1 hour', 'Shape and bake 20-25 min at 180C'],
      ingredients: [ { name: 'flour', amount: 500, unit: 'g' }, { name: 'water', amount: 325, unit: 'ml' }, { name: 'yeast', amount: 7, unit: 'g' }, { name: 'salt', amount: 10, unit: 'g' } ] },
    { title: 'Sourdough Bread', doughFamily: 'sourdough', hydration: 75, difficulty: 'hard', totalTimeMinutes: 1440,
      steps: ['Mix starter and water', 'Add flour', 'Autolyse 30 min', 'Bulk ferment 6h', 'Shape', 'Cold proof overnight', 'Bake 30-35 min at 180C'],
      ingredients: [ { name: 'flour', amount: 500, unit: 'g' }, { name: 'water', amount: 375, unit: 'ml' }, { name: 'starter', amount: 100, unit: 'g' }, { name: 'salt', amount: 10, unit: 'g' } ] },
    { title: 'Quick Pancakes', doughFamily: 'batter', hydration: 90, difficulty: 'easy', totalTimeMinutes: 20,
      steps: ['Whisk dry ingredients', 'Add wet ingredients', 'Cook 2 min each side'],
      ingredients: [ { name: 'flour', amount: 250, unit: 'g' }, { name: 'milk', amount: 300, unit: 'ml' }, { name: 'egg', amount: 50, unit: 'g' }, { name: 'sugar', amount: 20, unit: 'g' } ] },
  ];

  const createdUsers = await db.User.bulkCreate(users, { returning: true });
  for (const u of createdUsers) {
    if (u.userRole === 'admin') {
      await db.Admin.create({ userId: u.userId, accessLevel: 'full' });
    }
  }
  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    const author = createdUsers[i % createdUsers.length];
    const recipe = await db.Recipe.create({
      title: r.title, doughFamily: r.doughFamily, hydration: r.hydration,
      difficulty: r.difficulty, totalTimeMinutes: r.totalTimeMinutes,
      steps: r.steps, authorId: author.userId,
    });
    for (const ing of r.ingredients) {
      const [ingredient] = await db.Ingredient.findOrCreate({ where: { name: ing.name } });
      await db.RecipeIngredient.create({
        recipeId: recipe.recipeId, ingredientId: ingredient.ingredientId, amount: ing.amount, unit: ing.unit,
      });
    }
  }
  await db.Comment.create({ recipeId: 1, userId: 1, text: 'This pizza dough is a keeper!' });
  console.log(`Seeded ${createdUsers.length} users and ${recipes.length} recipes.`);
}

async function start() {
  try {
    await ensureDatabase();
    await db.sequelize.authenticate();
    console.log('MySQL connection OK.');
    await db.sequelize.sync();
    console.log('Models synced.');
    await ensureColumns();
    await ensureSeed();
    server.listen(PORT, () => {
      console.log(`Dough-E API + Socket.IO running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
