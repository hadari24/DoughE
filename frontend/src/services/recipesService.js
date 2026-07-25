import api from './api';

const auth = () => ({
  headers: {
    'x-user-role': localStorage.getItem('userRole'),
    'x-user-id': localStorage.getItem('userId'),
  },
});

export const getRecipes = () =>
  api.get('/recipes');

export const getRecipeById = (id) =>
  api.get(`/recipes/${id}`);

export const getComments = (recipeId) =>
  api.get(`/recipes/${recipeId}/comments`);

export const createRecipe = (data) =>
  api.post('/recipes', data, auth());

export const updateRecipe = (id, data) =>
  api.put(`/recipes/${id}`, data, auth());

export const deleteRecipe = (id) =>
  api.delete(`/recipes/${id}`, auth());
