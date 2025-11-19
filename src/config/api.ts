// API configuration with proper environment handling
const getApiBaseUrl = () => {
  // Debug logging
  console.log('🔍 Environment variables:', {
    DEV: import.meta.env.DEV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });

  // Development environment (localhost)
  if (import.meta.env.DEV) {
    console.log('🏠 Using localhost API');
    return 'http://localhost:3001/api';
  }
  
  // Production/Preview: Use same-origin API routes
  console.log('🌐 Using same-origin API');
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiEndpoints = {
  users: `${API_BASE_URL}/users`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;