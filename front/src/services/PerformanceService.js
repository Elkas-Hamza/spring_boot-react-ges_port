import axiosInstance from "./AxiosConfig";

// Utility function to format milliseconds
const formatMs = (ms) => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

class PerformanceService {
  constructor() {
    // Store metrics in memory
    this.metrics = {
      apiCalls: [],
      responseTimeAverage: 0,
      slowestEndpoint: null,
      fastestEndpoint: null,
      errorRates: {},
      systemLoad: [],
    };

    // Maximum number of data points to keep for charts
    this.maxDataPoints = 100;

    // Track if monitoring is enabled
    this.isMonitoringEnabled = false;

    // Interceptor IDs
    this.requestInterceptorId = null;
    this.responseInterceptorId = null;

    // Alert settings
    this.alertThreshold = 5000; // Default 5 seconds
    this.alertsEnabled = true;
    this.alertLog = [];
  }
  // Enable performance monitoring
  async enableMonitoring() {
    try {
      // First, try to enable monitoring on the backend
      await axiosInstance.post("/monitoring/status", { enabled: true });

      if (this.isMonitoringEnabled) return;
      this.isMonitoringEnabled = true;

      // Add request interceptor
      this.requestInterceptorId = axiosInstance.interceptors.request.use(
        (config) => {
          // Add request start time
          config.metadata = { startTime: new Date().getTime() };
          return config;
        }
      );

      // Add response interceptor
      this.responseInterceptorId = axiosInstance.interceptors.response.use(
        (response) => {
          // Calculate response time
          const endTime = new Date().getTime();
          const startTime = response.config.metadata?.startTime || endTime;
          const responseTime = endTime - startTime;

          // Extract endpoint info
          const endpoint = this.getEndpointFromUrl(response.config.url);

          // Store the metric
          this.recordApiCall(endpoint, responseTime, true);

          return response;
        },
        (error) => {
          // Also track failed requests
          if (error.config) {
            const endTime = new Date().getTime();
            const startTime = error.config.metadata?.startTime || endTime;
            const responseTime = endTime - startTime;

            // Extract endpoint info
            const endpoint = this.getEndpointFromUrl(error.config.url);

            // Store the metric
            this.recordApiCall(endpoint, responseTime, false);
          }

          // Continue with the error
          return Promise.reject(error);
        }
      );
      console.log("Performance monitoring enabled");

      // Start system load sampling
      this.startSystemLoadSampling();
    } catch (error) {
      console.error("Error enabling monitoring:", error);
    }
  }

  // Disable performance monitoring
  async disableMonitoring() {
    try {
      // Disable monitoring on the backend first
      await axiosInstance.post("/monitoring/status", { enabled: false });

      if (!this.isMonitoringEnabled) return;

      // Remove interceptors
      if (this.requestInterceptorId !== null) {
        axiosInstance.interceptors.request.eject(this.requestInterceptorId);
      }

      if (this.responseInterceptorId !== null) {
        axiosInstance.interceptors.response.eject(this.responseInterceptorId);
      }

      // Stop system load sampling
      this.stopSystemLoadSampling();

      this.isMonitoringEnabled = false;
      console.log("Performance monitoring disabled");
    } catch (error) {
      console.error("Error disabling monitoring:", error);
    }
  }

  // Sample system performance metrics
  systemLoadIntervalId = null;
  startSystemLoadSampling() {
    // Clear existing interval if any
    if (this.systemLoadIntervalId) {
      clearInterval(this.systemLoadIntervalId);
    }

    // Sample every 3 seconds for more responsive metrics
    this.systemLoadIntervalId = setInterval(async () => {
      try {
        // Fetch real server metrics
        const serverMetrics = await this.fetchServerMetrics();

        // Only update metrics if we got valid online data
        if (serverMetrics && serverMetrics.status === "online") {
          // Validate metrics before adding them
          const validatedMetrics = {
            timestamp: new Date(),
            memory: this.validateMetricValue(serverMetrics.memory, 0, 100),
            cpu: this.validateMetricValue(serverMetrics.cpu, 0, 100),
            diskSpace: serverMetrics.diskSpace || { used: 0, total: 100000, free: 100000 },
            activeConnections: Math.max(0, serverMetrics.activeConnections || 0),
            uptime: Math.max(0, serverMetrics.uptime || 0),
          };

          this.metrics.systemLoad.push(validatedMetrics);

          // Limit the number of data points
          if (this.metrics.systemLoad.length > this.maxDataPoints) {
            this.metrics.systemLoad.shift();
          }
        } else if (serverMetrics && serverMetrics.status === "permission-error") {
          console.warn("Permission error fetching metrics:", serverMetrics.errorMessage);
        } else if (serverMetrics && serverMetrics.status === "connection-error") {
          console.warn("Connection error fetching metrics:", serverMetrics.errorMessage);
        }
      } catch (error) {
        console.error("Error sampling system load:", error);
      }
    }, 3000);
  }

  // Helper to validate metric values
  validateMetricValue(value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  }

  stopSystemLoadSampling() {
    if (this.systemLoadIntervalId) {
      clearInterval(this.systemLoadIntervalId);
      this.systemLoadIntervalId = null;
    }
  }
  // Fetch real system metrics from backend server
  async fetchServerMetrics(retryCount = 0) {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axiosInstance.get("/monitoring/system-metrics", {
        timeout: 8000,
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "X-Requested-With": "XMLHttpRequest"
        },
        params: {
          _t: new Date().getTime()
        }
      });

      const data = response.data;
      
      // Validate the response data
      if (!data || (data.cpu === undefined && data.memory === undefined && data.uptime === undefined)) {
        throw new Error("Invalid server metrics response");
      }

      // Return the validated metrics
      return {
        cpu: this.validateMetricValue(data.cpu, 0, 100),
        memory: this.validateMetricValue(data.memory, 0, 100),
        diskSpace: data.diskSpace || null,
        activeConnections: data.activeConnections !== undefined ? Math.max(0, data.activeConnections) : 0,
        uptime: data.uptime !== undefined ? Math.max(0, data.uptime) : 0,
        status: "online"
      };
    } catch (error) {
      // Enhanced error handling
      const isConnectionError = !error.response || error.code === "ECONNREFUSED" || 
                              error.message.includes("Network Error");
      const isPermissionError = error.response?.status === 403;
      const isServerError = error.response?.status >= 500;

      // Retry for connection and server errors
      if ((isConnectionError || isServerError) && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying server metrics request in ${delay}ms...`);
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.fetchServerMetrics(retryCount + 1));
          }, delay);
        });
      }

      return {
        cpu: null,
        memory: null,
        diskSpace: null,
        activeConnections: null,
        uptime: null,
        status: isPermissionError ? "permission-error" : 
                isConnectionError ? "connection-error" : "error",
        errorMessage: isPermissionError 
          ? "Insufficient permissions to view system metrics" 
          : isConnectionError
            ? "Cannot connect to monitoring service"
            : "Error fetching system metrics"
      };
    }
  }

  // Extract endpoint name from URL
  getEndpointFromUrl(url) {
    if (!url) return "unknown";

    // Remove query parameters
    const baseUrl = url.split("?")[0];

    // Get the endpoint path
    const parts = baseUrl.split("/");

    // Extract meaningful parts of the path
    if (parts.length >= 2) {
      // Return last 2 parts of path or just the endpoint if shorter
      return parts.slice(-2).join("/");
    }

    return baseUrl;
  }

  // Record an API call
  recordApiCall(endpoint, responseTime, isSuccessful) {
    const timestamp = new Date();

    // Add to the metrics list
    this.metrics.apiCalls.push({
      endpoint,
      responseTime,
      timestamp,
      isSuccessful,
    });

    // Limit the number of stored calls
    if (this.metrics.apiCalls.length > this.maxDataPoints) {
      this.metrics.apiCalls.shift();
    }

    // Update error rates
    if (!this.metrics.errorRates[endpoint]) {
      this.metrics.errorRates[endpoint] = {
        total: 0,
        errors: 0,
      };
    }

    this.metrics.errorRates[endpoint].total += 1;
    if (!isSuccessful) {
      this.metrics.errorRates[endpoint].errors += 1;
    }

    // Recalculate averages and extremes
    this.calculateMetrics();

    // Check for alerts
    this.checkForAlerts(endpoint, responseTime);
  }

  // Calculate derived metrics
  calculateMetrics() {
    // Only consider successful calls for response time calculations
    const successfulCalls = this.metrics.apiCalls.filter(
      (call) => call.isSuccessful
    );

    if (successfulCalls.length === 0) return;

    // Calculate average response time
    const totalTime = successfulCalls.reduce(
      (sum, call) => sum + call.responseTime,
      0
    );
    this.metrics.responseTimeAverage = totalTime / successfulCalls.length;

    // Find slowest and fastest endpoints
    const endpointMap = {};

    successfulCalls.forEach((call) => {
      if (!endpointMap[call.endpoint]) {
        endpointMap[call.endpoint] = {
          totalTime: 0,
          count: 0,
          avgTime: 0,
          maxTime: 0,
          minTime: Infinity,
        };
      }

      const stats = endpointMap[call.endpoint];
      stats.totalTime += call.responseTime;
      stats.count += 1;
      stats.avgTime = stats.totalTime / stats.count;
      stats.maxTime = Math.max(stats.maxTime, call.responseTime);
      stats.minTime = Math.min(stats.minTime, call.responseTime);
    });

    // Find slowest and fastest endpoints based on average time
    let slowestEndpoint = null;
    let fastestEndpoint = null;
    let slowestTime = -1;
    let fastestTime = Infinity;

    Object.entries(endpointMap).forEach(([endpoint, stats]) => {
      if (stats.avgTime > slowestTime) {
        slowestTime = stats.avgTime;
        slowestEndpoint = { endpoint, avgTime: stats.avgTime };
      }

      if (stats.avgTime < fastestTime) {
        fastestTime = stats.avgTime;
        fastestEndpoint = { endpoint, avgTime: stats.avgTime };
      }
    });

    this.metrics.slowestEndpoint = slowestEndpoint;
    this.metrics.fastestEndpoint = fastestEndpoint;
  }
  // Get the current metrics
  async getMetrics() {
    try {
      // Try to fetch server metrics first to ensure we have the latest data
      const serverMetricsPromise = this.fetchServerMetrics().catch((err) => {
        console.warn("Failed to fetch server metrics during getMetrics call:", err);
        return null;
      });

      // Get metrics from the performance metrics endpoint
      const performanceMetricsPromise = axiosInstance
        .get("/monitoring/performance-metrics")
        .catch((err) => {
          console.warn("Failed to fetch performance metrics:", err);
          return { data: null };
        });

      // Wait for both to complete
      const [serverMetrics, performanceResponse] = await Promise.all([
        serverMetricsPromise,
        performanceMetricsPromise,
      ]);

      // Ensure the apiCalls array exists
      const responseData = performanceResponse.data || {};

      // Make sure all required fields are present with default values if needed
      const mergedData = {
        apiCalls: responseData.apiCalls || [],
        systemLoad: responseData.systemLoad || [],
        responseTimeAverage: responseData.responseTimeAverage || 0,
        slowestEndpoint: responseData.slowestEndpoint || null,
        fastestEndpoint: responseData.fastestEndpoint || null,
        errorRates: responseData.errorRates || {},
        isMonitoringEnabled: true,
      };

      // If we got server metrics, always use them as they are real-time
      if (serverMetrics && serverMetrics.status === "online") {
        const latestSystemLoad = {
          timestamp: new Date(),
          memory: serverMetrics.memory,
          cpu: serverMetrics.cpu,
          diskSpace: serverMetrics.diskSpace,
          activeConnections: serverMetrics.activeConnections,
          uptime: serverMetrics.uptime,
        };

        // Always use real server metrics data
        mergedData.systemLoad = [latestSystemLoad];
      } else if (serverMetrics && serverMetrics.status === "permission-error") {
        // Handle permission errors by propagating the status
        return {
          ...mergedData,
          status: "permission-error",
          errorMessage: serverMetrics.errorMessage,
        };
      } else if (serverMetrics && serverMetrics.status === "connection-error") {
        // Handle connection errors
        return {
          ...mergedData,
          status: "connection-error",
          errorMessage: serverMetrics.errorMessage,
        };
      }

      // Return the merged metrics with real server data
      return mergedData;
    } catch (error) {
      console.error("Error fetching metrics from API:", error);
      return {
        apiCalls: [],
        systemLoad: [],
        errorRates: {},
        status: "error",
        errorMessage: "Failed to fetch metrics from server"
      };
    }
  }

  // Get a snapshot of response times by endpoint
  getResponseTimesByEndpoint() {
    const endpointMap = {};

    // Group by endpoint
    this.metrics.apiCalls.forEach((call) => {
      if (call.isSuccessful) {
        if (!endpointMap[call.endpoint]) {
          endpointMap[call.endpoint] = [];
        }

        endpointMap[call.endpoint].push({
          responseTime: call.responseTime,
          timestamp: call.timestamp,
        });
      }
    });

    return endpointMap;
  }
  // Get error rates by endpoint
  getErrorRates() {
    const result = [];

    if (!this.metrics || !this.metrics.errorRates) {
      return result;
    }

    Object.entries(this.metrics.errorRates).forEach(([endpoint, data]) => {
      // Make sure data is valid
      if (!data) return;

      const total = data.total || 0;
      const errors = data.errors || 0;
      const errorRate = total > 0 ? (errors / total) * 100 : 0;

      result.push({
        endpoint,
        total,
        errors,
        errorRate,
      });
    });

    return result.sort((a, b) => b.errorRate - a.errorRate);
  }

  // Reset all metrics
  resetMetrics() {
    this.metrics = {
      apiCalls: [],
      responseTimeAverage: 0,
      slowestEndpoint: null,
      fastestEndpoint: null,
      errorRates: {},
      systemLoad: [],
    };
    console.log("Performance metrics reset");
  }

  // Configure alerting
  configureAlerts(enabled, threshold) {
    this.alertsEnabled = enabled;
    if (threshold > 0) {
      this.alertThreshold = threshold;
    }
    console.log(
      `Performance alerts ${enabled ? "enabled" : "disabled"} with threshold ${
        this.alertThreshold
      }ms`
    );
  }

  // Check for and generate alerts
  checkForAlerts(endpoint, responseTime) {
    if (!this.alertsEnabled) return null;

    if (responseTime > this.alertThreshold) {
      const alert = {
        id: Date.now(),
        timestamp: new Date(),
        endpoint,
        responseTime,
        message: `Slow response detected: ${endpoint} took ${formatMs(
          responseTime
        )} (threshold: ${formatMs(this.alertThreshold)})`,
      };

      // Add to alert log
      this.alertLog.push(alert);

      // Keep only the last 100 alerts
      if (this.alertLog.length > 100) {
        this.alertLog.shift();
      }

      console.warn(`Performance alert: ${alert.message}`);
      return alert;
    }

    return null;
  }
  // Get current alerts
  async getAlerts() {
    // Always fetch alerts, monitoring is always enabled
    try {
      // Get alerts from the backend API
      const response = await axiosInstance.get("/monitoring/alerts");
      // Ensure we have an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching alerts from API:", error);
      return [...(this.alertLog || [])]; // Return local alerts as fallback if API fails
    }
    // Fallback to local alerts
    return [...(this.alertLog || [])];
  }

  // Clear alerts
  async clearAlerts() {
    if (this.isMonitoringEnabled) {
      try {
        // Clear alerts on the backend
        await axiosInstance.delete("/monitoring/alerts");
      } catch (error) {
        console.error("Error clearing alerts on API:", error);
      }
    }

    // Clear local alerts
    this.alertLog = [];
    console.log("Performance alerts cleared");
  }
}

const performanceService = new PerformanceService();
export default performanceService;
