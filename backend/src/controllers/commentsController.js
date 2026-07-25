const db = require('../../models');
const { success, error } = require('../utils/response');

async function listByRecipe(req, res, next) {
  try {
    const recipeId = parseInt(req.params.id);
    if (isNaN(recipeId)) return error(res, 'INVALID_ID', 'Recipe ID must be a number', { field: 'id' }, 400);

    const comments = await db.Comment.findAll({
      where: { recipeId },
      include: [{ model: db.User, as: 'user', attributes: ['userId', 'firstName', 'userName'] }],
      order: [['createdAt', 'ASC']],
    });

    const shaped = comments.map((c) => {
      const j = c.toJSON();
      return {
        commentId: j.commentId,
        recipeId: j.recipeId,
        userId: j.userId,
        userName: j.user ? (j.user.userName || j.user.firstName) : 'Guest',
        text: j.text,
        rating: j.rating,
        createdAt: j.createdAt,
      };
    });

    return success(res, shaped);
  } catch (err) { next(err); }
}

module.exports = { listByRecipe };
