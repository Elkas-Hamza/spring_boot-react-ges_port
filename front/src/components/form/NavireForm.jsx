import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { NavireService } from "../../services/NavireService";

const NavireForm = () => {
  const [navire, setNavire] = useState({
    nomNavire: "",
    matriculeNavire: "",
    idConteneure: "",
  });

  // New state for container management
  const [containerInput, setContainerInput] = useState("");
  const [containers, setContainers] = useState([]);
  const [editingContainer, setEditingContainer] = useState(null);
  const [editContainerValue, setEditContainerValue] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      const fetchNavire = async () => {
        try {
          setLoading(true);
          const response = await NavireService.getNavireById(id);
          
          if (response.success) {
            const navireData = response.data;
            setNavire({
              nomNavire: navireData.nomNavire || "",
              matriculeNavire: navireData.matriculeNavire || "",
              idConteneure: navireData.idConteneure || "",
            });
            
            // Initialize containers list from comma-separated string
            if (navireData.idConteneure) {
              setContainers(navireData.idConteneure.split(',').map(c => c.trim()).filter(c => c));
            }
          } else {
            setNotification({
              open: true,
              message: "Échec du chargement des données du navire",
              severity: "error",
            });
          }
        } catch (error) {
          console.error("Error fetching navire:", error);
          setNotification({
            open: true,
            message: "Échec du chargement des données du navire",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchNavire();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNavire((prev) => ({ ...prev, [name]: value }));
  };

  // Container management functions
  const handleAddContainer = () => {
    if (!containerInput.trim()) return;
    
    if (!containers.includes(containerInput.trim())) {
      const newContainers = [...containers, containerInput.trim()];
      setContainers(newContainers);
      // Update the navire object with the comma-separated string
      setNavire(prev => ({
        ...prev,
        idConteneure: newContainers.join(', ')
      }));
      setContainerInput("");
    } else {
      setNotification({
        open: true,
        message: "Ce conteneur existe déjà dans la liste",
        severity: "warning",
      });
    }
  };

  const handleDeleteContainer = (container) => {
    const newContainers = containers.filter(c => c !== container);
    setContainers(newContainers);
    // Update the navire object with the comma-separated string
    setNavire(prev => ({
      ...prev,
      idConteneure: newContainers.join(', ')
    }));
  };

  const handleEditContainer = (container) => {
    setEditingContainer(container);
    setEditContainerValue(container);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingContainer(null);
    setEditContainerValue("");
  };

  const handleSaveEditContainer = () => {
    if (!editContainerValue.trim()) {
      setNotification({
        open: true,
        message: "Le conteneur ne peut pas être vide",
        severity: "error",
      });
      return;
    }

    if (containers.includes(editContainerValue.trim()) && editContainerValue.trim() !== editingContainer) {
      setNotification({
        open: true,
        message: "Ce conteneur existe déjà dans la liste",
        severity: "warning",
      });
      return;
    }

    const newContainers = containers.map(c => 
      c === editingContainer ? editContainerValue.trim() : c
    );
    setContainers(newContainers);
    
    // Update the navire object with the comma-separated string
    setNavire(prev => ({
      ...prev,
      idConteneure: newContainers.join(', ')
    }));
    
    handleCloseEditDialog();
  };

  const handleContainerInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddContainer();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!navire.nomNavire || !navire.matriculeNavire) {
      setNotification({
        open: true,
        message: "Le nom du navire et le numéro d'immatriculation sont obligatoires",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      let response;

      if (id) {
        // Update existing navire
        response = await NavireService.updateNavire(id, navire);
      } else {
        // Create new navire - don't send ID for creation
        const navireData = {
          nomNavire: navire.nomNavire,
          matriculeNavire: navire.matriculeNavire,
          idConteneure: navire.idConteneure
        };
        
        response = await NavireService.createNavire(navireData);
      }

      if (response.success) {
        setNotification({
          open: true,
          message: `Navire ${id ? 'modifié' : 'créé'} avec succès`,
          severity: "success",
        });
        
        // Redirect after a short delay to show notification
        setTimeout(() => navigate("/navires"), 1000);
      } else {
        setNotification({
          open: true,
          message: response.message || `Échec de ${id ? 'la modification' : 'la création'} du navire`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving navire:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Échec de ${id ? 'la modification' : 'la création'} du navire`;
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (loading && id) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Navire" : "Créer Navire"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom du navire"
          name="nomNavire"
          value={navire.nomNavire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Numéro d'immatriculation"
          name="matriculeNavire"
          value={navire.matriculeNavire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Conteneurs
          </Typography>
          
          {/* Container input with Add button */}
          <TextField
            label="Ajouter un conteneur"
            value={containerInput}
            onChange={(e) => setContainerInput(e.target.value)}
            onKeyDown={handleContainerInputKeyDown}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    edge="end" 
                    onClick={handleAddContainer}
                    disabled={!containerInput.trim()}
                  >
                    <Add />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* Containers list */}
          {containers.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2, mb: 2 }}>
              <List>
                {containers.map((container, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => handleEditContainer(container)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteContainer(container)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText primary={container} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          
          {/* Chip display of container count */}
          {containers.length > 0 && (
            <Chip 
              label={`${containers.length} conteneur${containers.length > 1 ? 's' : ''}`} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sauvegarder'}
        </Button>

        <Button 
          component={Link} 
          to="/navires" 
          sx={{ ml: 2, mt: 2 }}
        >
          Annuler
        </Button>
      </form>

      {/* Container Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Modifier Conteneur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ID du conteneur"
            type="text"
            fullWidth
            value={editContainerValue}
            onChange={(e) => setEditContainerValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSaveEditContainer} color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NavireForm; 