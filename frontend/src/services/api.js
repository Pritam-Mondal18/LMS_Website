import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: read a cookie value by name
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

// Request Interceptor: Attach CSRF token on state-mutating methods
const SAFE_METHODS = new Set(['get', 'head', 'options']);
api.interceptors.request.use((config) => {
  if (!SAFE_METHODS.has((config.method || 'get').toLowerCase())) {
    const csrfToken = getCookie('csrf-token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Response Interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token dynamically (browser automatically sends refreshToken cookie)
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        if (response.data?.success) {
          // Retry original request (browser sends updated accessToken cookie automatically)
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed or expired -> log out user locally
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
