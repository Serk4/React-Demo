// API configuration with proper environment handling
const getApiBaseUrl = () => {
  // Debug logging
  console.log('🔍 Environment variables:', {
    DEV: import.meta.env.DEV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_TEST_API_URL: import.meta.env.VITE_TEST_API_URL,
    VITE_PROD_API_URL: import.meta.env.VITE_PROD_API_URL
  });

  // Development environment (localhost)
  if (import.meta.env.DEV) {
    console.log('🏠 Using localhost API');
    return 'http://localhost:3001/api';
  }
  
  // Production/Preview environments (Vercel deployments)
  // Try multiple environment variable names for compatibility
  const apiUrl = import.meta.env.VITE_API_URL || 
                 import.meta.env.VITE_TEST_API_URL || 
                 import.meta.env.VITE_PROD_API_URL || 
                 'https://fallback-url.example.com/api';
  
  console.log('🌐 Using API URL:', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

export const apiEndpoints = {
  users: `${API_BASE_URL}/users`,
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;