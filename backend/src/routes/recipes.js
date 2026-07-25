const express = require('express');
const router = express.Router();
const { getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } = require('../controllers/recipesController');
const { listByRecipe } = require('../controllers/commentsController');
const { like, unlike, updateNote } = require('../controllers/likesController');
const { requireRole } = require('../middleware/auth');

router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.get('/:id/comments', listByRecipe);
router.post('/:id/like', like);
router.delete('/:id/like', unlike);
router.put('/:id/note', updateNote);
router.post('/', requireRole('admin', 'manager'), createRecipe);
router.put('/:id', requireRole('admin', 'manager'), updateRecipe);
router.delete('/:id', requireRole('admin'), deleteRecipe);

module.exports = router;
