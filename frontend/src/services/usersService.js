import api from './api';

const auth = () => ({
  headers: {
    'x-user-role': localStorage.getItem('userRole'),
    'x-user-id': localStorage.getItem('userId'),
  },
});

export const getUsers = () => api.get('/users', auth());
export const createUser = (data) => api.post('/users', data, auth());
export const updateUser = (id, data) => api.put(`/users/${id}`, data, auth());
export const deleteUser = (id) => api.delete(`/users/${id}`, auth());
