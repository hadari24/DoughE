const express = require('express');
const router = express.Router();
const {getRecipes, getTheRecipeById, createRecipe, updateTheRecipe, deleteTheRecipe} = require('../controllers/recipesController');
const authorize = require('../middleware/auth');

router.get('/', getRecipes);
router.get('/:id', getTheRecipeById);
router.post('/', authorize('admin', 'manager'), createRecipe);
router.put('/:id', authorize('admin', 'manager'), updateTheRecipe);
router.delete('/:id', authorize('admin'), deleteTheRecipe);

module.exports = router;