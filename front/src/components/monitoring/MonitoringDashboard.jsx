import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  // Paper is unused
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import PerformanceMonitor from "./PerformanceMonitor";
import SystemHealthCheck from "./SystemHealthCheck";
import performanceService from "../../services/PerformanceService";

const MonitoringDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // Check if monitoring is active on component mount
  useEffect(() => {
    setIsMonitoringActive(performanceService.isMonitoringEnabled);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleMonitoring = () => {
    if (isMonitoringActive) {
      performanceService.disableMonitoring();
    } else {
      performanceService.enableMonitoring();
    }

    setIsMonitoringActive(!isMonitoringActive);
    handleMenuClose();
  };

  const handleResetMetrics = () => {
    performanceService.resetMetrics();
    handleMenuClose();
  };

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            System Monitoring
          </Typography>

          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            aria-label="more options"
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleToggleMonitoring}>
              <ListItemIcon>
                {isMonitoringActive ? (
                  <RefreshIcon color="primary" />
                ) : (
                  <MemoryIcon />
                )}
              </ListItemIcon>
              <ListItemText>
                {isMonitoringActive ? "Pause Monitoring" : "Start Monitoring"}
              </ListItemText>
            </MenuItem>

            <MenuItem onClick={handleResetMetrics}>
              <ListItemIcon>
                <RefreshIcon />
              </ListItemIcon>
              <ListItemText>Reset Metrics</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<SpeedIcon />} label="Performance" />
          <Tab icon={<MemoryIcon />} label="System Health" />
        </Tabs>
      </AppBar>

      <Box sx={{ p: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <PerformanceMonitor />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SystemHealthCheck />
        </TabPanel>

      </Box>
    </Box>
  );
};

// TabPanel component for displaying tab content
const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default MonitoringDashboard;
