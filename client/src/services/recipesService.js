import api from './api';

export const getRecipes = () =>
  api.get('/recipes');

export const getRecipeById = (id) =>
  api.get(`/recipes/${id}`);