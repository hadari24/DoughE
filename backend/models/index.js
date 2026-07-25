const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'doughe',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, DataTypes);
db.Admin = require('./admin')(sequelize, DataTypes);
db.Recipe = require('./recipe')(sequelize, DataTypes);
db.Ingredient = require('./ingredient')(sequelize, DataTypes);
db.RecipeIngredient = require('./recipeIngredient')(sequelize, DataTypes);
db.Comment = require('./comment')(sequelize, DataTypes);
db.RecipeLike = require('./recipeLike')(sequelize, DataTypes);

// one-to-one: User <-> Admin
db.User.hasOne(db.Admin, { foreignKey: 'userId', as: 'admin' });
db.Admin.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// one-to-many: User -> Recipes
db.User.hasMany(db.Recipe, { foreignKey: 'authorId', as: 'recipes' });
db.Recipe.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

// one-to-many: Recipe -> Comments, User -> Comments
db.Recipe.hasMany(db.Comment, { foreignKey: 'recipeId', as: 'comments' });
db.Comment.belongsTo(db.Recipe, { foreignKey: 'recipeId', as: 'recipe' });
db.User.hasMany(db.Comment, { foreignKey: 'userId', as: 'comments' });
db.Comment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// many-to-many: Recipe <-> Ingredient through recipe_ingredients
db.Recipe.belongsToMany(db.Ingredient, {
  through: db.RecipeIngredient, foreignKey: 'recipeId', otherKey: 'ingredientId', as: 'ingredients',
});
db.Ingredient.belongsToMany(db.Recipe, {
  through: db.RecipeIngredient, foreignKey: 'ingredientId', otherKey: 'recipeId', as: 'recipes',
});

// many-to-many: User <-> Recipe through recipe_likes (likes)
db.User.belongsToMany(db.Recipe, {
  through: db.RecipeLike, foreignKey: 'userId', otherKey: 'recipeId', as: 'likedRecipes',
});
db.Recipe.belongsToMany(db.User, {
  through: db.RecipeLike, foreignKey: 'recipeId', otherKey: 'userId', as: 'likedBy',
});

module.exports = db;
