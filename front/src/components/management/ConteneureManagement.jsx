import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { LocalShipping, Landscape, SwapHoriz } from "@mui/icons-material";
import { Link, useParams, useNavigate } from "react-router-dom";
import ConteneureService from "../../services/ConteneureService";
import { NavireService } from "../../services/NavireService";

const ConteneureManagement = () => {
  const { containerId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [portContainers, setPortContainers] = useState([]);
  const [shipContainers, setShipContainers] = useState([]);
  const [navires, setNavires] = useState([]);
  const [selectedShip, setSelectedShip] = useState("");
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch ships
        const navireResponse = await NavireService.getAllNavires();
        if (navireResponse.success) {
          setNavires(navireResponse.data);
          
          // If we have ships, select the first one by default
          if (navireResponse.data.length > 0) {
            setSelectedShip(navireResponse.data[0].idNavire);
          }
        }

        // Fetch port containers
        const portResponse = await ConteneureService.getPortContainers();
        setPortContainers(portResponse.data);

        // If a container ID is provided in URL, select it
        if (containerId) {
          const containerResponse = await ConteneureService.getConteneureById(containerId);
          if (containerResponse.data) {
            setSelectedContainer(containerResponse.data);
            
            // Switch to appropriate tab based on container location
            if (containerResponse.data.type_conteneure === 'NAVIRE') {
              setTabValue(1);
              // Select the ship that has this container
              if (containerResponse.data.navire) {
                setSelectedShip(containerResponse.data.navire.idNavire);
              }
            } else {
              setTabValue(0);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showNotification("Erreur lors du chargement des données", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [containerId]);

  // Fetch ship containers when selected ship changes
  useEffect(() => {
    const fetchShipContainers = async () => {
      if (!selectedShip) return;
      
      try {
        setLoading(true);
        const response = await ConteneureService.getShipContainers(selectedShip);
        setShipContainers(response.data);
      } catch (error) {
        console.error("Error fetching ship containers:", error);
        showNotification("Erreur lors du chargement des conteneurs du navire", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShipContainers();
  }, [selectedShip]);

  // Filter containers based on search query
  const filteredPortContainers = searchQuery
    ? portContainers.filter(c => 
        `${c.id_conteneure} ${c.nom_conteneure} ${c.typeConteneur ? c.typeConteneur.nomType : ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : portContainers;

  const filteredShipContainers = searchQuery
    ? shipContainers.filter(c => 
        `${c.id_conteneure} ${c.nom_conteneure} ${c.type_conteneure || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shipContainers;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleShipChange = (event) => {
    setSelectedShip(event.target.value);
  };

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Assign container to selected ship
  const handleAssignToShip = async (container) => {
    if (!selectedShip) {
      showNotification("Veuillez sélectionner un navire", "warning");
      return;
    }

    try {
      setLoading(true);
      await ConteneureService.assignContainerToShip(container.id_conteneure, selectedShip);
      
      // Update the lists
      const portResponse = await ConteneureService.getPortContainers();
      setPortContainers(portResponse.data);
      
      const shipResponse = await ConteneureService.getShipContainers(selectedShip);
      setShipContainers(shipResponse.data);
      
      showNotification(`Conteneur ${container.nom_conteneure} assigné au navire avec succès`);
    } catch (error) {
      console.error("Error assigning container to ship:", error);
      showNotification("Erreur lors de l'assignation du conteneur au navire", "error");
    } finally {
      setLoading(false);
    }
  };

  // Unassign container from ship to port
  const handleUnassignFromShip = async (container) => {
    try {
      setLoading(true);
      await ConteneureService.unassignContainerFromShip(container.id_conteneure);
      
      // Update the lists
      const portResponse = await ConteneureService.getPortContainers();
      setPortContainers(portResponse.data);
      
      if (selectedShip) {
        const shipResponse = await ConteneureService.getShipContainers(selectedShip);
        setShipContainers(shipResponse.data);
      }
      
      showNotification(`Conteneur ${container.nom_conteneure} déplacé vers le port avec succès`);
    } catch (error) {
      console.error("Error unassigning container from ship:", error);
      showNotification("Erreur lors du déplacement du conteneur vers le port", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderContainerCard = (container, isShipContainer = false) => {
    const isSelected = selectedContainer && selectedContainer.id_conteneure === container.id_conteneure;
    
    return (
      <Card 
        key={container.id_conteneure} 
        elevation={isSelected ? 6 : 1}
        sx={{ 
          m: 1, 
          borderLeft: isSelected ? '4px solid #2196f3' : 'none',
          backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.08)' : 'inherit'
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {container.nom_conteneure}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {container.id_conteneure}
          </Typography>
          {container.typeConteneur && (
            <Typography variant="body2" color="text.secondary">
              Type: {container.typeConteneur.nomType}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            <Chip 
              icon={isShipContainer ? <LocalShipping /> : <Landscape />} 
              label={isShipContainer ? "Navire" : "Port"}
              color={isShipContainer ? "primary" : "success"}
              size="small"
            />
            {container.dateAjout && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Ajouté le: {new Date(container.dateAjout).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </CardContent>
        <CardActions>
          {isShipContainer ? (
            <Button 
              color="primary" 
              variant="outlined" 
              size="small"
              startIcon={<Landscape />}
              onClick={() => handleUnassignFromShip(container)}
              disabled={loading}
            >
              Déplacer au port
            </Button>
          ) : (
            <Button 
              color="primary" 
              variant="outlined" 
              size="small"
              startIcon={<LocalShipping />}
              onClick={() => handleAssignToShip(container)}
              disabled={loading}
            >
              Charger au navire
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Conteneurs
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Déplacez les conteneurs entre le port et les navires
          </Typography>
        </Box>
        <Button component={Link} to="/conteneures" variant="outlined">
          Retour à la liste
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtres
            </Typography>
            <TextField
              fullWidth
              label="Rechercher des conteneurs"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="ship-select-label">Navire</InputLabel>
              <Select
                labelId="ship-select-label"
                value={selectedShip}
                onChange={handleShipChange}
                label="Navire"
                disabled={navires.length === 0}
              >
                {navires.map((navire) => (
                  <MenuItem key={navire.idNavire} value={navire.idNavire}>
                    {navire.nomNavire}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ mb: 2 }}
              variant="fullWidth"
            >
              <Tab 
                icon={<Landscape />} 
                label={`Conteneurs au Port (${filteredPortContainers.length})`} 
              />
              <Tab 
                icon={<LocalShipping />} 
                label={`Conteneurs sur Navire (${filteredShipContainers.length})`} 
                disabled={!selectedShip}
              />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <div>
                {tabValue === 0 && (
                  <>
                    {filteredPortContainers.length === 0 ? (
                      <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                        Aucun conteneur au port
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {filteredPortContainers.map((container) => renderContainerCard(container, false))}
                      </Box>
                    )}
                  </>
                )}

                {tabValue === 1 && (
                  <>
                    {filteredShipContainers.length === 0 ? (
                      <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                        Aucun conteneur sur ce navire
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {filteredShipContainers.map((container) => renderContainerCard(container, true))}
                      </Box>
                    )}
                  </>
                )}
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>

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
    </Box>
  );
};

export default ConteneureManagement; 