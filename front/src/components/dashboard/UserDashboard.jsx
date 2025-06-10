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
  LocalShipping as LocalShippingIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Import services
import UserService from "../../services/UserService";
import OperationService from "../../services/OperationService";
import EscaleService from "../../services/EscaleService";
import AuthService from "../../services/AuthService";
import AnalyticsService from "../../services/AnalyticsService";
import ConteneureService from "../../services/ConteneureService";
import { NavireService } from "../../services/NavireService";

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
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          <ListItemIcon>
            <WorkIcon color="primary" />
          </ListItemIcon>{" "}
          <ListItemText
            primary={
              operation.type_operation || operation.typeOperation || "Opération"
            }
            secondary={`Date: ${new Date(
              operation.dateCreation || operation.date_debut
            ).toLocaleDateString()}`}
          />
          <Chip
            size="small"
            label={operation.realStatus || operation.status || "En cours"}
            color={
              operation.realStatus === "Terminé" ||
              operation.status === "COMPLETED"
                ? "success"
                : operation.realStatus === "Planifié"
                ? "info"
                : operation.realStatus === "En pause"
                ? "warning"
                : "primary"
            }
            variant="outlined"
          />
          <ArrowForwardIcon
            fontSize="small"
            sx={{ ml: 1, color: "text.secondary" }}
          />
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
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          <ListItemIcon>
            <DirectionsBoatIcon color="primary" />
          </ListItemIcon>{" "}
          <ListItemText
            primary={escale.NOM_navire || "Navire"}
            secondary={`Arrivée: ${new Date(
              escale.DATE_accostage
            ).toLocaleDateString()}`}
          />
          <Chip
            size="small"
            label={escale.DATE_sortie ? "Terminée" : "En cours"}
            color={escale.DATE_sortie ? "success" : "primary"}
            variant="outlined"
          />
          <ArrowForwardIcon
            fontSize="small"
            sx={{ ml: 1, color: "text.secondary" }}
          />
        </ListItem>
      ))}
    </List>
  );
};

// Component to display recent containers list
const RecentContainersList = ({ conteneurs }) => {
  const navigate = useNavigate();

  if (!conteneurs || conteneurs.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No recent containers found
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: "100%" }}>
      {conteneurs.map((conteneur) => (
        <ListItem
          key={conteneur.id || conteneur.numeroConteneur}
          button
          onClick={() =>
            navigate(
              `/conteneures/${conteneur.id || conteneur.numeroConteneur}`
            )
          }
          sx={{
            borderRadius: 1,
            mb: 1,
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          <ListItemIcon>
            <LocalShippingIcon color="primary" />
          </ListItemIcon>{" "}
          <ListItemText
            primary={conteneur.numeroConteneur || `Container ${conteneur.id}`}
            secondary={`Type: ${
              conteneur.typeConteneur || conteneur.id_type || "N/A"
            } | Lieu: ${conteneur.location || "Inconnu"}`}
          />
          <Chip
            size="small"
            label={conteneur.statut || "Active"}
            color={conteneur.statut === "Assigné" ? "success" : "primary"}
            variant="outlined"
          />
          <ArrowForwardIcon
            fontSize="small"
            sx={{ ml: 1, color: "text.secondary" }}
          />
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
  const [conteneurs, setConteneurs] = useState([]);
  const [navires, setNavires] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({
    completedOperations: null,
    pendingOperations: null,
    activeEscales: null,
    totalConteneurs: null,
    totalNavires: null,
    portContainers: null,
    assignedContainers: null,
    operationEfficiency: null,
    avgEscaleDuration: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "ADMIN";

  // Helper function to calculate operation efficiency
  const calculateOperationEfficiency = (operations) => {
    if (!operations || operations.length === 0) return 0;

    const now = new Date();
    const recentOperations = operations.filter((op) => {
      const opDate = new Date(op.date_debut || op.dateCreation);
      const daysDiff = (now - opDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30; // Last 30 days
    });

    if (recentOperations.length === 0) return 0;

    const completedRecent = recentOperations.filter(
      (op) => op.realStatus === "Terminé"
    ).length;
    return Math.round((completedRecent / recentOperations.length) * 100);
  };

  // Helper function to calculate average escale duration
  const calculateAverageEscaleDuration = (escales) => {
    if (!escales || escales.length === 0) return 0;

    const completedEscales = escales.filter((escale) => escale.DATE_sortie);
    if (completedEscales.length === 0) return 0;

    const totalDuration = completedEscales.reduce((total, escale) => {
      const arrival = new Date(escale.DATE_accostage);
      const departure = new Date(escale.DATE_sortie);
      const duration = (departure - arrival) / (1000 * 60 * 60); // hours
      return total + duration;
    }, 0);

    return Math.round(totalDuration / completedEscales.length);
  };
  // Fetch user data and statistics
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

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

        setUserData(user); // Fetch all data in parallel with enhanced error handling
        console.log("Starting to fetch dashboard data...");

        const dataPromises = [
          OperationService.getAllOperationsWithDetails()
            .then((res) => {
              console.log("Operations response:", res);
              return res;
            })
            .catch((err) => {
              console.error("Operations fetch error:", err);
              return { data: [] };
            }),
          EscaleService.getAllEscales()
            .then((res) => {
              console.log("Escales response:", res);
              return res;
            })
            .catch((err) => {
              console.error("Escales fetch error:", err);
              return { data: [] };
            }),
          ConteneureService.getAllConteneures()
            .then((res) => {
              console.log("Conteneurs response:", res);
              return res;
            })
            .catch((err) => {
              console.error("Conteneurs fetch error:", err);
              return { data: [] };
            }),
          NavireService.getAllNavires()
            .then((res) => {
              console.log("Navires response:", res);
              return res;
            })
            .catch((err) => {
              console.error("Navires fetch error:", err);
              return { data: [] };
            }),
          AnalyticsService.getSummaryData()
            .then((res) => {
              console.log("Analytics response:", res);
              return res;
            })
            .catch((err) => {
              console.error("Analytics fetch error:", err);
              return null;
            }),
        ];

        const [
          operationsResponse,
          escalesResponse,
          conteneursResponse,
          naviresResponse,
          analyticsData,
        ] = await Promise.all(dataPromises);

        const allOperations = operationsResponse.data || [];
        const allEscales = escalesResponse.data || [];
        const allConteneurs = conteneursResponse.data || [];
        const allNavires = naviresResponse.data || [];

        console.log("Processed data:", {
          operations: allOperations.length,
          escales: allEscales.length,
          conteneurs: allConteneurs.length,
          navires: allNavires.length,
        }); // Process operations with real business logic
        const processedOperations = allOperations.map((operation) => {
          // Determine real status based on dates
          const now = new Date();
          const startDate = operation.date_debut
            ? new Date(operation.date_debut)
            : null;
          const endDate = operation.date_fin
            ? new Date(operation.date_fin)
            : null;

          let realStatus = operation.status || "En cours";
          if (startDate && endDate) {
            if (startDate > now) {
              realStatus = "Planifié";
            } else if (endDate < now) {
              realStatus = "Terminé";
            } else {
              realStatus = "En cours";
            }
          }

          return {
            ...operation,
            realStatus,
            dateCreation: operation.date_debut || new Date().toISOString(),
          };
        });

        const sortedOperations = [...processedOperations].sort(
          (a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)
        );
        setOperations(sortedOperations.slice(0, 5));

        // Process escales with proper active filtering logic
        const currentDate = new Date();
        const activeEscales = allEscales.filter((escale) => {
          // An escale is active if:
          // 1. It has started (DATE_accostage <= now)
          // 2. It hasn't ended yet (no DATE_sortie or DATE_sortie > now)
          const accostageDate = escale.DATE_accostage
            ? new Date(escale.DATE_accostage)
            : null;
          const sortieDate = escale.DATE_sortie
            ? new Date(escale.DATE_sortie)
            : null;

          if (!accostageDate) return false;

          const hasStarted = accostageDate <= currentDate;
          const hasNotEnded = !sortieDate || sortieDate > currentDate;

          return hasStarted && hasNotEnded;
        });

        const sortedEscales = activeEscales.sort(
          (a, b) => new Date(b.DATE_accostage) - new Date(a.DATE_accostage)
        );
        setEscales(sortedEscales.slice(0, 5));

        // Process containers with location-based filtering
        const processedContainers = allConteneurs.map((container) => ({
          ...container,
          location:
            container.id_type === 1
              ? "TERRE"
              : container.id_type === 2
              ? "NAVIRE"
              : "UNKNOWN",
          statut: container.navire ? "Assigné" : "Disponible",
        }));

        // Sort by most recently added or updated
        const sortedContainers = processedContainers.sort((a, b) => {
          const dateA = a.dateAjout ? new Date(a.dateAjout) : new Date(0);
          const dateB = b.dateAjout ? new Date(b.dateAjout) : new Date(0);
          return dateB - dateA;
        });
        setConteneurs(sortedContainers.slice(0, 10));

        setNavires(allNavires);
        setAnalytics(analyticsData); // Calculate real statistics based on business logic
        const completedOps = processedOperations.filter(
          (op) => op.realStatus === "Terminé"
        ).length;
        const pendingOps = processedOperations.filter(
          (op) => op.realStatus === "En cours" || op.realStatus === "Planifié"
        ).length;
        const activeEscCount = activeEscales.length;
        // Calculate container distribution
        const portContainers = processedContainers.filter(
          (c) => c.location === "TERRE"
        ).length;
        const assignedContainers = processedContainers.filter(
          (c) => c.statut === "Assigné"
        ).length;

        // Calculate efficiency metrics
        const operationEfficiency =
          calculateOperationEfficiency(processedOperations);
        const avgEscaleDuration = calculateAverageEscaleDuration(allEscales);
        setStats({
          completedOperations: completedOps,
          pendingOperations: pendingOps,
          activeEscales: allEscales.length, // Show total escales instead of just active ones
          totalConteneurs: allConteneurs.length,
          totalNavires: allNavires.length,
          portContainers: portContainers,
          assignedContainers: assignedContainers,
          operationEfficiency: operationEfficiency,
          avgEscaleDuration: avgEscaleDuration,
        });
        console.log("Final stats set:", {
          completedOperations: completedOps,
          pendingOperations: pendingOps,
          activeEscales: allEscales.length, // Show total escales instead of just active ones
          totalConteneurs: allConteneurs.length,
          totalNavires: allNavires.length,
          portContainers: portContainers,
          assignedContainers: assignedContainers,
          operationEfficiency: operationEfficiency,
          avgEscaleDuration: avgEscaleDuration,
        });

        setLastUpdated(new Date());
        console.log("Dashboard data loading completed successfully");
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

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{ p: 3, textAlign: "center", borderLeft: "4px solid #f44336" }}
        >
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
      {" "}
      {/* User Welcome */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "primary.light",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "primary.main",
                color: "white",
                mr: 2,
              }}
            >
              {userData.nom?.charAt(0) || userData.email?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="h4">
                Bonjour, {userData.prenom || userData.nom || "User"}
              </Typography>
              <Typography variant="body1">
                Welcome to your port operations dashboard
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              color: "primary.contrastText",
              borderColor: "primary.contrastText",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "primary.contrastText",
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>{" "}
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {" "}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Escales"
            value={stats.activeEscales}
            icon={<DirectionsBoatIcon />}
            color="#2196f3"
            onClick={() => navigate("/escales")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Operations"
            value={stats.pendingOperations}
            icon={<WorkIcon />}
            color="#ff9800"
            onClick={() => navigate("/operations")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Operations"
            value={stats.completedOperations}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            onClick={() => navigate("/operations")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Containers"
            value={stats.totalConteneurs}
            icon={<LocalShippingIcon />}
            color="#9c27b0"
            onClick={() => navigate("/conteneures")}
          />
        </Grid>
      </Grid>
      {/* Efficiency metrics row - Admin only */}
      {isAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Operation Efficiency (30d)"
              value={
                stats.operationEfficiency !== null
                  ? `${stats.operationEfficiency}%`
                  : null
              }
              icon={<TrendingUpIcon />}
              color="#4caf50"
              onClick={() => navigate("/analytics")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Avg Escale Duration"
              value={
                stats.avgEscaleDuration !== null
                  ? `${stats.avgEscaleDuration}h`
                  : null
              }
              icon={<ScheduleIcon />}
              color="#ff5722"
              onClick={() => navigate("/analytics")}
            />
          </Grid>
        </Grid>
      )}
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
          />{" "}
          <Tab
            icon={<DirectionsBoatIcon />}
            label="Recent Escales"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab
            icon={<LocalShippingIcon />}
            label="Recent Containers"
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
        <Box
          p={3}
          role="tabpanel"
          hidden={tabValue !== 0}
          id="tabpanel-0"
          aria-labelledby="tab-0"
        >
          {tabValue === 0 && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Recent Operations</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/operations")}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <RecentOperationsList operations={operations} />
            </>
          )}
        </Box>{" "}
        <Box
          p={3}
          role="tabpanel"
          hidden={tabValue !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
        >
          {tabValue === 1 && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Active Escales</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/escales")}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <RecentEscalesList escales={escales} />
            </>
          )}
        </Box>
        <Box
          p={3}
          role="tabpanel"
          hidden={tabValue !== 2}
          id="tabpanel-2"
          aria-labelledby="tab-2"
        >
          {tabValue === 2 && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Recent Containers</Typography>{" "}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/conteneures")}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <RecentContainersList conteneurs={conteneurs} />
            </>
          )}{" "}
        </Box>
      </Paper>
      {/* Quick Access Section */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Access
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* Always available for both ADMIN and USER roles */}
          <Grid item xs={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate("/operations")}
            >
              <WorkIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography>Operations</Typography>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate("/escales")}
            >
              <DirectionsBoatIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography>Escales</Typography>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate("/conteneures")}
            >
              <LocalShippingIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography>Containers</Typography>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate("/navires")}
            >
              <DirectionsBoatIcon
                sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
              />
              <Typography>Vessels</Typography>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate("/equipes")}
            >
              <GroupIcon sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
              <Typography>Teams</Typography>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card
              sx={{
                p: 2,
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate("/change-password")}
            >
              <PersonIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography>Account</Typography>
            </Card>
          </Grid>

          {/* ADMIN-only quick access cards */}
          {isAdmin && (
            <>
              <Grid item xs={6} md={3}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => navigate("/analytics")}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                  />
                  <Typography>Analytics</Typography>
                </Card>
              </Grid>

              <Grid item xs={6} md={3}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => navigate("/monitoring")}
                >
                  <TimelineIcon
                    sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
                  />
                  <Typography>Monitoring</Typography>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserDashboard;
