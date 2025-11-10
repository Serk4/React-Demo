// API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.vercel.app/api' 
  : 'http://localhost:3001/api';

export const apiEndpoints = {
  users: `${API_BASE_URL}/users`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;