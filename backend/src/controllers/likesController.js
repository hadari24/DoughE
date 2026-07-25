const db = require('../../models');
const { success, error } = require('../utils/response');
const { shape, includeAll } = require('./recipesController');

function getUid(req) {
  const u = parseInt(req.headers['x-user-id']);
  return isNaN(u) ? null : u;
}

// POST /api/recipes/:id/like
async function like(req, res, next) {
  try {
    const userId = getUid(req);
    const recipeId = parseInt(req.params.id);
    if (!userId) return error(res, 'UNAUTHORIZED', 'Missing x-user-id header', {}, 401);
    if (isNaN(recipeId)) return error(res, 'INVALID_ID', 'Recipe ID must be a number', { field: 'id' }, 400);

    await db.RecipeLike.findOrCreate({ where: { userId, recipeId } });
    return success(res, { recipeId, liked: true });
  } catch (err) { next(err); }
}

// DELETE /api/recipes/:id/like
async function unlike(req, res, next) {
  try {
    const userId = getUid(req);
    const recipeId = parseInt(req.params.id);
    if (!userId) return error(res, 'UNAUTHORIZED', 'Missing x-user-id header', {}, 401);
    if (isNaN(recipeId)) return error(res, 'INVALID_ID', 'Recipe ID must be a number', { field: 'id' }, 400);

    await db.RecipeLike.destroy({ where: { userId, recipeId } });
    return success(res, { recipeId, liked: false });
  } catch (err) { next(err); }
}

// GET /api/likes   -> recipes the current user liked (JOIN through recipe_likes)
async function myLikes(req, res, next) {
  try {
    const userId = getUid(req);
    if (!userId) return error(res, 'UNAUTHORIZED', 'Missing x-user-id header', {}, 401);

    const links = await db.RecipeLike.findAll({ where: { userId }, attributes: ['recipeId'] });
    const ids = links.map((l) => l.recipeId);
    if (ids.length === 0) return success(res, []);

    const recipes = await db.Recipe.findAll({ where: { recipeId: ids }, include: includeAll });
    return success(res, recipes.map(shape));
  } catch (err) { next(err); }
}

module.exports = { like, unlike, myLikes };
