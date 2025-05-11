import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  FormHelperText,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ConteneureService from "../../services/ConteneureService";

const ConteneureForm = () => {
  const [conteneure, setConteneure] = useState({
    nom_conteneure: "",
    type_conteneure: "", // Changed from type_conteneur to type_conteneure to match backend
    id_type: 1, // Set to 1 for TERRE/port containers
    location: "TERRE", // Default to TERRE (port) location
  });

  // Predefined container types
  const conteneureTypes = [
    "20 pieds standard",
    "40 pieds standard",
    "40 pieds high cube",
    "Réfrigéré",
    "Open top",
    "Flat rack",
    "Tank",
    "Citerne",
    "Flexitank",
    "Autre",
  ];

  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    // Check admin permissions on component mount
    async function checkPermissions() {
      try {
        const authDetails = await ConteneureService.checkAdminPermissions();
        console.log("Admin permissions check:", authDetails);

        if (!authDetails.hasAdminAuthority) {
          setNotification({
            open: true,
            message:
              "Attention: Vous êtes connecté mais vous n'avez pas les permissions d'administrateur requises pour ajouter un conteneur.",
            severity: "warning",
          });
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
      }
    }

    if (!id) {
      // Only check on create form, not on edit
      checkPermissions();
    }

    // Rest of your existing effect code
    if (id) {
      // Fetch conteneure data if editing
      setLoading(true);
      ConteneureService.getConteneureById(id)
        .then((response) => {
          const data = response.data;
          // Update the form with correct values
          setConteneure({
            ...data,
            // For type_conteneure, use the actual name value
            type_conteneure: data.TYPE_conteneure || "", // Changed field name
            id_type: 2, // Always set to 2 as requested
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching conteneure:", error);
          setNotification({
            open: true,
            message: "Erreur lors du chargement des données",
            severity: "error",
          });
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for type_conteneure dropdown
    if (name === "type_conteneure") {
      // For index-based selection
      const selectedType = conteneureTypes[value - 1] || value;

      setConteneure((prev) => ({
        ...prev,
        type_conteneure: selectedType,
        id_type: 2, // Always set to 2 as requested
      }));
    } else {
      setConteneure((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!conteneure.nom_conteneure.trim()) {
      setNotification({
        open: true,
        message: "Le nom du conteneur est requis",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Get user role for better error messaging
      const userRole = localStorage.getItem("userRole");

      // Prepare data to send to backend - ensure proper field names and values
      const dataToSend = {
        nom_conteneure: conteneure.nom_conteneure,
        type_conteneure: conteneure.type_conteneure,
        id_type: 1,
        // Removed the location field as requested
      };

      console.log("Saving container data:", dataToSend);

      if (id) {
        await ConteneureService.updateConteneure(id, dataToSend);
        setNotification({
          open: true,
          message: "Conteneur modifié avec succès",
          severity: "success",
        });
        // Redirect after a short delay
        setTimeout(() => navigate("/conteneures"), 1500);
      } else {
        try {
          const result = await ConteneureService.createConteneure(dataToSend);
          console.log("Container created:", result);

          setNotification({
            open: true,
            message: "Conteneur ajouté avec succès",
            severity: "success",
          });

          // Redirect after a short delay
          setTimeout(() => navigate("/conteneures"), 1500);
        } catch (error) {
          console.error("Detailed container creation error:", error);

          // Check if it contains a specific 403 error message
          if (error.message && error.message.includes("Access forbidden")) {
            setNotification({
              open: true,
              message: `Erreur d'autorisation: ${error.message}`,
              severity: "error",
            });
          } else {
            // Handle general errors
            setNotification({
              open: true,
              message: `Erreur lors de l'ajout du conteneur: ${
                error.message || "Erreur inconnue"
              }`,
              severity: "error",
            });
          }
          // Don't redirect on error
        }
      }
    } catch (error) {
      console.error("Error saving conteneure:", error);
      setNotification({
        open: true,
        message: `Erreur lors de l'enregistrement: ${
          error.response?.data?.message || error.message || "Erreur inconnue"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {id ? "Modifier le Conteneur" : "Ajouter un Conteneur"}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {id && (
            <TextField
              label="ID Conteneur"
              value={id}
              fullWidth
              margin="normal"
              disabled
            />
          )}

          <TextField
            name="nom_conteneure"
            label="Nom du Conteneur"
            value={conteneure.nom_conteneure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          {/* Container type selection - changed field name */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="type-conteneure-label">
              Type de Conteneur
            </InputLabel>
            <Select
              labelId="type-conteneure-label"
              id="type_conteneure"
              name="type_conteneure"
              value={
                conteneure.type_conteneure
                  ? conteneureTypes.indexOf(conteneure.type_conteneure) + 1 ||
                    ""
                  : ""
              }
              onChange={handleChange}
              label="Type de Conteneur"
            >
              <MenuItem value="">
                <em>Sélectionnez un type</em>
              </MenuItem>
              {conteneureTypes.map((type, index) => (
                <MenuItem key={index} value={index + 1}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Sélectionnez le type physique du conteneur
            </FormHelperText>
          </FormControl>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/conteneures"
              variant="outlined"
              color="secondary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default ConteneureForm;
