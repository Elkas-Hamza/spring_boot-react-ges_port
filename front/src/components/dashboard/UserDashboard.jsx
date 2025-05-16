import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  DirectionsBoat as DirectionsBoatIcon,
  Work as WorkIcon,
  ErrorOutline as ErrorOutlineIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

// Import services
import UserService from "../../services/UserService";
import OperationService from "../../services/OperationService";
import EscaleService from "../../services/EscaleService";
import AuthService from "../../services/AuthService";

// StatCard component for displaying key metrics
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

// Component to display recent operations list
const RecentOperationsList = ({ operations }) => {
  const navigate = useNavigate();

  if (!operations || operations.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No recent operations found
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: "100%" }}>
      {operations.map((operation) => (
        <ListItem 
          key={operation.id} 
          button 
          onClick={() => navigate(`/operations/${operation.id}`)}
          sx={{
            borderRadius: 1,
            mb: 1,
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon>
            <WorkIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={operation.typeOperation || "Opération"} 
            secondary={`Date: ${new Date(operation.dateCreation).toLocaleDateString()}`} 
          />
          <Chip 
            size="small" 
            label={operation.status || "En cours"} 
            color={operation.status === "COMPLETED" ? "success" : "primary"} 
            variant="outlined"
          />
          <ArrowForwardIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
        </ListItem>
      ))}
    </List>
  );
};

// Component to display recent escales list
const RecentEscalesList = ({ escales }) => {
  const navigate = useNavigate();

  if (!escales || escales.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No recent vessel calls found
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: "100%" }}>
      {escales.map((escale) => (
        <ListItem 
          key={escale.id} 
          button 
          onClick={() => navigate(`/escale/${escale.id}`)}
          sx={{
            borderRadius: 1,
            mb: 1,
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon>
            <DirectionsBoatIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={escale.NOM_navire || "Navire"}
            secondary={`Arrivée: ${new Date(escale.DATE_accostage).toLocaleDateString()}`} 
          />
          <Chip 
            size="small" 
            label={escale.DATE_sortie ? "Terminée" : "En cours"} 
            color={escale.DATE_sortie ? "success" : "primary"} 
            variant="outlined"
          />
          <ArrowForwardIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
        </ListItem>
      ))}
    </List>
  );
};

// Main UserDashboard Component
const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [operations, setOperations] = useState([]);
  const [escales, setEscales] = useState([]);
  const [stats, setStats] = useState({
    completedOperations: null,
    pendingOperations: null,
    activeEscales: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch user data and statistics
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("email");
        
        // Get user details
        let user = { id: userId, name: userName, email: userEmail };
        try {
          const userResponse = await UserService.getUserById(userId);
          user = { ...user, ...userResponse.data };
        } catch (userErr) {
          console.error("Error fetching user details:", userErr);
          // Continue with the localStorage data
        }
        
        setUserData(user);
        
        // Get all operations with details
        const operationsResponse = await OperationService.getAllOperationsWithDetails();
        const allOperations = operationsResponse.data || [];
        
        // Get all escales
        const escalesResponse = await EscaleService.getAllEscales();
        const allEscales = escalesResponse.data || [];
        
        // Filter most recent operations (up to 5)
        const sortedOperations = [...allOperations].sort(
          (a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)
        );
        setOperations(sortedOperations.slice(0, 5));
        
        // Filter active escales (up to 5)
        const activeEscales = allEscales.filter(
          escale => !escale.DATE_sortie || new Date(escale.DATE_sortie) > new Date()
        );
        const sortedEscales = activeEscales.sort(
          (a, b) => new Date(b.DATE_accostage) - new Date(a.DATE_accostage)
        );
        setEscales(sortedEscales.slice(0, 5));
        
        // Calculate statistics
        const completedOps = allOperations.filter(op => op.status === "COMPLETED").length;
        const pendingOps = allOperations.filter(op => op.status !== "COMPLETED").length;
        const activeEscCount = activeEscales.length;
        
        setStats({
          completedOperations: completedOps,
          pendingOperations: pendingOps,
          activeEscales: activeEscCount,
        });
        
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center', borderLeft: '4px solid #f44336' }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            There was a problem loading the dashboard
          </Typography>
          <Typography color="textSecondary" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* User Welcome */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: 'primary.main', 
              color: 'white',
              mr: 2
            }}
          >
            {userData.nom?.charAt(0) || userData.email?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4">
              Bonjour, {userData.prenom || userData.nom || 'User'}
            </Typography>
            <Typography variant="body1">
              Welcome to your port operations dashboard
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Escales"
            value={stats.activeEscales}
            icon={<DirectionsBoatIcon />}
            color="#2196f3"
            onClick={() => navigate("/escales")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Operations"
            value={stats.pendingOperations}
            icon={<WorkIcon />}
            color="#ff9800"
            onClick={() => navigate("/operations")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed Operations"
            value={stats.completedOperations}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            onClick={() => navigate("/operations")}
          />
        </Grid>
      </Grid>

      {/* Tabs for Operations and Escales */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="dashboard tabs"
        >
          <Tab 
            icon={<WorkIcon />} 
            label="Recent Operations" 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<DirectionsBoatIcon />} 
            label="Active Escales" 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
        
        <Box p={3} role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {tabValue === 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Operations</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/operations')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <RecentOperationsList operations={operations} />
            </>
          )}
        </Box>
        
        <Box p={3} role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {tabValue === 1 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Active Escales</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/escales')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <RecentEscalesList escales={escales} />
            </>
          )}
        </Box>
      </Paper>

      {/* Quick Access Section */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Quick Access</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Card 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/operations')}
            >
              <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography>Operations</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/escales')}
            >
              <DirectionsBoatIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography>Escales</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/navires')}
            >
              <DirectionsBoatIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography>Navires</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Card 
              sx={{ 
                p: 2, 
                textAlign: 'center', 
                cursor: 'pointer', 
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/change-password')}
            >
              <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography>Account</Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserDashboard;
