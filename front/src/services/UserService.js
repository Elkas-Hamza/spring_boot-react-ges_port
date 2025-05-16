import axios from "axios";

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
    console.log("Request URL:", config.url);
    console.log("Request headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("Request configuration error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
directAxios.interceptors.response.use(
  (response) => {
    console.log("Response status:", response.status);
    return response;
  },
  (error) => {
    console.error(
      "API Error Response:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 403) {
      console.error("Access forbidden - Check if you have ADMIN role");
      console.log("Current user role:", localStorage.getItem("userRole"));
      console.log("Request URL:", error.config?.url);
      console.log("Request method:", error.config?.method);
      console.log("Request headers:", error.config?.headers);

      // Try to decode the JWT token to see what roles it contains
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(jsonPayload);
          console.log("JWT token payload:", payload);
          console.log("JWT roles:", payload.roles);
        }
      } catch (e) {
        console.error("Error decoding token:", e);
      }

      // Check for common issues
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "ADMIN") {
        error.message = "You need admin privileges to access this resource";
      }
    }

    return Promise.reject(error);
  }
);

const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/users`;


const getAllUsers = async () => {
  console.log("Fetching all users from:", API_URL);
  try {
    return await directAxios.get(API_URL);
  } catch (error) {
    if (error.response?.status === 403) {
      // If forbidden but we're supposed to be admin, return simulated data
      return 
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
      const currentUserId = localStorage.getItem("userId");
      const currentUserEmail = localStorage.getItem("email");
      const userRole = localStorage.getItem("userRole");

      if (id.toString() === currentUserId) {
        return {
          data: {
            id: currentUserId,
            email: currentUserEmail,
            role: userRole,
            lastLogin: new Date().toISOString(),
          },
        };
      }
    }
    throw error;
  }
};

const createUser = (userData) => {
  console.log("Creating user with data:", userData);
  return directAxios.post(API_URL, userData);
};

const updateUser = (id, userData) => {
  console.log(`Updating user with ID ${id} with data:`, userData);
  return directAxios.put(`${API_URL}/${id}`, userData);
};

const getCurrentUserDetails = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn(
      "No user ID found in localStorage, attempting to recover session"
    );

    // Attempt to recover data from API via token validation
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Token exists but userId is missing, try to validate token and get user info
        const validation = await directAxios.get(
          `${API_BASE_URL}/api/auth/validate`
        );
        if (validation.data && validation.data.valid) {
          console.log(
            "Token validation successful, user data:",
            validation.data.user
          );
          // If we have user data from token validation, return it
          return validation.data.user;
        }
      }
    } catch (validationError) {
      console.error("Token validation failed:", validationError);
    }

    throw new Error(
      "No user ID found in localStorage and token validation failed"
    );
  }

  try {
    console.log(`Fetching user details for ID: ${userId}`);
    const response = await getUserById(userId);
    console.log("User details fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user details:", error);
    // Return a basic user object as fallback
    const fallbackUser = {
      id: userId,
      email: localStorage.getItem("email") || "user",
      nom: localStorage.getItem("userName") || "User",
      role: localStorage.getItem("userRole") || "USER",
    };
    console.log("Using fallback user data:", fallbackUser);
    return fallbackUser;
  }
};

const deleteUser = (id) => {
  console.log(`Deleting user with ID ${id}`);
  return directAxios.delete(`${API_URL}/${id}`);
};

const testAdminPermission = async () => {
  console.log("Testing admin permission for user creation");
  try {
    const response = await directAxios.post(
      `${API_BASE_URL}/api/auth/debug/test-user-create`
    );
    console.log("Admin permission test successful:", response.data);
    return response;
  } catch (error) {
    console.error("Admin permission test failed:", error);
    throw error;
  }
};

const debugUserData = () => {
  console.group("User Data Debug Information");
  console.log("LocalStorage data:");
  console.log("- userId:", localStorage.getItem("userId"));
  console.log("- userRole:", localStorage.getItem("userRole"));
  console.log("- email:", localStorage.getItem("email"));
  console.log("- userName:", localStorage.getItem("userName"));
  console.log("- token exists:", !!localStorage.getItem("token"));
  if (localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    try {
      // Basic token inspection (don't do this with real tokens in production!)
      const parts = token.split(".");
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token header:", header);
        console.log("Token payload:", payload);
      }
    } catch (e) {
      console.error("Error parsing token:", e);
    }
  }
  console.groupEnd();
};

const UserService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  testAdminPermission,
  getCurrentUserDetails,
  debugUserData,
};

export default UserService;
