const express = require('express');
const router = express.Router();
const {getRecipes, getTheRecipeById, createRecipe, updateTheRecipe, deleteTheRecipe} = require('../controllers/recipesController');
const {requireRole} = require('../middleware/auth'); // for the TEMP auth.js file

router.get('/', getRecipes);
router.get('/:id', getTheRecipeById);
router.post('/', requireRole('admin', 'manager'), createRecipe);
router.put('/:id', requireRole('admin', 'manager'), updateTheRecipe);
router.delete('/:id', requireRole('admin'), deleteTheRecipe);

module.exports = router;