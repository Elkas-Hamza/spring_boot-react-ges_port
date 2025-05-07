import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from "@mui/material";
import { NavireService } from "../../services/NavireService";
import { ArrowBack, Edit } from "@mui/icons-material";

const NavireDetail = () => {
  const { id } = useParams();
  const [navire, setNavire] = useState(null);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await NavireService.getNavireById(id);
        
        if (response.success) {
          setNavire(response.data);
          
          // Parse container IDs from comma-separated string
          if (response.data.idConteneure) {
            setContainers(
              response.data.idConteneure
                .split(',')
                .map(c => c.trim())
                .filter(c => c)
            );
          }
        } else {
          setError("Erreur lors du chargement des données du navire");
        }
      } catch (err) {
        console.error("Error fetching navire:", err);
        setError("Erreur lors du chargement des données du navire. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError("ID de navire non valide");
      setLoading(false);
    }
  }, [id]);

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!navire) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Navire non trouvé
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Détails du Navire
      </Typography>

      {/* Navire Information Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informations du Navire
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>ID:</strong> {navire.idNavire}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Nom du navire:</strong> {navire.nomNavire}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Numéro d'immatriculation:</strong> {navire.matriculeNavire}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button 
                component={Link} 
                to={`/navires/edit/${navire.idNavire}`}
                variant="contained" 
                color="primary"
                startIcon={<Edit />}
                sx={{ mr: 1 }}
              >
                Modifier
              </Button>
              <Button 
                component={Link} 
                to="/navires" 
                startIcon={<ArrowBack />}
              >
                Retour à la liste
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Containers Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            Conteneurs 
            <Chip 
              label={`${containers.length}`} 
              color="primary" 
              size="small" 
              sx={{ ml: 1 }} 
            />
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {containers.length > 0 ? (
          <List>
            {containers.map((container, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={container}
                    secondary={`Conteneur ${index + 1}`}
                  />
                </ListItem>
                {index < containers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", py: 2 }}>
            Aucun conteneur associé à ce navire
          </Typography>
        )}
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NavireDetail; 