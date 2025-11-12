// API configuration with proper environment handling
const getApiBaseUrl = () => {
  // Development environment (localhost)
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // Test environment (Vercel Preview deployments)
  if (import.meta.env.VITE_ENVIRONMENT === 'test' || window.location.hostname.includes('vercel.app')) {
    return import.meta.env.VITE_TEST_API_URL || 'https://server-fonpit79j-davids-projects-8b1113d6.vercel.app/api';
  }
  
  // Production environment
  return import.meta.env.VITE_PROD_API_URL || 'https://server-fonpit79j-davids-projects-8b1113d6.vercel.app/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiEndpoints = {
  users: `${API_BASE_URL}/users`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;