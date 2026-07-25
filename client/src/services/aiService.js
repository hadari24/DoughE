import api from './api';

export const askAssistant = (prompt, context = '') =>
  api.post('/ai/assistant', { prompt, context });
