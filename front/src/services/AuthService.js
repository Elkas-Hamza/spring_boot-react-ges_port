const API_URL = 'http://localhost:8080/api/auth';

const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if response is ok and has content
    if (!response.ok) {
      // Handle different status codes with appropriate messages
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid email or password');
      }
      
      if (response.status === 404) {
        throw new Error('Authentication service not available');
      }
      
      if (response.status === 500) {
        throw new Error('Server error. Please try again later');
      }
      
      // Try to get error message from response
      const errorText = await response.text();
      let errorMessage;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `Error: ${response.status}`;
      } catch (e) {
        // If parsing fails, use text or status
        errorMessage = errorText || `Error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Check for empty response
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      throw new Error('Server returned empty response');
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user ? data.user.role : 'USER');
      localStorage.setItem('userId', data.user ? data.user.id : '');
      localStorage.setItem('email', data.user ? data.user.email : '');
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle network errors with a user-friendly message
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      throw new Error('Unable to reach the server. Please check your internet connection');
    }
    
    throw error;
  }
};

const register = async (email, password, role) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        role 
      }),
    });

    // Check if response is ok and has content
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `Error: ${response.status}`;
      } catch (e) {
        // If parsing fails, use text or status
        errorMessage = errorText || `Error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Check for empty response
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      throw new Error('Server returned empty response');
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
};

const getCurrentUser = () => {
  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('userRole'),
    id: localStorage.getItem('userId'),
    email: localStorage.getItem('email')
  };
};

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    const response = await fetch(`${API_URL}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
};

const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_URL}/reset-password-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    // Check if response is ok and has content
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `Error: ${response.status}`;
      } catch (e) {
        // If parsing fails, use text or status
        errorMessage = errorText || `Error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Check for empty response
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      return { message: 'Password reset instructions sent' };
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    
    return data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    // Check if response is ok and has content
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `Error: ${response.status}`;
      } catch (e) {
        // If parsing fails, use text or status
        errorMessage = errorText || `Error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Check for empty response
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      return { message: 'Password has been reset successfully' };
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    
    return data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });

    // Check if response is ok and has content
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `Error: ${response.status}`;
      } catch (e) {
        // If parsing fails, use text or status
        errorMessage = errorText || `Error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Check for empty response
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      return { message: 'Password changed successfully' };
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    
    return data;
  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
};

const getTokenDebugInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { exists: false, message: 'No token found' };
  }
  
  try {
    // Get token parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { exists: true, valid: false, message: 'Token does not have 3 parts (header.payload.signature)' };
    }
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    const now = Date.now() / 1000;
    const isExpired = payload.exp && payload.exp < now;
    
    return {
      exists: true,
      valid: !isExpired,
      expired: isExpired,
      issueTime: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'unknown',
      expireTime: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'unknown',
      subject: payload.sub || 'unknown',
      roles: payload.roles || []
    };
  } catch (e) {
    return { exists: true, valid: false, error: e.message, message: 'Token parsing error' };
  }
};

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  verifyToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getTokenDebugInfo
};

export default AuthService; 