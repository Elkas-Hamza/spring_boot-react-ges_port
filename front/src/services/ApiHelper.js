/**
 * Helper utilities for API testing and troubleshooting
 */

// API base URL
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Test connection to the backend API
 * @returns {Promise<Object>} Connection status
 */
const testConnection = async () => {
  try {
    console.log('Testing connection to API...');
    
    // Use a timeout to prevent long waiting times
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/test/status`, {
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      console.warn('API test failed with status:', response.status);
      return {
        success: false,
        status: response.status,
        message: 'Server may be starting up or unavailable'
      };
    }
    
    // Read as text first to check if empty
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      return {
        success: false,
        message: 'Server returned empty response'
      };
    }
    
    try {
      // Try parsing as JSON
      const data = JSON.parse(responseText);
      console.log('API connection successful:', data);
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Failed to parse API response as JSON:', error);
      return {
        success: false,
        message: 'Server responded but with invalid format',
        responseText
      };
    }
  } catch (error) {
    console.error('API connection test failed:', error);
    
    // More user-friendly error messages
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out'
      };
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'Server not running or network error'
      };
    }
    
    return {
      success: false,
      message: 'Unable to connect to server'
    };
  }
};

/**
 * Logs API request details for debugging
 */
const debugRequest = (url, options = {}) => {
  console.group('API Request Debug');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', options.headers || {});
  if (options.body) {
    try {
      console.log('Body:', typeof options.body === 'string' ? JSON.parse(options.body) : options.body);
    } catch (e) {
      console.log('Body (raw):', options.body);
    }
  }
  console.groupEnd();
};

const ApiHelper = {
  testConnection,
  debugRequest,
  API_BASE_URL
};

export default ApiHelper; 