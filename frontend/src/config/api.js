// API Configuration for Spring Boot Backend
const API_CONFIG = {
  // Base URL for your Spring Boot backend (using proxy)
  BASE_URL: '',
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
  },
  
  // User management endpoints
  USERS: {
    PROFILE: (userId) => `/api/users/${userId}`,
    SETTINGS: (userId) => `/api/users/${userId}/settings`,
    ACHIEVEMENTS: (userId) => `/api/users/${userId}/achievements`,
    RECENT_ACTIVITY: (userId) => `/api/users/${userId}/recent-activity`,
  },
  
  // Dashboard and analytics endpoints
  DASHBOARD: {
    MAIN: (userId) => `/api/dashboard/${userId}`,
    ANALYTICS: (userId) => `/api/analytics/${userId}`,
    STREAK: (userId) => `/api/streak/${userId}`,
  },
  
  // Exercises and practice endpoints
  EXERCISES: {
    LIST: (category, level, userId) => `/api/exercises/${category}/${level}/${userId}`,
    RECOMMENDATIONS: (userId) => `/api/exercises/recommendations/${userId}`,
    SUBMIT: '/api/exercises/submit',
  },
  
  // Speech analysis endpoints
  SPEECH: {
    ANALYZE: '/api/speech/analyze',
    FEEDBACK: (sessionId) => `/api/speech/feedback/${sessionId}`,
    RECORD: '/api/speech/record',
  },
  
  // Feedback endpoints
  FEEDBACK: {
    GET: (userId) => `/api/feedback/${userId}`,
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export default API_CONFIG;
