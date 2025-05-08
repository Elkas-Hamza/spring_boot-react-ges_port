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
const API_URL = `${API_BASE_URL}/api/settings`;

// For development/demo purposes - use local storage to simulate persistence
const SETTINGS_STORAGE_KEY = 'port_management_settings';

// Default settings - will be used if nothing is in storage
const DEFAULT_SETTINGS = {
  general: {
    siteName: 'Système de Management des Ports',
    adminEmail: 'admin@marsamaroc.co.ma',
    timezone: 'Africa/Casablanca',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 60,
    loginAttempts: 5,
    twoFactorAuth: false
  },
  email: {
    smtpServer: 'smtp.marsamaroc.co.ma',
    smtpPort: 587,
    smtpUsername: 'notifications@marsamaroc.co.ma',
    smtpSecure: true,
    senderName: 'Système de Management des Ports',
    senderEmail: 'no-reply@marsamaroc.co.ma'
  },
  notifications: {
    emailNotifications: true,
    operationCreated: true,
    operationUpdated: true,
    escaleCreated: true,
    userAccountCreated: true,
    systemErrors: true
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '03:00',
    retentionDays: 30,
    backupLocation: '/backup'
  }
};

// Get settings - tries API first, falls back to localStorage, then defaults
const getSettings = async () => {
  try {
    // Try to get from API first
    const response = await directAxios.get(API_URL);
    return response.data;
  } catch (error) {
    console.log('API fetch failed, falling back to local storage', error);
    
    // Fall back to localStorage
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    
    // Use defaults if nothing in localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
};

// Save settings - tries API first, falls back to localStorage
const saveSettings = async (settings) => {
  try {
    // Try to save to API first
    const response = await directAxios.put(API_URL, settings);
    return response.data;
  } catch (error) {
    console.log('API save failed, falling back to local storage', error);
    
    // Fall back to localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }
};

// Send a test email - uses the configured SMTP settings
const sendTestEmail = async (recipient) => {
  try {
    const response = await directAxios.post(`${API_URL}/test-email`, { recipient });
    return response.data;
  } catch (error) {
    console.error('Failed to send test email', error);
    throw error;
  }
};

// Trigger a manual backup
const createBackup = async () => {
  try {
    const response = await directAxios.post(`${API_URL}/backup`);
    return response.data;
  } catch (error) {
    console.error('Failed to create backup', error);
    throw error;
  }
};

// Optimize the database
const optimizeDatabase = async () => {
  try {
    const response = await directAxios.post(`${API_URL}/optimize-db`);
    return response.data;
  } catch (error) {
    console.error('Failed to optimize database', error);
    throw error;
  }
};

// Clear system caches
const clearCache = async () => {
  try {
    const response = await directAxios.post(`${API_URL}/clear-cache`);
    return response.data;
  } catch (error) {
    console.error('Failed to clear cache', error);
    throw error;
  }
};

const SettingsService = {
  getSettings,
  saveSettings,
  sendTestEmail,
  createBackup,
  optimizeDatabase,
  clearCache
};

export default SettingsService; 