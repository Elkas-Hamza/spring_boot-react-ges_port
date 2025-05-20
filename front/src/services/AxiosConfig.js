import axios from "axios";

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // When deployed to Vercel, use the backend URL
  if (
    window.location.origin === "https://spring-boot-react-ges-port.vercel.app"
  ) {
    // Use your backend URL - wherever it's deployed
    return "https://6551-102-96-241-88.ngrok-free.app/api"; // Replace with your actual backend server URL/IP
  }
  // For local development
  return "http://localhost:8080/api";
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;

      // Add debugging for specific endpoints that need admin access
      if (config.url?.includes("conteneurs") && config.method !== "get") {
        console.log("DEBUG - Container request with token:", {
          method: config.method,
          url: config.url,
          hasAuthHeader: !!config.headers["Authorization"],
          userRole: localStorage.getItem("userRole"),
        });
      }
    } else {
      console.warn(`Request to ${config.url} has no auth token available`);
    }

    // Log the request for debugging
    console.log(`${config.method.toUpperCase()} ${config.url}`, config.data);

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Add logging for navires endpoint
    if (response.config.url.includes("/navires")) {
      console.log("NAVIRES API RESPONSE:", {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data)
          ? response.data.length
          : "Not an array",
      });
    }

    // Log success responses for sensitive operations
    if (
      response.config.method !== "get" &&
      response.config.url?.includes("conteneurs")
    ) {
      console.log(
        `Container operation successful: ${response.config.method} ${response.config.url}`
      );
    }
    return response;
  },
  (error) => {
    // Handle auth errors
    if (error.response) {
      if (error.response.status === 401) {
        console.warn(
          "Authentication token expired, redirecting to login page..."
        );

        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");

        // Use replace state to avoid browser history issues
        window.location.replace("/");
      } else if (error.response.status === 403) {
        // For 403 forbidden errors, provide more details for debugging
        console.warn("Authorization error: Forbidden resource", {
          endpoint: error.config.url,
          method: error.config.method,
          userRole: localStorage.getItem("userRole"),
          hasToken: !!localStorage.getItem("token"),
        });

        // Special handling for monitoring endpoints
        if (error.config.url.includes("/monitoring/")) {
          console.info(
            "Monitoring permission issue detected - endpoint requires higher privileges"
          );
          
          // Instead of using mock data, we'll let the error propagate so the UI can show
          // the appropriate error state and prompt for authentication
          return Promise.reject({
            ...error,
            response: {
              ...error.response,
              data: {
                status: "permission-error",
                errorMessage: "Insufficient permissions to access monitoring data",
              },
            },
          });
        }
      } else if (error.response.status === 500) {
        // Log server errors with more details
        console.error("Server error (500):", error.response);
        console.error("Request data that caused the error:", error.config.data);
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error("Network error: No response received");
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
