import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Alert,
  Link,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import ApiHelper from '../services/ApiHelper';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard');
    }
    
    // Test API connection on component mount
    testApiConnection();
  }, [navigate]);

  const testApiConnection = async () => {
    setIsTesting(true);
    try {
      const result = await ApiHelper.testConnection();
      setApiStatus(result);
    } catch (err) {
      console.error('API test error:', err);
      setApiStatus({
        success: false,
        message: 'Unable to connect to server'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Log API request for debugging
      ApiHelper.debugRequest(`${ApiHelper.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await AuthService.login(email, password);
      
      // Check if we have a valid token and user data
      if (!data.token) {
        throw new Error('No authentication token received');
      }
      
      // Handle potentially missing user data
      const role = data.user?.role || 'USER';
      onLogin(role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // Show a more user-friendly error message
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Unable to connect to server. Please check if the server is running.');
        
        // Also update API status
        setApiStatus({
          success: false,
          message: 'Server connection failed'
        });
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            System De Management Des Port
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {apiStatus && !apiStatus.success && !error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Server Connection Status: {apiStatus.message}
              <Button 
                size="small" 
                onClick={testApiConnection} 
                disabled={isTesting}
                sx={{ ml: 1 }}
              >
                {isTesting ? 'Testing...' : 'Retry'}
              </Button>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                  Signing in...
                </Box>
              ) : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                component="button" 
                variant="body2"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {apiStatus?.success 
                ? '✓ Server Connection OK' 
                : '⚠ You can still log in if server is running'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 