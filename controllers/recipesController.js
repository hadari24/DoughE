const {getAllRecipes, getRecipeById, addRecipe, updateRecipe, deleteRecipe} = require('../models/recipesData');
const {success, error} = require('../utils/response');

const getRecipes = (req, res, next) => {
    try {
        const recipes = getAllRecipes();

        let filteredRecipes = recipes;
        if (req.query.difficulty) {
            filteredRecipes = recipes.filter(r => r.difficulty === req.query.difficulty);
        }
        if (req.query.doughFamily) {
            filteredRecipes = filteredRecipes.filter(r => r.doughFamily === req.query.doughFamily);
        }
        success(res, filteredRecipes);
    } catch (err) {
        next(err);
    }
}

const getTheRecipeById = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return error(res, 'INVALID_ID', 'Recipe ID must be a number', {field: 'id'}, 400);
        }
        const recipe = getRecipeById(id);
        if (!recipe) {
            return error(res, 'NOT_FOUND', `No recipe found with ID ${id}`, {field: 'id'}, 404);
        }
        success(res, recipe);
    } catch (err) {
        next(err);
    }
}

const createRecipe = (req, res, next) => {
    try {
        const {title, doughFamily, hydration, difficulty, totalTimeMinutes, ingredients, steps} = req.body;
        if (!title) return error(res, 'VALIDATION_ERROR', 'Missing required field: title', { field: 'title' }, 400);
        if (!doughFamily) return error(res, 'VALIDATION_ERROR', 'Missing required field: doughFamily', { field: 'doughFamily' }, 400);
        if (!hydration) return error(res, 'VALIDATION_ERROR', 'Missing required field: hydration', { field: 'hydration' }, 400);
        if (!difficulty) return error(res, 'VALIDATION_ERROR', 'Missing required field: difficulty', { field: 'difficulty' }, 400);
        if (!totalTimeMinutes) return error(res, 'VALIDATION_ERROR', 'Missing required field: totalTimeMinutes', { field: 'totalTimeMinutes' }, 400);
        if (!ingredients) return error(res, 'VALIDATION_ERROR', 'Missing required field: ingredients', { field: 'ingredients' }, 400);
        if (!steps) return error(res, 'VALIDATION_ERROR', 'Missing required field: steps', { field: 'steps' }, 400);
        
        const newRecipe = addRecipe({title, doughFamily, hydration, difficulty, totalTimeMinutes, ingredients, steps});
        success(res, {recipeId: newRecipe.recipeId}, 201);
    } catch (err) {
        next(err);
    }
}

const updateTheRecipe = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return error(res, 'INVALID_ID', 'Recipe ID must be a number', {field: 'id'}, 400);
        }
        const {title, doughFamily, hydration, difficulty, totalTimeMinutes, ingredients, steps} = req.body;
        if (!title) return error(res, 'VALIDATION_ERROR', 'Missing required field: title', { field: 'title' }, 400);
        if (!doughFamily) return error(res, 'VALIDATION_ERROR', 'Missing required field: doughFamily', { field: 'doughFamily' }, 400);
        if (!hydration) return error(res, 'VALIDATION_ERROR', 'Missing required field: hydration', { field: 'hydration' }, 400);
        if (!difficulty) return error(res, 'VALIDATION_ERROR', 'Missing required field: difficulty', { field: 'difficulty' }, 400);
        if (!totalTimeMinutes) return error(res, 'VALIDATION_ERROR', 'Missing required field: totalTimeMinutes', { field: 'totalTimeMinutes' }, 400);
        if (!ingredients) return error(res, 'VALIDATION_ERROR', 'Missing required field: ingredients', { field: 'ingredients' }, 400);
        if (!steps) return error(res, 'VALIDATION_ERROR', 'Missing required field: steps', { field: 'steps' }, 400);
        
        const updatedRecipe = updateRecipe(id, req.body);
        if (!updatedRecipe) {
            return error(res, 'NOT_FOUND', `No recipe found with ID ${id}`, {field: 'id'}, 404);
        }
        success(res, {recipeId: updatedRecipe.recipeId});
    } catch (err) {
        next(err);
    }
}

const deleteTheRecipe = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return error(res, 'INVALID_ID', 'Recipe ID must be a number', {field: 'id'}, 400);
        }
        const deleted = deleteRecipe(id);
        if (!deleted) {
            return error(res, 'NOT_FOUND', `No recipe found with ID ${id}`, {field: 'id'}, 404);
        }
        success(res, {recipeId: deleted.recipeId});
    } catch (err) {
        next(err);
    }
}

module.exports = {getRecipes, getTheRecipeById, createRecipe, updateTheRecipe, deleteTheRecipe};