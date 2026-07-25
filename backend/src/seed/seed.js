// WARNING: uses { force: true } which DROPS and recreates all tables.
const db = require('../../models');

const users = [
  { firstName: 'Hadar', lastName: 'Ofer', userName: 'Hadar', email: 'hadar@dough.com', password: '123456', userRole: 'admin', theme: 'light' },
  { firstName: 'Shir', lastName: 'Battat', userName: 'Shir', email: 'shir@dough.com', password: 'abcdef', userRole: 'admin', theme: 'light' },
  { firstName: 'Noa', lastName: 'Kirel', userName: 'Noa', email: 'noa@dough.com', password: 'password', userRole: 'manager', theme: 'light' },
  { firstName: 'Matan', lastName: 'Perez', userName: 'Matan', email: 'matan@dough.com', password: 'password', userRole: 'user', theme: 'light' },
];

const recipes = [
  {
    title: 'Classic Pizza Dough', doughFamily: 'yeast-based', hydration: 65, difficulty: 'easy', totalTimeMinutes: 120,
    steps: ['Mix flour and salt', 'Add water and yeast', 'Knead 10 min', 'Rise 1 hour', 'Shape and bake 20-25 min at 180C'],
    ingredients: [
      { name: 'flour', amount: 500, unit: 'g' },
      { name: 'water', amount: 325, unit: 'ml' },
      { name: 'yeast', amount: 7, unit: 'g' },
      { name: 'salt', amount: 10, unit: 'g' },
    ],
  },
  {
    title: 'Sourdough Bread', doughFamily: 'sourdough', hydration: 75, difficulty: 'hard', totalTimeMinutes: 1440,
    steps: ['Mix starter and water', 'Add flour', 'Autolyse 30 min', 'Bulk ferment 6h', 'Shape', 'Cold proof overnight', 'Bake 30-35 min at 180C'],
    ingredients: [
      { name: 'flour', amount: 500, unit: 'g' },
      { name: 'water', amount: 375, unit: 'ml' },
      { name: 'starter', amount: 100, unit: 'g' },
      { name: 'salt', amount: 10, unit: 'g' },
    ],
  },
  {
    title: 'Quick Pancakes', doughFamily: 'batter', hydration: 90, difficulty: 'easy', totalTimeMinutes: 20,
    steps: ['Whisk dry ingredients', 'Add wet ingredients', 'Cook 2 min each side'],
    ingredients: [
      { name: 'flour', amount: 250, unit: 'g' },
      { name: 'milk', amount: 300, unit: 'ml' },
      { name: 'egg', amount: 50, unit: 'g' },
      { name: 'sugar', amount: 20, unit: 'g' },
    ],
  },
];

async function seed() {
  try {
    await db.sequelize.sync({ force: true });
    console.log('Tables created.');

    const createdUsers = await db.User.bulkCreate(users, { returning: true });
    console.log(`Inserted ${createdUsers.length} users.`);

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
          recipeId: recipe.recipeId,
          ingredientId: ingredient.ingredientId,
          amount: ing.amount,
          unit: ing.unit,
        });
      }
    }
    console.log(`Inserted ${recipes.length} recipes with linked ingredients.`);

    await db.Comment.create({ recipeId: 1, userId: 1, text: 'This pizza dough is a keeper!' });

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
