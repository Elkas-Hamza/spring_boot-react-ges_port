import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to inject the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle auth errors
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Authentication token expired, redirecting to login page...');
        
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        
        // Use replace state to avoid browser history issues
        window.location.replace('/');
      } 
      else if (error.response.status === 403) {
        // For 403 forbidden errors, log a warning but don't redirect
        console.warn('Authorization error: Forbidden resource');
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('Network error: No response received');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 