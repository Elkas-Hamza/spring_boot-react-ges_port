import React, { useState, useEffect } from "react";
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
  Divider,
  Grid,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import ApiHelper from "../services/ApiHelper";
import MarsaMarocLogo from "../Marsa-Maroc.jpeg";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (AuthService.isAuthenticated()) {
      navigate("/dashboard");
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
      console.error("API test error:", err);
      setApiStatus({
        success: false,
        message: "Unable to connect to server",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const data = await AuthService.login(email, password);

      // Check if we have a valid token and user data
      if (!data.token) {
        throw new Error("No authentication token received");
      }

      // Handle potentially missing user data
      const role = data.user?.role || "USER";
      onLogin(role);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      // Show a more user-friendly error message
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to server. Please check if the server is running."
        );

        // Also update API status
        setApiStatus({
          success: false,
          message: "Server connection failed",
        });
      } else {
        setError(
          err.message ||
            "Authentication failed. Please check your credentials and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundImage: `url(${MarsaMarocLogo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay for better contrast
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} sx={{ my: { xs: 4, md: 0 } }}>
          {/* Left Side - Branding */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  lineHeight: 1,
                  mb: 1,
                }}
              >
                MARSA
                <br />
                MAROC
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontStyle: "italic",
                  color: "#FFA726",
                }}
              >
                WE LIFT YOUR SHORT!
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                opacity: 0.7,
              }}
            >
              <Typography variant="h6">
                Système de Management du departement terminal conteneurs
              </Typography>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={6}
              sx={{
                p: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.95)",
                borderLeft: "4px solid #E67E22",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#2C3E50",
                  mb: 3,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                PORTAL ACCESS
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
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
                    {isTesting ? "Testing..." : "Retry"}
                  </Button>
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {" "}
                <TextField
                  fullWidth
                  required
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ color: "#2C3E50", mr: 1 }} />
                    ),
                  }}
                  sx={{ mb: 2 }}
                  disabled={isLoading}
                />
                <TextField
                  fullWidth
                  required
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <VpnKeyIcon sx={{ color: "#2C3E50", mr: 1 }} />
                    ),
                  }}
                  sx={{ mb: 3 }}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    mb: 2,
                    backgroundColor: "#2C3E50",
                    "&:hover": { backgroundColor: "#E67E22" },
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "REQUEST ACCESS"
                  )}
                </Button>
                <Divider sx={{ my: 3 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    sx={{ color: "#2C3E50" }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
