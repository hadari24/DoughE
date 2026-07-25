const db = require('../../models');

const success = (res, data, code = 200) => res.status(code).json({ success: true, data, error: null });
const error = (res, code, message, details = {}, status = 400) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

function shape(recipe) {
  const r = recipe.toJSON();
  return {
    recipeId: r.recipeId,
    title: r.title,
    doughFamily: r.doughFamily,
    hydration: r.hydration,
    difficulty: r.difficulty,
    totalTimeMinutes: r.totalTimeMinutes,
    steps: r.steps,
    author: r.author ? `${r.author.firstName} ${r.author.lastName}` : null,
    ingredients: (r.ingredients || []).map((i) => ({
      name: i.name,
      amount: i.RecipeIngredient ? i.RecipeIngredient.amount : null,
      unit: i.RecipeIngredient ? i.RecipeIngredient.unit : null,
    })),
    createDate: r.createDate,
    updateDate: r.updateDate,
  };
}

const includeAll = [
  { model: db.User, as: 'author', attributes: ['userId', 'firstName', 'lastName'] },
  { model: db.Ingredient, as: 'ingredients', through: { attributes: ['amount', 'unit'] } },
];

async function getRecipes(req, res, next) {
  try {
    const where = {};
    if (req.query.difficulty) where.difficulty = req.query.difficulty;
    if (req.query.doughFamily) where.doughFamily = req.query.doughFamily;
    const recipes = await db.Recipe.findAll({ where, include: includeAll });
    return success(res, recipes.map(shape));
  } catch (err) { next(err); }
}

async function getRecipeById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, 'INVALID_ID', 'Recipe ID must be a number', { field: 'id' }, 400);
    const recipe = await db.Recipe.findByPk(id, { include: includeAll });
    if (!recipe) return error(res, 'NOT_FOUND', `No recipe found with ID ${id}`, { field: 'id' }, 404);
    return success(res, shape(recipe));
  } catch (err) { next(err); }
}

async function createRecipe(req, res, next) {
  const t = await db.sequelize.transaction();
  try {
    const { title, doughFamily, hydration, difficulty, totalTimeMinutes, steps, ingredients, authorId } = req.body;
    if (!title || !doughFamily) {
      await t.rollback();
      return error(res, 'VALIDATION_ERROR', 'title and doughFamily are required', {}, 400);
    }
    const recipe = await db.Recipe.create(
      { title, doughFamily, hydration, difficulty, totalTimeMinutes, steps, authorId },
      { transaction: t }
    );
    for (const ing of ingredients || []) {
      const [ingredient] = await db.Ingredient.findOrCreate({ where: { name: ing.name }, transaction: t });
      await db.RecipeIngredient.create(
        { recipeId: recipe.recipeId, ingredientId: ingredient.ingredientId, amount: ing.amount, unit: ing.unit },
        { transaction: t }
      );
    }
    await t.commit();
    return success(res, { recipeId: recipe.recipeId }, 201);
  } catch (err) { await t.rollback(); next(err); }
}

async function updateRecipe(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, 'INVALID_ID', 'Recipe ID must be a number', { field: 'id' }, 400);
    const recipe = await db.Recipe.findByPk(id);
    if (!recipe) return error(res, 'NOT_FOUND', `No recipe found with ID ${id}`, { field: 'id' }, 404);
    const allowed = ['title', 'doughFamily', 'hydration', 'difficulty', 'totalTimeMinutes', 'steps'];
    const fields = {};
    for (const k of allowed) if (req.body[k] !== undefined) fields[k] = req.body[k];
    await recipe.update(fields);
    return success(res, { recipeId: recipe.recipeId });
  } catch (err) { next(err); }
}

async function deleteRecipe(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, 'INVALID_ID', 'Recipe ID must be a number', { field: 'id' }, 400);
    const deleted = await db.Recipe.destroy({ where: { recipeId: id } });
    if (!deleted) return error(res, 'NOT_FOUND', `No recipe found with ID ${id}`, { field: 'id' }, 404);
    return success(res, { recipeId: id });
  } catch (err) { next(err); }
}

module.exports = { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, shape, includeAll };
