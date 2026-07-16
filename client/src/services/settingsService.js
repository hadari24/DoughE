import api from './api';

export const getSettings = () =>
  api.get('/settings', {
    headers: { 'x-user-id': localStorage.getItem('userId') }
  });

export const updateSettings = (settings) =>
  api.put('/settings', settings);