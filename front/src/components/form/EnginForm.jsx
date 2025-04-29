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
import EnginService from "../../services/EnginService";

const EnginForm = () => {
  const [engin, setEngin] = useState({
    nom_engin: "",
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
      // Fetch engin data if editing
      setLoading(true);
      EnginService.getEnginById(id)
        .then((response) => {
          setEngin(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching equipment:", error);
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
    setEngin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!engin.nom_engin.trim()) {
      setNotification({
        open: true,
        message: "Le nom de l'engin est requis",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await EnginService.updateEngin(id, engin);
        setNotification({
          open: true,
          message: "Engin modifié avec succès",
          severity: "success",
        });
      } else {
        await EnginService.createEngin(engin);
        setNotification({
          open: true,
          message: "Engin ajouté avec succès",
          severity: "success",
        });
      }
      // Redirect after a short delay
      setTimeout(() => navigate("/engins"), 1500);
    } catch (error) {
      console.error("Error saving equipment:", error);
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
          {id ? "Modifier l'Engin" : "Ajouter un Engin"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {id && (
            <TextField
              label="ID Engin"
              value={id}
              fullWidth
              margin="normal"
              disabled
            />
          )}

          <TextField
            name="nom_engin"
            label="Nom de l'Engin"
            value={engin.nom_engin}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/engins"
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

export default EnginForm;
