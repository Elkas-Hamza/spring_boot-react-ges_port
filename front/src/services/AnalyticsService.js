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
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

const API_BASE_URL = 'http://localhost:8080';
const API_URL = `${API_BASE_URL}/api/analytics`;

// Get summary data
const getSummaryData = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/summary`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get operations by type
const getOperationsByType = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/operations-by-type`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get operations by month
const getOperationsByMonth = async (year = new Date().getFullYear()) => {
  try {
    const response = await directAxios.get(`${API_URL}/operations-by-month?year=${year}`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get operation durations
const getOperationDurations = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/operation-durations`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get top equipes
const getTopEquipes = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/top-equipes`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get personnel utilization
const getPersonnelUtilization = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/personnel-utilization`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get arrets by reason
const getArretsByReason = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/arrets-by-reason`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get port utilization
const getPortUtilization = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/port-utilization`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Get recent escales
const getRecentEscales = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/recent-escales`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Export a single function that fetches all analytics data
const getAllAnalytics = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

// Test connection to API (no auth required)
const testApiConnection = async () => {
  try {
    const response = await directAxios.get(`${API_URL}/test`);
    // Log statement removed
    return response.data;
  } catch (error) {
    // Error handled
    throw error;
  }
};

const AnalyticsService = {
  getSummaryData,
  getOperationsByType,
  getOperationsByMonth,
  getOperationDurations,
  getTopEquipes,
  getPersonnelUtilization,
  getArretsByReason,
  getPortUtilization,
  getRecentEscales,
  getAllAnalytics,
  testApiConnection
};

export default AnalyticsService; 
