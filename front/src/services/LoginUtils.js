/**
 * Utility functions to help with login and user data management
 */

/**
 * Validates the login process by checking localStorage for expected values
 * @returns {Object} Validation results
 */
export const validateLoginData = () => {
  const results = {
    token: !!localStorage.getItem("token"),
    userId: !!localStorage.getItem("userId"),
    email: !!localStorage.getItem("email"),
    role: !!localStorage.getItem("userRole"),
    userName: !!localStorage.getItem("userName"),
  };

  results.allPresent =
    results.token && results.userId && results.email && results.role;

  return results;
};

/**
 * Checks if the current login session includes a user name
 * @returns {boolean} True if userName is stored in localStorage
 */
export const hasUserName = () => {
  const userName = localStorage.getItem("userName");
  return !!userName && userName.trim() !== "";
};

/**
 * Gets the preferred display name for the current user
 * @returns {string} The user name or email username portion
 */
export const getDisplayName = () => {
  const userName = localStorage.getItem("userName");
  if (userName && userName.trim() !== "") {
    return userName;
  }

  const email = localStorage.getItem("email");
  if (email && email.includes("@")) {
    return email.split("@")[0];
  }

  return "User";
};

export default {
  validateLoginData,
  hasUserName,
  getDisplayName,
};
