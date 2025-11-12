// API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://server-k2e897uyw-davids-projects-8b1113d6.vercel.app/api' 
  : 'http://localhost:3001/api';

export const apiEndpoints = {
  users: `${API_BASE_URL}/users`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;