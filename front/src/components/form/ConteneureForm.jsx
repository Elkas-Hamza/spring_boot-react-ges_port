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
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ConteneureService from "../../services/ConteneureService";

const ConteneureForm = () => {
  const [conteneure, setConteneure] = useState({
    nom_conteneure: "",
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      // Fetch conteneure data if editing
      setLoading(true);
      ConteneureService.getConteneureById(id)
        .then((response) => {
          setConteneure(response.data);
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
    setConteneure((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!conteneure.nom_conteneure.trim()) {
      setNotification({
        open: true,
        message: "Le nom du conteneure est requis",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await ConteneureService.updateConteneure(id, conteneure);
        setNotification({
          open: true,
          message: "Conteneure modifié avec succès",
          severity: "success",
        });
      } else {
        await ConteneureService.createConteneure(conteneure);
        setNotification({
          open: true,
          message: "Conteneure ajouté avec succès",
          severity: "success",
        });
      }
      // Redirect after a short delay
      setTimeout(() => navigate("/conteneures"), 1500);
    } catch (error) {
      console.error("Error saving conteneure:", error);
      setNotification({
        open: true,
        message: "Erreur lors de l'enregistrement",
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
          {id ? "Modifier le Conteneure" : "Ajouter un Conteneure"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {id && (
            <TextField
              label="ID Conteneure"
              value={id}
              fullWidth
              margin="normal"
              disabled
            />
          )}

          <TextField
            name="nom_conteneure"
            label="Nom du Conteneure"
            value={conteneure.nom_conteneure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

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
