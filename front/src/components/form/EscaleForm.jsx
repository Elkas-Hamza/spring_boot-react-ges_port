import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import EscaleService from "../../services/EscaleService";

const EscaleForm = () => {
  const [escale, setEscale] = useState({
    nom_navire: "",
    date_accostage: "",
    date_sortie: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id) {
      const fetchEscale = async () => {
        try {
          const response = await EscaleService.getEscaleById(id);
          const escaleData = response.data;

          setEscale({
            nom_navire: escaleData.nom_navire,
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
        }
      };

      fetchEscale();
    }
  }, [id]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!escale.nom_navire || !escale.date_accostage || !escale.date_sortie) {
      setNotification({
        open: true,
        message: "Tous les champs sont obligatoires",
        severity: "error",
      });
      return;
    }

    try {
      const escaleData = {
        nom_navire: escale.nom_navire,
        date_accostage: new Date(escale.date_accostage).toISOString(),
        date_sortie: new Date(escale.date_sortie).toISOString(),
      };

      if (id) {
        await EscaleService.updateEscale(id, escaleData);
        setNotification({
          open: true,
          message: "Escale mise à jour avec succès",
          severity: "success",
        });
      } else {
        await EscaleService.createEscale(escaleData);
        setNotification({
          open: true,
          message: "Escale créée avec succès",
          severity: "success",
        });
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
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        {id ? "Modifier Escale" : "Créer Escale"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom du navire"
          name="nom_navire"
          value={escale.nom_navire}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Sauvegarder
        </Button>

        <Button component={Link} to="/escales" sx={{ ml: 2, mt: 2 }}>
          Annuler
        </Button>
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
