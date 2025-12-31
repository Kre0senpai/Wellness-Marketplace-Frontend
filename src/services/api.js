import axios from 'axios';

// Base configuration
const API_BASE_URL = 'http://localhost:8080/api/users';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - Automatically adds JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Automatically handles token refresh
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;

        // Save new access token
        localStorage.setItem('token', accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API ENDPOINTS
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  
  // User endpoints (add more as needed)
  USER_PROFILE: '/profile',
  UPDATE_PROFILE: '/profile',
  
  // Practitioner endpoints (examples for later)
  PRACTITIONERS: '/practitioners',
  PRACTITIONER_DETAIL: (id) => `/practitioners/${id}`,
  
  // Session endpoints (examples for later)
  SESSIONS: '/sessions',
  BOOK_SESSION: '/sessions/book',
};

// AUTH SERVICE - Specific auth functions
export const authService = {
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    const { accessToken, refreshToken, userId, role } = response.data;
    
    // Store tokens
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post(API_ENDPOINTS.LOGOUT, { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless
      localStorage.clear();
      window.location.href = '/login';
    }
  },

  getCurrentUser: () => {
    return {
      userId: localStorage.getItem('userId'),
      role: localStorage.getItem('role'),
      token: localStorage.getItem('token'),
    };
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Export the configured axios instance for custom requests
export default api;