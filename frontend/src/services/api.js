import axios from 'axios';

// In production, set REACT_APP_API_URL (on Render) to your backend URL,
// e.g. https://doughe-backend.onrender.com. Falls back to localhost for local dev.
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE}/api`
});

export default api;