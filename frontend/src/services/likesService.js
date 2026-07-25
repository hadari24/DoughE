import api from './api';

const auth = () => ({
  headers: {
    'x-user-id': localStorage.getItem('userId'),
    'x-user-role': localStorage.getItem('userRole'),
  },
});

export const likeRecipe = (id) => api.post(`/recipes/${id}/like`, {}, auth());
export const unlikeRecipe = (id) => api.delete(`/recipes/${id}/like`, auth());
export const getMyLikes = () => api.get('/likes', auth());
export const updateNote = (id, note) => api.put(`/recipes/${id}/note`, { note }, auth());
