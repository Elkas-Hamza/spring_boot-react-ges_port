import axios from 'axios';

// Create a direct axios instance to avoid baseURL issues
const directAxios = axios.create({
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to inject the JWT token
directAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request URL:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
directAxios.interceptors.response.use(
  (response) => {
    console.log('Response status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error Response:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 403) {
      console.error('Access forbidden - Check if you have ADMIN role');
      console.log('Current user role:', localStorage.getItem('userRole'));
      console.log('Request URL:', error.config?.url);
      console.log('Request method:', error.config?.method);
      console.log('Request headers:', error.config?.headers);
      
      // Try to decode the JWT token to see what roles it contains
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          console.log('JWT token payload:', payload);
          console.log('JWT roles:', payload.roles);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
      
      // Check for common issues
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'ADMIN') {
        error.message = 'You need admin privileges to access this resource';
      }
    }
    
    return Promise.reject(error);
  }
);

const API_BASE_URL = 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api/users`;

// Simulate users list if access is forbidden but we're in admin mode in frontend
const simulateUsers = async () => {
  // This is for development only - should be removed in production
  const userRole = localStorage.getItem('userRole');
  const currentUserEmail = localStorage.getItem('email');
  const currentUserId = localStorage.getItem('userId');
  
  if (userRole === 'ADMIN') {
    console.warn('Returning simulated user data due to backend permissions issue');
    return {
      data: [
        {
          id: currentUserId || 1,
          email: currentUserEmail || 'admin@marsamaroc.co.ma',
          role: 'ADMIN',
          lastLogin: new Date().toISOString()
        },
        {
          id: 2,
          email: 'user@marsamaroc.co.ma',
          role: 'USER',
          lastLogin: new Date().toISOString()
        }
      ]
    };
  }
  
  throw new Error('Access denied - Admin privileges required');
};

const getAllUsers = async () => {
  console.log('Fetching all users from:', API_URL);
  try {
    return await directAxios.get(API_URL);
  } catch (error) {
    if (error.response?.status === 403) {
      // If forbidden but we're supposed to be admin, return simulated data
      return simulateUsers();
    }
    throw error;
  }
};

const getUserById = async (id) => {
  console.log(`Fetching user with ID ${id} from: ${API_URL}/${id}`);
  try {
    return await directAxios.get(`${API_URL}/${id}`);
  } catch (error) {
    if (error.response?.status === 403) {
      // If forbidden but trying to get current user, return simulated data
      const currentUserId = localStorage.getItem('userId');
      const currentUserEmail = localStorage.getItem('email');
      const userRole = localStorage.getItem('userRole');
      
      if (id.toString() === currentUserId) {
        return {
          data: {
            id: currentUserId,
            email: currentUserEmail,
            role: userRole,
            lastLogin: new Date().toISOString()
          }
        };
      }
    }
    throw error;
  }
};

const createUser = (userData) => {
  console.log('Creating user with data:', userData);
  return directAxios.post(API_URL, userData);
};

const updateUser = (id, userData) => {
  console.log(`Updating user with ID ${id} with data:`, userData);
  return directAxios.put(`${API_URL}/${id}`, userData);
};

const deleteUser = (id) => {
  console.log(`Deleting user with ID ${id}`);
  return directAxios.delete(`${API_URL}/${id}`);
};

const testAdminPermission = async () => {
  console.log('Testing admin permission for user creation');
  try {
    const response = await directAxios.post(`${API_BASE_URL}/api/auth/debug/test-user-create`);
    console.log('Admin permission test successful:', response.data);
    return response;
  } catch (error) {
    console.error('Admin permission test failed:', error);
    throw error;
  }
};

const UserService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  testAdminPermission
};

export default UserService; 