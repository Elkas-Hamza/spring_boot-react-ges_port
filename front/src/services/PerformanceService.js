import axiosInstance from "./AxiosConfig";

// Utility function to format milliseconds
const formatMs = (ms) => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

class PerformanceService {
  // Store metrics in memory
  metrics = {
    apiCalls: [],
    responseTimeAverage: 0,
    slowestEndpoint: null,
    fastestEndpoint: null,
    errorRates: {},
    systemLoad: [],
  };

  // Maximum number of data points to keep for charts
  maxDataPoints = 100;

  // Track if monitoring is enabled
  isMonitoringEnabled = false;

  // Interceptor IDs
  requestInterceptorId = null;
  responseInterceptorId = null;

  // Alert settings
  alertThreshold = 5000; // Default 5 seconds
  alertsEnabled = true;
  alertLog = [];
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

    // Sample every 5 seconds
    this.systemLoadIntervalId = setInterval(async () => {
      // Fetch real server metrics
      const serverMetrics = await this.fetchServerMetrics();

      if (serverMetrics) {
        this.metrics.systemLoad.push({
          timestamp: new Date(),
          memory: serverMetrics.memory,
          cpu: serverMetrics.cpu,
          diskSpace: serverMetrics.diskSpace,
          activeConnections: serverMetrics.activeConnections,
          uptime: serverMetrics.uptime,
        });

        // Limit the number of data points
        if (this.metrics.systemLoad.length > this.maxDataPoints) {
          this.metrics.systemLoad.shift();
        }
      }
    }, 5000);
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
      // Use the real backend API for server metrics
      // Note: baseURL is already set to "http://localhost:8080/api" in axiosInstance
      const response = await axiosInstance.get("/monitoring/system-metrics", {
        // Add timeout to avoid long waits
        timeout: 5000,
        // Re-add the retry header since it's now properly configured on the backend
        headers: {
          "X-Retry-Count": retryCount.toString(),
        },
      });

      // Make sure response data is valid
      const data = response.data || {};

      // Check if data has any of the expected properties
      const hasExpectedData =
        data.cpu !== undefined ||
        data.memory !== undefined ||
        data.uptime !== undefined;

      if (!hasExpectedData) {
        console.warn("Server returned empty or invalid metrics data");
      } // Validate structure and normalize data with safety checks
      const cpu = data.cpu !== undefined ? data.cpu : 0;
      const memory = data.memory !== undefined ? data.memory : 0;

      // Validate CPU value (should be between 0-100)
      let normalizedCpu = cpu;
      if (cpu < 0) {
        console.warn("Backend returned negative CPU value:", cpu);
        normalizedCpu = Math.abs(cpu % 100); // Convert negative value to positive and ensure it's in 0-100 range
      } else if (cpu > 100) {
        console.warn("Backend returned CPU value > 100%:", cpu);
        normalizedCpu = 100; // Cap at 100%
      }

      // Validate Memory value (should be between 0-100)
      let normalizedMemory = memory;
      if (memory < 0) {
        console.warn("Backend returned negative Memory value:", memory);
        normalizedMemory = 25; // Use reasonable default
      } else if (memory > 100) {
        console.warn("Backend returned Memory value > 100%:", memory);
        normalizedMemory = 100; // Cap at 100%
      }

      return {
        cpu: normalizedCpu,
        memory: normalizedMemory,
        diskSpace: data.diskSpace || {
          total: 100000, // Default values
          used: 0,
          free: 100000,
        },
        activeConnections:
          data.activeConnections !== undefined ? data.activeConnections : 0,
        uptime: data.uptime !== undefined ? data.uptime : 0,
        status: "online",
      };
    } catch (error) {
      console.error("Failed to fetch server metrics:", error);

      // Check if it's a connection error
      const isConnectionError =
        error.code === "ECONNREFUSED" ||
        error.message.includes("Network Error") ||
        !error.response;

      // Check if it's a permission error
      const isPermissionError = error.response && error.response.status === 403;

      // Retry logic for connection issues (but not for permission issues)
      if (isConnectionError && retryCount < 2) {
        console.log(`Retrying connection (attempt ${retryCount + 1})...`);
        // Wait with exponential backoff
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.fetchServerMetrics(retryCount + 1));
          }, 1000 * Math.pow(2, retryCount));
        });
      }

      // Return default structure with status indicating the error
      return {
        cpu: 0,
        memory: 0,
        diskSpace: {
          total: 100000,
          used: 0,
          free: 100000,
        },
        activeConnections: 0,
        uptime: 0,
        status: isConnectionError ? "connection-error" : "error",
        errorMessage: isConnectionError
          ? "Cannot connect to server. Please check if the backend server is running."
          : error.message || "Unknown error occurred",
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
  } // Get the current metrics
  async getMetrics() {
    // Always fetch metrics, monitoring is always enabled
    try {
      // Try to fetch server metrics first to ensure we have the latest data
      const serverMetricsPromise = this.fetchServerMetrics().catch((err) => {
        console.warn(
          "Failed to fetch server metrics during getMetrics call:",
          err
        );
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

      // Calculate metrics if they're missing but we have API calls data
      if (
        mergedData.apiCalls.length > 0 &&
        (!mergedData.responseTimeAverage || !mergedData.slowestEndpoint)
      ) {
        this.calculateMetrics(); // Recalculate local metrics
        mergedData.responseTimeAverage = this.metrics.responseTimeAverage;
        mergedData.slowestEndpoint = this.metrics.slowestEndpoint;
      }

      // If we got server metrics, incorporate them into system load
      if (serverMetrics && serverMetrics.status === "online") {
        const latestSystemLoad = {
          timestamp: new Date(),
          memory: serverMetrics.memory !== undefined ? serverMetrics.memory : 0,
          cpu: serverMetrics.cpu !== undefined ? serverMetrics.cpu : 0,
          diskSpace: serverMetrics.diskSpace || { used: 0, total: 100000 },
          activeConnections: serverMetrics.activeConnections || 0,
        };

        // Add to system load data
        if (!mergedData.systemLoad || mergedData.systemLoad.length === 0) {
          mergedData.systemLoad = [latestSystemLoad];
        } else {
          // Add latest data while ensuring we don't exceed the maximum data points
          mergedData.systemLoad.push(latestSystemLoad);
          if (mergedData.systemLoad.length > this.maxDataPoints) {
            mergedData.systemLoad.shift();
          }
        }
      }

      // Ensure system load has default values for display
      if (mergedData.systemLoad && mergedData.systemLoad.length > 0) {
        mergedData.systemLoad = mergedData.systemLoad.map((item) => ({
          timestamp: item.timestamp || new Date(),
          memory: item.memory !== undefined ? item.memory : 0,
          cpu: item.cpu !== undefined ? item.cpu : 0,
          diskSpace: item.diskSpace || { used: 0, total: 100000 },
          activeConnections: item.activeConnections || 0,
        }));
      }

      return mergedData;
    } catch (error) {
      console.error("Error fetching metrics from API:", error);
    }

    // Fallback to local metrics with safe defaults
    const safeMetrics = { ...this.metrics };
    if (!safeMetrics.apiCalls) safeMetrics.apiCalls = [];
    if (!safeMetrics.systemLoad) safeMetrics.systemLoad = [];
    if (!safeMetrics.errorRates) safeMetrics.errorRates = {};

    // Calculate local metrics if we have API calls but no calculated metrics
    if (
      safeMetrics.apiCalls.length > 0 &&
      (!safeMetrics.responseTimeAverage || !safeMetrics.slowestEndpoint)
    ) {
      this.calculateMetrics();
      safeMetrics.responseTimeAverage = this.metrics.responseTimeAverage;
      safeMetrics.slowestEndpoint = this.metrics.slowestEndpoint;
    }

    // Add dummy system load data if empty
    if (!safeMetrics.systemLoad || safeMetrics.systemLoad.length === 0) {
      safeMetrics.systemLoad = [
        {
          timestamp: new Date(),
          memory: 0,
          cpu: 0,
          diskSpace: { used: 0, total: 100000 },
          activeConnections: 0,
        },
      ];
    }

    return {
      ...safeMetrics,
      isMonitoringEnabled: true,
    };
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
  } // Get current alerts
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
