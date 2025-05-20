import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsSystemDaydreamIcon from "@mui/icons-material/SettingsSystemDaydream";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axiosInstance from "../../services/AxiosConfig";

// Helper function to format time
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const SystemHealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/monitoring/health");
      setHealthData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching health data:", err);
      // Check if it's a connection error
      const isConnectionError =
        err.code === "ECONNREFUSED" ||
        err.message.includes("Network Error") ||
        !err.response;

      if (isConnectionError) {
        setError(
          "Cannot connect to server. Please check if the backend server is running."
        );
      } else if (err.response && err.response.status === 403) {
        setError(
          "You don't have permission to access health data. Please check your authentication or verify monitoring settings."
        );
        // Try to use the performance service to get metrics as a fallback
        import("../../services/PerformanceService").then((module) => {
          const performanceService = module.default;
          performanceService
            .fetchServerMetrics()
            .then((metrics) => {
              if (metrics && metrics.status === "online") {
                setHealthData({
                  status: "UP",
                  cpu: metrics.cpu || 0,
                  memory: metrics.memory || 0,
                  uptime: metrics.uptime || 0,
                  timestamp: new Date().toISOString(),
                  monitoringEnabled: true,
                });
                setError(
                  "Using client-side metrics due to server permission issues"
                );
              }
            })
            .catch(() => {
              // Keep the original error if the fallback fails
            });
        });
      } else {
        setError("Failed to fetch system health data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchHealthData, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading && !healthData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">System Health</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">System Health</Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box
              sx={{
                color: "error.main",
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
            >
              <ErrorIcon sx={{ mr: 1 }} />
              <Typography>{error}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                color="primary"
                onClick={fetchHealthData}
                size="small"
                sx={{ mt: 1 }}
              >
                <RefreshIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  Retry
                </Typography>
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">System Health</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchHealthData} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SettingsSystemDaydreamIcon
                  sx={{ mr: 1, color: "primary.main" }}
                />
                <Typography variant="h6">System Status</Typography>
                <Box flexGrow={1} />
                {healthData?.status === "UP" ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Online"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Offline"
                    color="error"
                    size="small"
                  />
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  CPU Usage
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box width="100%" mr={1}>
                    {" "}
                    <LinearProgress
                      variant="determinate"
                      value={healthData?.cpu ?? 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            healthData?.cpu > 80
                              ? "error.main"
                              : "primary.main",
                        },
                      }}
                    />
                  </Box>
                  <Box minWidth={35}>
                    {" "}
                    <Typography variant="body2" color="textSecondary">
                      {parseFloat(healthData?.cpu ?? 0).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Memory Usage
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box width="100%" mr={1}>
                    {" "}
                    <LinearProgress
                      variant="determinate"
                      value={healthData?.memory ?? 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            healthData?.memory > 80
                              ? "error.main"
                              : "success.main",
                        },
                      }}
                    />
                  </Box>
                  <Box minWidth={35}>
                    {" "}
                    <Typography variant="body2" color="textSecondary">
                      {parseFloat(healthData?.memory ?? 0).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <AccessTimeIcon
                  sx={{ fontSize: 20, mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2" color="textSecondary">
                  Uptime:{" "}
                  {healthData?.uptime ? formatUptime(healthData.uptime) : "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Last updated:{" "}
                  {new Date(healthData?.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Monitoring Status</Typography>
                <Box flexGrow={1} />
                {healthData?.monitoringEnabled ? (
                  <Chip label="Enabled" color="primary" size="small" />
                ) : (
                  <Chip label="Disabled" color="default" size="small" />
                )}
              </Box>

              <Typography variant="body2" sx={{ mb: 2 }}>
                System performance monitoring{" "}
                {healthData?.monitoringEnabled ? "is active" : "is not active"}.
                {!healthData?.monitoringEnabled &&
                  " Enable monitoring from the performance dashboard to track API performance."}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Visit the <b>Performance Dashboard</b> for detailed metrics
                  and analytics.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemHealthCheck;
