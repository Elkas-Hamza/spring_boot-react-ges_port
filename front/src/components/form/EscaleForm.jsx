import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Autocomplete,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import EscaleService from "../../services/EscaleService";
import { NavireService } from "../../services/NavireService";

const EscaleForm = () => {
  const [escale, setEscale] = useState({
    nom_navire: "",
    navire: null,
    date_accostage: "",
    date_sortie: "",
  });

  const [navires, setNavires] = useState([]);
  const [selectedNavire, setSelectedNavire] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchNavires = async () => {
      try {
        setLoading(true);
        const response = await NavireService.getAllNavires();
        if (response.success) {
          setNavires(response.data);
        } else {
          console.error("Failed to fetch navires:", response.message);
          setNotification({
            open: true,
            message: "Impossible de charger la liste des navires",
            severity: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching navires:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des navires",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNavires();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchEscale = async () => {
        try {
          setLoading(true);
          const response = await EscaleService.getEscaleById(id);
          const escaleData = response.data;

          const escaleNavireId = escaleData.navire?.idNavire || "";
          
          // Find the full navire object for the autocomplete field
          const matchingNavire = escaleNavireId ? 
            navires.find(nav => nav.idNavire === escaleNavireId) || null : null;
            
          setSelectedNavire(matchingNavire);
          
          setEscale({
            nom_navire: escaleData.nom_navire,
            navire: escaleNavireId,
            date_accostage: formatDateForInput(escaleData.date_accostage),
            date_sortie: formatDateForInput(escaleData.date_sortie),
          });
        } catch (error) {
          console.error("Error fetching escale:", error);
          setNotification({
            open: true,
            message: "Failed to load escale data",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchEscale();
    }
  }, [id, navires]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEscale((prev) => ({ ...prev, [name]: value }));

    // If selecting a navire from dropdown, update the nom_navire field too
    if (name === "navire" && value) {
      const selectedNavire = navires.find(nav => nav.idNavire === value);
      if (selectedNavire) {
        setEscale(prev => ({ 
          ...prev, 
          nom_navire: selectedNavire.nomNavire 
        }));
      }
    }
  };

  const handleNavireChange = (event, newValue) => {
    if (newValue) {
      setSelectedNavire(newValue);
      setEscale(prev => ({ 
        ...prev, 
        navire: newValue.idNavire,
        nom_navire: newValue.nomNavire
      }));
    } else {
      setSelectedNavire(null);
      setEscale(prev => ({ 
        ...prev, 
        navire: "",
        nom_navire: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!escale.nom_navire || !escale.navire || !escale.date_accostage || !escale.date_sortie) {
      setNotification({
        open: true,
        message: "Tous les champs sont obligatoires",
        severity: "error",
      });
      return;
    }

    try {
      // Find the selected navire object
      const navireObj = navires.find(nav => nav.idNavire === escale.navire);
      
      if (!navireObj) {
        setNotification({
          open: true,
          message: "Navire introuvable. Veuillez sélectionner un navire valide.",
          severity: "error",
        });
        return;
      }
      
      // Format date in the exact way Spring Boot expects for LocalDateTime
      const formatDateForBackend = (dateStr) => {
        const date = new Date(dateStr);
        // Format as yyyy-MM-ddTHH:mm:ss (Spring Boot LocalDateTime format)
        return date.toISOString().split('.')[0]; // Remove milliseconds part
      };

      // Try creating another date format to fix the issue
      const isoDate1 = formatDateForBackend(escale.date_accostage);
      const isoDate2 = formatDateForBackend(escale.date_sortie);

      // Let's simplify the data structure to the bare minimum required for creating an escale
      const simplifiedEscaleData = {
        // Only include the necessary fields from the DB schema, no JPA entity references
        NOM_navire: navireObj.nomNavire,
        MATRICULE_navire: navireObj.matriculeNavire,
        // Try dates without time part to see if that helps
        DATE_accostage: isoDate1,
        DATE_sortie: isoDate2
      };
      
      // Debug information to help diagnose the issue
      setNotification({
        open: true,
        message: `Trying to create escale with: ${JSON.stringify(simplifiedEscaleData)}`,
        severity: "info",
      });
      
      console.log("Sending simplified escale data to server:", JSON.stringify(simplifiedEscaleData, null, 2));

      try {
        if (id) {
          await EscaleService.updateEscale(id, simplifiedEscaleData);
          setNotification({
            open: true,
            message: "Escale mise à jour avec succès",
            severity: "success",
          });
        } else {
          try {
            // Try the regular Axios method first
            await EscaleService.createEscale(simplifiedEscaleData);
            setNotification({
              open: true,
              message: "Escale créée avec succès",
              severity: "success",
            });
          } catch (axiosError) {
            console.log("Axios request failed, trying direct fetch API as fallback");
            // If that fails, try the direct fetch method
            const result = await EscaleService.createEscaleDirectFetch(simplifiedEscaleData);
            
            if (result.success) {
              setNotification({
                open: true,
                message: "Escale créée avec succès (via fetch fallback)",
                severity: "success",
              });
            } else {
              throw new Error(result.message || "Failed to create escale");
            }
          }
        }
        
        // Redirect after a short delay to show notification
        setTimeout(() => navigate("/escales"), 1000);
      } catch (error) {
        console.error("Error saving escale:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la sauvegarde";
        setNotification({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving escale:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la sauvegarde";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Escale" : "Créer Escale"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Autocomplete
          id="navire-autocomplete"
          options={navires}
          value={selectedNavire}
          onChange={handleNavireChange}
          getOptionLabel={(option) => `${option.matriculeNavire} - ${option.nomNavire}`}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Sélectionner un navire par matricule" 
              margin="normal"
              required
              fullWidth
            />
          )}
          isOptionEqualToValue={(option, value) => option.idNavire === value.idNavire}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {option.matriculeNavire}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.nomNavire}
                  </Typography>
                </Box>
              </li>
            );
          }}
        />

        <TextField
          label="Nom du navire"
          name="nom_navire"
          value={escale.nom_navire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={selectedNavire !== null} // Disable if navire is selected
        />

        <TextField
          label="Date d'accostage"
          name="date_accostage"
          type="datetime-local"
          value={escale.date_accostage}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />

        <TextField
          label="Date de sortie"
          name="date_sortie"
          type="datetime-local"
          value={escale.date_sortie}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Sauvegarder
          </Button>

          <Button component={Link} to="/escales" variant="outlined">
            Annuler
          </Button>
        </Box>
      </form>

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

export default EscaleForm;
