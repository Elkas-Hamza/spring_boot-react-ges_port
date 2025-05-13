import axios from "axios";
import performanceService from "./PerformanceService";

// Create a direct axios instance to avoid baseURL issues
const directAxios = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the JWT token
directAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request configuration error:", error);
    return Promise.reject(error);
  }
);

const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/settings`;

// For development/demo purposes - use local storage to simulate persistence
const SETTINGS_STORAGE_KEY = "port_management_settings";

// Default settings - will be used if nothing is in storage
const DEFAULT_SETTINGS = {
  general: {
    siteName: "Système de Management des Ports",
    adminEmail: "admin@marsamaroc.co.ma",
    timezone: "Africa/Casablanca",
    language: "fr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 60,
    loginAttempts: 5,
    twoFactorAuth: false,
  },
  email: {
    smtpServer: "smtp.marsamaroc.co.ma",
    smtpPort: 587,
    smtpUsername: "notifications@marsamaroc.co.ma",
    smtpSecure: true,
    senderName: "Système de Management des Ports",
    senderEmail: "no-reply@marsamaroc.co.ma",
  },
  notifications: {
    emailNotifications: true,
    operationCreated: true,
    operationUpdated: true,
    escaleCreated: true,
    userAccountCreated: true,
    systemErrors: true,
  },
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "03:00",
    retentionDays: 30,
    backupLocation: "/backup",
  },
  performance: {
    enableMonitoring: true,
    autoStartMonitoring: true,
    dataRetentionDays: 7,
    maxDataPoints: 100,
    monitoringRefreshInterval: 5000, // milliseconds
    alertOnSlowResponses: true,
    slowResponseThreshold: 5000, // milliseconds
  },
};

// Get settings - tries API first, falls back to localStorage, then defaults
const getSettings = async () => {
  try {
    // Try to get from API first
    const response = await directAxios.get(API_URL);
    return response.data;
  } catch (error) {
    console.log("API fetch failed, falling back to local storage", error);

    // Fall back to localStorage
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }

    // Use defaults if nothing in localStorage
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(DEFAULT_SETTINGS)
    );
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
    console.log("API save failed, falling back to local storage", error);

    // Fall back to localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }
};

// Send a test email - uses the configured SMTP settings
const sendTestEmail = async (recipient) => {
  try {
    const response = await directAxios.post(`${API_URL}/test-email`, {
      recipient,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send test email", error);
    throw error;
  }
};

// Trigger a manual backup
const createBackup = async () => {
  try {
    const response = await directAxios.post(`${API_URL}/backup`);
    return response.data;
  } catch (error) {
    console.error("Failed to create backup", error);
    throw error;
  }
};

// Optimize the database
const optimizeDatabase = async () => {
  try {
    const response = await directAxios.post(`${API_URL}/optimize-db`);
    return response.data;
  } catch (error) {
    console.error("Failed to optimize database", error);
    throw error;
  }
};

// Clear system caches
const clearCache = async () => {
  try {
    const response = await directAxios.post(`${API_URL}/clear-cache`);
    return response.data;
  } catch (error) {
    console.error("Failed to clear cache", error);
    throw error;
  }
};

// Initialize performance monitoring based on settings
const initPerformanceMonitoring = async () => {
  try {
    const settings = await getSettings();

    if (!settings.performance) return false;

    // Configure performance service with settings regardless of auto-start
    if (settings.performance.maxDataPoints) {
      performanceService.maxDataPoints = settings.performance.maxDataPoints;
    }

    // Configure alerts
    if (settings.performance.alertOnSlowResponses !== undefined) {
      performanceService.configureAlerts(
        settings.performance.alertOnSlowResponses,
        settings.performance.slowResponseThreshold || 5000
      );
    }

    // Start monitoring if auto-start is enabled
    if (settings.performance.autoStartMonitoring) {
      console.log("Auto-starting performance monitoring based on settings");
      performanceService.enableMonitoring();
      return true;
    } else {
      console.log("Performance monitoring auto-start disabled");
      return false;
    }
  } catch (error) {
    console.error("Failed to initialize performance monitoring", error);
    return false;
  }
};

// Update performance monitoring settings
const updatePerformanceSettings = async (performanceSettings) => {
  try {
    const settings = await getSettings();

    // Update performance settings
    settings.performance = {
      ...settings.performance,
      ...performanceSettings,
    };

    // Apply the changes to the performance service
    if (performanceSettings.maxDataPoints) {
      performanceService.maxDataPoints = performanceSettings.maxDataPoints;
    }

    if (performanceSettings.enableMonitoring !== undefined) {
      if (performanceSettings.enableMonitoring) {
        performanceService.enableMonitoring();
      } else {
        performanceService.disableMonitoring();
      }
    }

    // Configure alerts if related settings are provided
    if (
      performanceSettings.alertOnSlowResponses !== undefined ||
      performanceSettings.slowResponseThreshold !== undefined
    ) {
      performanceService.configureAlerts(
        performanceSettings.alertOnSlowResponses !== undefined
          ? performanceSettings.alertOnSlowResponses
          : settings.performance.alertOnSlowResponses,
        performanceSettings.slowResponseThreshold ||
          settings.performance.slowResponseThreshold
      );
    }

    // Save the updated settings
    await saveSettings(settings);

    return settings;
  } catch (error) {
    console.error("Failed to update performance settings", error);
    throw error;
  }
};

// Clear performance monitoring data
const clearPerformanceData = () => {
  try {
    performanceService.resetMetrics();
    return true;
  } catch (error) {
    console.error("Failed to clear performance data", error);
    return false;
  }
};

const SettingsService = {
  getSettings,
  saveSettings,
  sendTestEmail,
  createBackup,
  optimizeDatabase,
  clearCache,
  initPerformanceMonitoring,
  updatePerformanceSettings,
  clearPerformanceData,
};

export default SettingsService;
