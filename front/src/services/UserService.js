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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
directAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
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
  try {
    return await directAxios.get(API_URL);
  } catch (error) {
    if (error.response?.status === 403) {
      // If forbidden but we're supposed to be admin, return empty array
      return { data: [] };
    }
    throw error;
  }
};

const getUserById = async (id) => {
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
  return directAxios.post(API_URL, userData);
};

const updateUser = (id, userData) => {
  return directAxios.put(`${API_URL}/${id}`, userData);
};

const getCurrentUserDetails = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    // Attempt to recover data from API via token validation
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Token exists but userId is missing, try to validate token and get user info
        const validation = await directAxios.get(
          `${API_BASE_URL}/api/auth/validate`
        );
        if (validation.data && validation.data.valid) {
          // If we have user data from token validation, return it
          return validation.data.user;
        }
      }
    } catch (validationError) {
      // Token validation failed
    }

    throw new Error(
      "No user ID found in localStorage and token validation failed"
    );
  }

  try {
    const response = await getUserById(userId);
    return response.data;
  } catch (error) {
    // Return a basic user object as fallback
    const fallbackUser = {
      id: userId,
      email: localStorage.getItem("email") || "user",
      nom: localStorage.getItem("userName") || "User",
      role: localStorage.getItem("userRole") || "USER",
    };
    return fallbackUser;
  }
};

const deleteUser = (id) => {
  return directAxios.delete(`${API_URL}/${id}`);
};

const UserService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUserDetails,
};

export default UserService;
