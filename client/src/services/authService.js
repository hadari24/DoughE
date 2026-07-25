import api from './api';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const logout = () =>
  api.post('/auth/logout');

export const getMe = (userId) =>
  api.get('/auth/me', {
    headers: {
      'x-user-id': userId,
      'x-user-role': localStorage.getItem('userRole')
    }
  });