import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  GroupOutlined,
  BusinessOutlined,
  DirectionsBoatOutlined,
  LocalShippingOutlined,
  PersonAddOutlined,
  SettingsOutlined,
  BarChartOutlined,
  AccessTimeOutlined,
  SpeedOutlined,
} from "@mui/icons-material";

// Mock service imports (replace with actual services)
import UserService from "../../services/UserService";
import OperationService from "../../services/OperationService";
import EscaleService from "../../services/EscaleService";
import PersonnelService from "../../services/PersonnelService";

const StatCard = ({ title, value, icon, color, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" component="div" color={color}>
            {value !== null ? value : <CircularProgress size={24} />}
          </Typography>
          <Box
            sx={{
              backgroundColor: `${color}22`,
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28, color: color } })}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const QuickAccessCard = ({ title, description, icon, linkTo, color }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" alignItems="center" mb={1}>
          {React.cloneElement(icon, { sx: { color: color, mr: 1 } })}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => navigate(linkTo)}
          sx={{ color: color }}
        >
          Access
        </Button>
      </CardActions>
    </Card>
  );
};

const RecentActivityList = () => {
  // This would be replaced with actual activity data from an API
  const activities = [
    {
      id: 1,
      description: "User admin added a new personnel member",
      timestamp: "10 minutes ago",
    },
    {
      id: 2,
      description: "New operation created: Chargement ConteneurMD",
      timestamp: "2 hours ago",
    },
    {
      id: 3,
      description: "User hamza modified escale ESC-129",
      timestamp: "4 hours ago",
    },
    {
      id: 4,
      description: "New shift assigned to équipe EQP-007",
      timestamp: "1 day ago",
    },
    {
      id: 5,
      description: "System backup completed successfully",
      timestamp: "1 day ago",
    },
  ];

  return (
    <List sx={{ width: "100%" }}>
      {activities.map((activity) => (
        <React.Fragment key={activity.id}>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <AccessTimeOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={activity.description}
              secondary={activity.timestamp}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: null,
    operationCount: null,
    activeEscales: null,
    personnelCount: null,
  });
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    nom: localStorage.getItem("userName") || "",
    prenom: localStorage.getItem("userLastName") || "",
    email: localStorage.getItem("email") || "admin@example.com",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user details if possible
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const userResponse = await UserService.getUserById(userId);
            if (userResponse && userResponse.data) {
              setUserData({
                nom:
                  userResponse.data.nom ||
                  localStorage.getItem("userName") ||
                  "",
                prenom:
                  userResponse.data.prenom ||
                  localStorage.getItem("userLastName") ||
                  "",
                email:
                  userResponse.data.email ||
                  localStorage.getItem("email") ||
                  "",
              });
            }
          }
        } catch (userErr) {
          console.error("Error fetching user details:", userErr);
          // Continue with localStorage data
        }

        // These could be run in parallel with Promise.all
        const users = await UserService.getAllUsers();
        const operations = await OperationService.getAllOperations();
        const escales = await EscaleService.getAllEscales();
        const personnel = await PersonnelService.getAllPersonnel();

        // Calculate active escales (this is a placeholder calculation)
        const activeEscales = escales.data.filter(
          (escale) =>
            !escale.dateDepart || new Date(escale.dateDepart) > new Date()
        ).length;

        setStats({
          userCount: users.data.length,
          operationCount: operations.data.length,
          activeEscales: activeEscales,
          personnelCount: personnel.data.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values in case of error
        setStats({
          userCount: "?",
          operationCount: "?",
          activeEscales: "?",
          personnelCount: "?",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>{" "}
      {/* Admin Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "secondary.light",
          color: "secondary.contrastText",
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "secondary.main",
              color: "white",
              mr: 2,
            }}
          >
            {userData.nom?.charAt(0) || userData.email?.charAt(0) || "A"}
          </Avatar>
          <Box>
            <Typography variant="h4">
              Bonjour, {userData.prenom || userData.nom || "Admin"}
            </Typography>
            <Typography variant="body1">
              Welcome to the admin control panel
            </Typography>
          </Box>
        </Box>
      </Paper>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.userCount}
            icon={<GroupOutlined />}
            color="#4caf50"
            onClick={() => navigate("/users")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Operations"
            value={stats.operationCount}
            icon={<LocalShippingOutlined />}
            color="#2196f3"
            onClick={() => navigate("/operations")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Escales"
            value={stats.activeEscales}
            icon={<DirectionsBoatOutlined />}
            color="#ff9800"
            onClick={() => navigate("/escales")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Personnel"
            value={stats.personnelCount}
            icon={<BusinessOutlined />}
            color="#f44336"
            onClick={() => navigate("/personnel")}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {/* Quick Access Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Quick Access
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <QuickAccessCard
                  title="Add User"
                  description="Create a new user account with specific permissions"
                  icon={<PersonAddOutlined />}
                  linkTo="/users/create"
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAccessCard
                  title="System Settings"
                  description="Manage global system configurations"
                  icon={<SettingsOutlined />}
                  linkTo="/settings"
                  color="#2196f3"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAccessCard
                  title="Analytics"
                  description="View detailed system performance metrics"
                  icon={<BarChartOutlined />}
                  linkTo="/analytics"
                  color="#ff9800"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QuickAccessCard
                  title="Performance"
                  description="Monitor system performance and response times"
                  icon={<SpeedOutlined />}
                  linkTo="/performance"
                  color="#f44336"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <RecentActivityList />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
