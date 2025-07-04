import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  // Removed unused import BarChartIcon
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Memory as MemoryIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import performanceService from "../../services/PerformanceService";
// Import charts correctly from @mui/x-charts
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";

// Helper function to format time in milliseconds
const formatTime = (ms) => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [serverMetrics, setServerMetrics] = useState(null);
  const [serverMetricsLastUpdated, setServerMetricsLastUpdated] =
    useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Define fetchServerMetrics first using useCallback to maintain stable reference
  const fetchServerMetrics = useCallback(async () => {
    try {
      const metrics = await performanceService.fetchServerMetrics();
      setServerMetrics(metrics);
      setServerMetricsLastUpdated(new Date());

      // Update system load with this metric data if possible
      if (
        metrics &&
        (metrics.status === "online" ||
          metrics.status === "permission-fallback") &&
        metrics.cpu !== undefined
      ) {
        // Update the global metrics state to include this server data
        setMetrics((prevMetrics) => {
          if (!prevMetrics) return prevMetrics;

          const systemLoadItem = {
            timestamp: new Date(),
            memory: metrics.memory !== undefined ? metrics.memory : 0,
            cpu: metrics.cpu !== undefined ? metrics.cpu : 0,
            diskSpace: metrics.diskSpace || { used: 0, total: 100000 },
            activeConnections: metrics.activeConnections || 0,
          };

          // Add to system load if needed
          const systemLoad = [...(prevMetrics.systemLoad || [])];
          systemLoad.push(systemLoadItem);

          // Keep only the most recent entries
          if (systemLoad.length > 10) {
            systemLoad.shift();
          }

          return {
            ...prevMetrics,
            systemLoad,
          };
        });
      }

      // Update connection status based on server response
      if (
        metrics.status === "online" ||
        metrics.status === "permission-fallback"
      ) {
        setConnectionError(null);
      } else if (metrics.status === "connection-error") {
        setConnectionError(metrics.errorMessage || "Connection error");
      } else if (metrics.status === "error") {
        setConnectionError("Server returned an error. Check server logs.");
      }

      // If we still have no data for CPU or memory, show a warning in console
      if (metrics.cpu === 0 && metrics.memory === 0) {
        console.warn(
          "Server returned zeros for both CPU and memory - possible configuration issue"
        );
      }
    } catch (error) {
      console.error("Failed to fetch server metrics:", error);
      setConnectionError(
        `Failed to connect to the monitoring service: ${error.message}`
      );
    }
  }, []);

  // Manual refresh of server metrics
  const handleRefreshServerMetrics = () => {
    fetchServerMetrics();
  };

  // On mount, fetch all metrics once
  useEffect(() => {
    performanceService.enableMonitoring();
    fetchMetrics();
    fetchServerMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Set up interval to fetch only server metrics every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchServerMetrics, 3000);
    return () => clearInterval(intervalId);
  }, [fetchServerMetrics]);

  // Calculate metrics locally
  const calculateMetrics = (apiCalls) => {
    if (!apiCalls || apiCalls.length === 0) {
      return {
        responseTimeAverage: 0,
        slowestEndpoint: null,
      };
    }

    const successfulCalls = apiCalls.filter(
      (call) => call && call.isSuccessful
    );

    if (successfulCalls.length === 0) {
      return {
        responseTimeAverage: 0,
        slowestEndpoint: null,
      };
    }

    // Calculate average response time
    const totalTime = successfulCalls.reduce(
      (sum, call) => sum + call.responseTime,
      0
    );
    const responseTimeAverage = totalTime / successfulCalls.length;

    // Find slowest endpoint
    const endpointMap = {};
    successfulCalls.forEach((call) => {
      if (!endpointMap[call.endpoint]) endpointMap[call.endpoint] = [];
      endpointMap[call.endpoint].push(call.responseTime);
    });

    let slowest = null;
    let slowestTime = -1;
    Object.entries(endpointMap).forEach(([endpoint, times]) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      if (avg > slowestTime) {
        slowestTime = avg;
        slowest = { endpoint, avgTime: avg };
      }
    });

    return {
      responseTimeAverage,
      slowestEndpoint: slowest,
    };
  };

  // Fetch latest metrics (API calls, slowest endpoint, etc.)
  const fetchMetrics = async () => {
    try {
      const latestMetrics = await performanceService.getMetrics();
      // Ensure we have arrays and other required data
      let apiCalls = latestMetrics.apiCalls || [];
      let systemLoad = latestMetrics.systemLoad || [];

      // Calculate metrics if needed
      let responseTimeAverage = latestMetrics.responseTimeAverage;
      let slowestEndpoint = latestMetrics.slowestEndpoint;

      if ((!responseTimeAverage || !slowestEndpoint) && apiCalls.length > 0) {
        const calculated = calculateMetrics(apiCalls);
        responseTimeAverage = calculated.responseTimeAverage;
        slowestEndpoint = calculated.slowestEndpoint;
      }

      // Ensure we have at least one system load data point
      if (systemLoad.length === 0 && serverMetrics) {
        systemLoad.push({
          timestamp: new Date(),
          memory: serverMetrics.memory || 0,
          cpu: serverMetrics.cpu || 0,
          diskSpace: serverMetrics.diskSpace || { used: 0, total: 100000 },
          activeConnections: serverMetrics.activeConnections || 0,
        });
      }

      setMetrics({
        ...latestMetrics,
        apiCalls,
        systemLoad,
        responseTimeAverage: responseTimeAverage || 0,
        slowestEndpoint,
      });
      setLastUpdated(new Date());
      // Also fetch alerts
      const currentAlerts = await performanceService.getAlerts();
      setAlerts(currentAlerts || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      // Set default empty values to prevent null reference errors
      setMetrics({
        apiCalls: [],
        systemLoad: [],
        responseTimeAverage: 0,
        slowestEndpoint: null,
      });
      setAlerts([]);
    }  };

  // Reset metrics
  const handleResetMetrics = () => {
    performanceService.resetMetrics();
    fetchMetrics();
  };

  // Clear alerts
  const handleClearAlerts = () => {
    performanceService.clearAlerts();
    setAlerts([]);
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchMetrics();
  };

  // Fetch alerts when metrics are updated
  useEffect(() => {
    const fetchedAlerts = performanceService.getAlerts();
    setAlerts(fetchedAlerts);
  }, [metrics]);

  // Prepare chart data for response times
  const prepareResponseTimeChartData = () => {
    if (!metrics || !metrics.apiCalls || metrics.apiCalls.length === 0)
      return null;

    // Only use the last 20 calls to keep the chart readable
    const recentCalls = [...metrics.apiCalls]
      .filter((call) => call && call.isSuccessful)
      .slice(-20);

    if (recentCalls.length === 0) return null;

    // Format data for LineChart
    return {
      xAxis: [
        {
          data: recentCalls.map((_, index) => index),
          label: "Requests (recent)",
          scaleType: "linear",
        },
      ],
      series: [
        {
          data: recentCalls.map((call) => call.responseTime || 0),
          label: "Response Time (ms)",
          color: "#2196f3",
        },
      ],
      // Create tooltip labels with endpoint names
      tooltipData: recentCalls.map((call) => ({
        endpoint: call.endpoint || "unknown",
        time: formatTime(call.responseTime || 0),
      })),
    };
  };

  // Prepare chart data for system load
  const prepareSystemLoadChartData = () => {
    if (!metrics || !metrics.systemLoad || metrics.systemLoad.length === 0)
      return null;

    // Only use the last 10 data points
    const recentData = [...metrics.systemLoad].slice(-10);

    if (recentData.length === 0) return null;

    // Format data for LineChart
    return {
      xAxis: [
        {
          data: recentData.map((_, index) => index),
          label: "Time",
          scaleType: "linear",
        },
      ],
      series: [
        {
          data: recentData.map((point) => point?.memory || 0),
          label: "Memory Usage (%)",
          color: "#f44336",
        },
        {
          data: recentData.map((point) => point?.cpu || 0),
          label: "CPU Usage (%)",
          color: "#4caf50",
        },
      ],
    };
  };

  // Prepare chart data for endpoint performance
  const prepareEndpointPerformanceData = () => {
    if (!metrics || !metrics.apiCalls || metrics.apiCalls.length === 0)
      return null;

    // Group by endpoint and calculate average response time
    const endpointData = {};
    metrics.apiCalls.forEach((call) => {
      if (!call || !call.isSuccessful) return;

      const endpoint = call.endpoint || "unknown";
      const responseTime = call.responseTime || 0;

      if (!endpointData[endpoint]) {
        endpointData[endpoint] = {
          totalTime: 0,
          count: 0,
        };
      }

      endpointData[endpoint].totalTime += responseTime;
      endpointData[endpoint].count += 1;
    });

    // If no valid data after filtering, return null
    if (Object.keys(endpointData).length === 0) return null;

    // Calculate averages and prepare for chart
    const endpoints = [];
    const avgTimes = [];

    Object.entries(endpointData).forEach(([endpoint, data]) => {
      endpoints.push(endpoint);
      avgTimes.push(data.totalTime / data.count);
    });

    // Limit to the top 8 endpoints if there are too many
    if (endpoints.length > 8) {
      const paired = endpoints.map((endpoint, index) => ({
        endpoint,
        avgTime: avgTimes[index],
      }));

      // Sort by average time (descending)
      paired.sort((a, b) => b.avgTime - a.avgTime);

      // Take the top 8
      const top8 = paired.slice(0, 8);

      return {
        endpoints: top8.map((item) => item.endpoint),
        avgTimes: top8.map((item) => item.avgTime),
      };
    }

    return {
      endpoints,
      avgTimes,
    };
  };

  // Prepare error rate data
  const prepareErrorRateData = () => {
    try {
      const errorRates = performanceService.getErrorRates();
      return errorRates || [];
    } catch (error) {
      console.error("Error getting error rates:", error);
      return [];
    }
  };

  // Response time chart component
  const ResponseTimeChart = () => {
    const chartData = prepareResponseTimeChartData();

    if (!chartData || chartData.series[0].data.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            No response time data available
          </Typography>
        </Box>
      );
    }

    return (
      <LineChart
        xAxis={chartData.xAxis}
        series={chartData.series}
        height={300}
        tooltip={{
          trigger: "item",
          formatter: (params) => {
            const index = params.dataIndex;
            const tooltipItem = chartData.tooltipData[index];
            return `${tooltipItem.endpoint}: ${tooltipItem.time}`;
          },
        }}
        sx={{ width: "100%" }}
      />
    );
  };

  // System load chart component
  const SystemLoadChart = () => {
    const chartData = prepareSystemLoadChartData();

    if (!chartData || chartData.series[0].data.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            No system load data available
          </Typography>
        </Box>
      );
    }

    return (
      <LineChart
        xAxis={chartData.xAxis}
        series={chartData.series}
        height={300}
        sx={{ width: "100%" }}
      />
    );
  };

  // Endpoint performance chart
  const EndpointPerformanceChart = () => {
    const data = prepareEndpointPerformanceData();

    if (!data || data.endpoints.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            No endpoint performance data available
          </Typography>
        </Box>
      );
    }

    return (
      <BarChart
        xAxis={[
          {
            scaleType: "band",
            data: data.endpoints,
            label: "Endpoints",
          },
        ]}
        series={[
          {
            data: data.avgTimes,
            label: "Avg. Response Time (ms)",
          },
        ]}
        height={300}
        sx={{ width: "100%" }}
      />
    );
  };
  // Server metrics component
  const ServerMetricsDisplay = () => {
    if (!serverMetrics) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={100}
        >
          <CircularProgress size={30} />
        </Box>
      );
    }

    // Show connection error if there is one
    if (connectionError || serverMetrics.status === "connection-error") {
      const errorMsg =
        connectionError ||
        serverMetrics.errorMessage ||
        "Connection error occurred";
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight={100}
          p={2}
        >
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchServerMetrics}>
                Retry
              </Button>
            }
          >
            {errorMsg}
          </Alert>
        </Box>
      );
    }

    // Format uptime
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);

      return parts.join(" ");
    };

    // Format bytes to a readable format
    const formatBytes = (bytes) => {
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "0 B";
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    // Check if diskSpace data exists
    const hasDiskSpace =
      serverMetrics.diskSpace &&
      serverMetrics.diskSpace.used !== undefined &&
      serverMetrics.diskSpace.total !== undefined;

    // Disk usage in percentage - with safety checks
    const diskUsagePercent = hasDiskSpace
      ? (serverMetrics.diskSpace.used / serverMetrics.diskSpace.total) * 100
      : 0;

    return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                CPU Usage
              </Typography>
              <Box display="flex" alignItems="center">
                <Box width="100%" mr={1}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      serverMetrics.cpu !== undefined ? serverMetrics.cpu : 0
                    }
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          (serverMetrics.cpu || 0) > 80 ? "#f44336" : "#2196f3",
                      },
                    }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="textSecondary">
                    {(serverMetrics?.cpu ?? 0).toFixed(1)}%
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
                  <LinearProgress
                    variant="determinate"
                    value={
                      serverMetrics.memory !== undefined
                        ? serverMetrics.memory
                        : 0
                    }
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          (serverMetrics.memory || 0) > 80
                            ? "#f44336"
                            : "#4caf50",
                      },
                    }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="textSecondary">
                    {(serverMetrics?.memory ?? 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Disk Usage
              </Typography>
              <Box display="flex" alignItems="center">
                <Box width="100%" mr={1}>
                  <LinearProgress
                    variant="determinate"
                    value={diskUsagePercent || 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          (diskUsagePercent || 0) > 80 ? "#f44336" : "#ff9800",
                      },
                    }}
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="textSecondary">
                    {(diskUsagePercent ?? 0).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 2 }, borderLeft: { md: "1px solid #eee" } }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Server Uptime
                </Typography>
                <Typography variant="body1">
                  {serverMetrics.uptime !== undefined
                    ? formatUptime(serverMetrics.uptime)
                    : "N/A"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Active Connections
                </Typography>
                <Typography variant="body1">
                  {serverMetrics.activeConnections !== undefined
                    ? serverMetrics.activeConnections
                    : "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Disk Space
                </Typography>
                {hasDiskSpace ? (
                  <Typography variant="body1">
                    Used:{" "}
                    {formatBytes(serverMetrics.diskSpace.used * 1024 * 1024)} /
                    Total:{" "}
                    {formatBytes(serverMetrics.diskSpace.total * 1024 * 1024)}
                  </Typography>
                ) : (
                  <Typography variant="body1">
                    No disk space information available
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Fallback chart component if MUI X Charts fails to load
  const SimpleFallbackChart = ({ data, title }) => {
    return (
      <Box
        sx={{
          p: 2,
          border: "1px solid #eee",
          borderRadius: 1,
          height: "300px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            height: "220px",
            alignItems: "flex-end",
            justifyContent: "space-around",
          }}
        >
          {data.map((item, index) => (
            <Box
              key={index}
              sx={{
                height: `${(item.value / item.maxValue) * 200}px`,
                width: "20px",
                backgroundColor: item.color || "#2196f3",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                position: "relative",
                borderRadius: "3px 3px 0 0",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: "-20px",
                  whiteSpace: "nowrap",
                  fontSize: "0.7rem",
                }}
              >
                {item.value.toFixed(1)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: "-20px",
                  transform: "rotate(-45deg)",
                  transformOrigin: "left top",
                  whiteSpace: "nowrap",
                  fontSize: "0.7rem",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Add a connection status display component
  const ConnectionStatusDisplay = () => {
    // If serverMetrics haven't loaded yet
    if (!serverMetrics) {
      return (
        <Chip
          icon={<AccessTimeIcon />}
          label="Checking connection..."
          color="default"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    }

    // If there's a connection error
    if (connectionError || serverMetrics.status === "connection-error") {
      return (
        <Tooltip
          title={
            connectionError || serverMetrics.errorMessage || "Connection error"
          }
        >
          <Chip
            icon={<ErrorIcon />}
            label="Connection Error"
            color="error"
            size="small"
            sx={{ ml: 1 }}
          />
        </Tooltip>
      );
    }

    // Connected successfully
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="Connected"
        color="success"
        size="small"
        sx={{ ml: 1 }}
      />
    );
  };

  if (!metrics) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
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
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Monitoring
        </Typography>

        <Box>
          <Tooltip title="Refresh metrics">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset all metrics">
            <IconButton onClick={handleResetMetrics} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {lastUpdated && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      )}

      {/* Key metrics cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Average Response Time
                </Typography>
              </Box>{" "}
              <Typography
                variant="h3"
                component="div"
                sx={{ my: 2, textAlign: "center" }}
              >
                {metrics.apiCalls &&
                metrics.apiCalls.length > 0 &&
                metrics.responseTimeAverage > 0
                  ? formatTime(metrics.responseTimeAverage)
                  : "0ms"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Based on{" "}
                {metrics.apiCalls && metrics.apiCalls.filter
                  ? metrics.apiCalls.filter((call) => call && call.isSuccessful)
                      .length
                  : 0}{" "}
                API calls
                {metrics.apiCalls && metrics.apiCalls.length === 0 && (
                  <span style={{ color: "#f57c00" }}>
                    {" "}
                    (Make API calls to see data)
                  </span>
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <WarningIcon
                  color={
                    metrics.apiCalls && metrics.apiCalls.length === 0
                      ? "disabled"
                      : "warning"
                  }
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6" component="div">
                  Slowest Endpoint
                </Typography>
              </Box>{" "}
              <Typography
                variant="h5"
                component="div"
                sx={{ my: 2, textAlign: "center" }}
              >
                {metrics.slowestEndpoint && metrics.slowestEndpoint.endpoint
                  ? metrics.slowestEndpoint.endpoint
                  : metrics.apiCalls && metrics.apiCalls.length > 0
                  ? "Processing..."
                  : "No API calls yet"}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                textAlign="center"
              >
                {metrics.slowestEndpoint &&
                metrics.slowestEndpoint.avgTime !== undefined
                  ? formatTime(metrics.slowestEndpoint.avgTime)
                  : metrics.apiCalls && metrics.apiCalls.length > 0
                  ? "Calculating..."
                  : "Make some API calls to see data"}
              </Typography>
              {!metrics.slowestEndpoint &&
                metrics.apiCalls &&
                metrics.apiCalls.length > 0 && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "block", mt: 1, textAlign: "center" }}
                  >
                    Re-calculating endpoint performance...
                  </Typography>
                )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MemoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  System Resources
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-around", my: 2 }}
              >
                {" "}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" component="div">                    {metrics.systemLoad &&
                    metrics.systemLoad.length > 0 &&
                    metrics.systemLoad[metrics.systemLoad.length - 1] &&
                    metrics.systemLoad[metrics.systemLoad.length - 1].memory !== undefined &&
                    metrics.systemLoad[metrics.systemLoad.length - 1].memory !== null
                      ? `${metrics.systemLoad[
                          metrics.systemLoad.length - 1
                        ].memory.toFixed(1)}%`
                      : serverMetrics && serverMetrics.memory !== undefined && serverMetrics.memory !== null
                      ? `${serverMetrics.memory.toFixed(1)}%`
                      : "0.0%"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Memory
                  </Typography>
                  {(serverMetrics === null ||
                    serverMetrics.memory === undefined) && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
                    >
                      Waiting for server data...
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" component="div">                    {metrics.systemLoad &&
                    metrics.systemLoad.length > 0 &&
                    metrics.systemLoad[metrics.systemLoad.length - 1] &&
                    metrics.systemLoad[metrics.systemLoad.length - 1].cpu !== undefined &&
                    metrics.systemLoad[metrics.systemLoad.length - 1].cpu !== null
                      ? `${metrics.systemLoad[
                          metrics.systemLoad.length - 1
                        ].cpu.toFixed(1)}%`
                      : serverMetrics && serverMetrics.cpu !== undefined && serverMetrics.cpu !== null
                      ? `${serverMetrics.cpu.toFixed(1)}%`
                      : "0.0%"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    CPU
                  </Typography>
                  {(serverMetrics === null ||
                    serverMetrics.cpu === undefined) && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
                    >
                      Waiting for server data...
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error rates table */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Error Rates by Endpoint
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Endpoint</TableCell>
                <TableCell align="right">Total Requests</TableCell>
                <TableCell align="right">Error Count</TableCell>
                <TableCell align="right">Error Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prepareErrorRateData() && prepareErrorRateData().length > 0 ? (
                prepareErrorRateData().map((item) => (
                  <TableRow
                    key={item.endpoint || "unknown"}
                    sx={{
                      backgroundColor:
                        (item.errorRate || 0) > 20
                          ? "rgba(244, 67, 54, 0.1)"
                          : "inherit",
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {item.endpoint || "unknown"}
                    </TableCell>
                    <TableCell align="right">{item.total || 0}</TableCell>
                    <TableCell align="right">{item.errors || 0}</TableCell>
                    <TableCell align="right">
                      {(item.errorRate || 0).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No error data available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Performance Alerts */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 3,
          border: alerts.length > 0 ? "1px solid #f44336" : "none",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <WarningIcon
              color={alerts.length > 0 ? "error" : "disabled"}
              sx={{ mr: 1 }}
            />
            Performance Alerts
            {alerts.length > 0 && (
              <Typography
                variant="button"
                component="span"
                sx={{
                  ml: 2,
                  backgroundColor: "#f44336",
                  color: "white",
                  borderRadius: 10,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                {alerts.length}
              </Typography>
            )}
          </Typography>

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleClearAlerts}
            disabled={alerts.length === 0}
          >
            Clear Alerts
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {alerts.length > 0 ? (
          <Box sx={{ maxHeight: "300px", overflow: "auto" }}>
            {alerts.map((alert) => (
              <Alert key={alert.id} severity="error" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="subtitle2">{alert.message}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(alert.timestamp).toLocaleString()} • Endpoint:{" "}
                    {alert.endpoint}
                  </Typography>
                </Box>
              </Alert>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" align="center">
            No performance alerts detected
          </Typography>
        )}
      </Paper>      {/* Server Metrics */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <MemoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              Real-Time Server Metrics
            </Typography>
            {serverMetricsLastUpdated && (
              <Chip 
                size="small" 
                label={`Updated: ${serverMetricsLastUpdated.toLocaleTimeString()}`} 
                color="primary" 
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Button 
            onClick={fetchServerMetrics} 
            variant="contained" 
            size="small"
            startIcon={<RefreshIcon />}
            color="primary"
          >
            Refresh Metrics
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
          Live data from the server showing current resource utilization and performance.
        </Typography>
        <Divider sx={{ mb: 2 }} /> 
        <ServerMetricsDisplay />
        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Typography variant="body2" color="textSecondary" mr={1}>
            Server Connection Status:
          </Typography>
          <ConnectionStatusDisplay />
        </Box>
      </Paper>
    </Box>
  );
};

export default PerformanceMonitor;
