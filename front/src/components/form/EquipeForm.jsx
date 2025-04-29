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
  CircularProgress
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import EquipeService from "../../services/EquipeService";

const EquipeForm = () => {
  const [equipe, setEquipe] = useState({
    nom_equipe: ""
  });
  
  const [loading, setLoading] = useState(false);
  
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      EquipeService.getEquipeById(id)
        .then(response => {
          setEquipe({
            nom_equipe: response.data.nom_equipe
          });
        })
        .catch(error => {
          console.error("Error fetching equipe:", error);
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

    if (!equipe.nom_equipe.trim()) {
      setNotification({
        open: true,
        message: "Le nom de l'équipe est requis",
        severity: "error",
      });
      return;
    }

    try {
      if (isEdit) {
        // In edit mode, update the equipe name
        await EquipeService.updateEquipe(id, { nom_equipe: equipe.nom_equipe });
        
        setNotification({
          open: true,
          message: "Équipe modifiée avec succès",
          severity: "success",
        });
        
        // Navigate back to details page after editing
        setTimeout(() => navigate(`/equipes/${id}`), 1000);
      } else {
        // In create mode, create a new equipe with just the name
        console.log("Creating equipe with name:", equipe.nom_equipe);
        const response = await EquipeService.createEquipe({ nom_equipe: equipe.nom_equipe });
        console.log("Equipe created:", response.data);
        const createdId = response.data.id_equipe;
        console.log("Created equipe ID:", createdId);
        
        setNotification({
          open: true,
          message: "Équipe créée avec succès",
          severity: "success",
        });
        
        // Navigate to the equipe list instead of directly to details
        setTimeout(() => {
          console.log("Navigating to equipe list after creation");
          navigate("/equipes");
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving equipe:", error);
      let errorMessage = "Erreur lors de l'enregistrement";
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage += ` (${error.response.status})`;
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
            <Button component={Link} to="/equipes" variant="outlined" color="secondary">
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EquipeForm; 