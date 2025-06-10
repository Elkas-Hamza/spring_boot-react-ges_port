import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import EquipeService from "../../services/EquipeService";

const EquipeForm = () => {
  const [equipe, setEquipe] = useState({
    nom_equipe: "",
  });

  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("No actions taken yet");

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Add logging on component mount
  useEffect(() => {
    console.log("EquipeForm mounted with params:", { id });
    console.log("Current auth:", {
      token: localStorage.getItem("token") ? "Present" : "Missing",
      role: localStorage.getItem("userRole"),
    });

    // Check and clear the redirect flag
    const isRedirectingFromList =
      localStorage.getItem("redirecting_to_create_equipe") === "true";
    if (isRedirectingFromList) {
      console.log("Detected redirect from list - clearing flag");
      localStorage.removeItem("redirecting_to_create_equipe");
      setDebugInfo(
        `Form loaded via direct navigation. Mode: ${isEdit ? "Edit" : "Create"}`
      );
    } else {
      setDebugInfo(`Form loaded. Mode: ${isEdit ? "Edit" : "Create"}`);
    }

    if (isEdit) {
      setLoading(true);
      EquipeService.getEquipeById(id)
        .then((response) => {
          setEquipe({
            nom_equipe: response.data.nom_equipe,
          });
          setDebugInfo(
            (prev) =>
              `${prev}\nLoaded equipe data: ${JSON.stringify(response.data)}`
          );
        })
        .catch((error) => {
          console.error("Error fetching equipe:", error);
          setDebugInfo((prev) => `${prev}\nFetch error: ${error.message}`);
          setNotification({
            open: true,
            message: "Erreur lors du chargement de l'équipe",
            severity: "error",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipe((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugInfo(
      (prev) => `${prev}\nSubmit initiated - payload: ${JSON.stringify(equipe)}`
    );

    if (!equipe.nom_equipe.trim()) {
      setNotification({
        open: true,
        message: "Le nom de l'équipe est requis",
        severity: "error",
      });
      setDebugInfo((prev) => `${prev}\nValidation error: Empty equipe name`);
      return;
    }

    try {
      if (isEdit) {
        // In edit mode, update the equipe name
        setDebugInfo((prev) => `${prev}\nAttempting to update equipe ${id}`);
        await EquipeService.updateEquipe(id, { nom_equipe: equipe.nom_equipe });
        setDebugInfo((prev) => `${prev}\nUpdate successful`);

        setNotification({
          open: true,
          message: "Équipe modifiée avec succès",
          severity: "success",
        });

        // Navigate back to details page after editing
        setDebugInfo(
          (prev) => `${prev}\nPreparing navigation to /equipes/${id}`
        );
        setTimeout(() => {
          console.log(`Navigating to equipe details: /equipes/${id}`);
          // Use direct location change to avoid React Router issues
          window.location.href = `/equipe/${id}`;
        }, 1500);
      } else {
        // In create mode, create a new equipe with just the name
        console.log("Creating equipe with name:", equipe.nom_equipe);
        setDebugInfo(
          (prev) =>
            `${prev}\nAttempting to create equipe with name: ${equipe.nom_equipe}`
        );
        const response = await EquipeService.createEquipe({
          nom_equipe: equipe.nom_equipe,
        });

        console.log("Equipe created:", response.data);
        const createdId = response.data.id_equipe;
        console.log("Created equipe ID:", createdId);
        setDebugInfo(
          (prev) => `${prev}\nCreation successful - New ID: ${createdId}`
        );

        setNotification({
          open: true,
          message: "Équipe créée avec succès",
          severity: "success",
        }); // Redirect to equipe details page instead of the list
        setDebugInfo(
          (prev) => `${prev}\nPreparing navigation to /equipe/${createdId}`
        );
        setTimeout(() => {
          console.log(`Navigating to equipe details: /equipe/${createdId}`);
          // Force direct location change to the details page of the newly created equipe
          window.location.href = `/equipe/${createdId}`;
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving equipe:", error);
      setDebugInfo((prev) => `${prev}\nError saving: ${error.message}`);

      let errorMessage = "Erreur lors de l'enregistrement";
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage += ` (${error.response.status})`;
        setDebugInfo(
          (prev) => `${prev}\nResponse status: ${error.response.status}`
        );
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEdit ? "Modifier Équipe" : "Créer Équipe"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Nom de l'équipe"
            name="nom_equipe"
            value={equipe.nom_equipe}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => (window.location.href = "/equipes")}
              variant="outlined"
              color="secondary"
            >
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </Box>
        </Box>

        
      </Paper>

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

export default EquipeForm;
