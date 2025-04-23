import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import ArretService from "../../services/ArretService";
import EscaleService from "../../services/EscaleService";

const ArretForm = () => {
  const [arret, setArret] = useState({
    num_escale: "",
    dure_arret: "",
    date_DEBUT_arret: "",
    date_FIN_arret: "",
    motif_arret: "",
  });
  const [escales, setEscales] = useState([]);
  const [selectedEscaleDetails, setSelectedEscaleDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { id: arretId, escaleId } = useParams(); // Get both arretId and escaleId from URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all available escales
        const escalesResponse = await EscaleService.getAllEscales();
        setEscales(escalesResponse.data);

        // If escaleId is provided in URL, set it as the default value
        if (escaleId) {
          setArret((prev) => ({ ...prev, num_escale: escaleId }));

          // Find and set the selected escale details
          const escaleDetail = escalesResponse.data.find(
            (e) => String(e.num_escale || e.NUM_escale) === String(escaleId)
          );
          setSelectedEscaleDetails(escaleDetail);
        }

        // If editing (arretId exists), fetch arret data
        if (arretId) {
          const arretResponse = await ArretService.getArretById(arretId);
          const arretData = arretResponse.data;

          setArret({
            num_escale: arretData.num_escale || "",
            dure_arret: arretData.dure_arret || "",
            date_DEBUT_arret: arretData.date_DEBUT_arret || "",
            date_FIN_arret: arretData.date_FIN_arret || "",
            motif_arret: arretData.motif_arret || "",
          });

          // Find and set the selected escale details
          const escaleDetail = escalesResponse.data.find(
            (e) =>
              String(e.num_escale || e.NUM_escale) ===
              String(arretData.num_escale)
          );
          setSelectedEscaleDetails(escaleDetail);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [arretId, escaleId]);

  // Calculate duration in days when dates change
  useEffect(() => {
    if (arret.date_DEBUT_arret && arret.date_FIN_arret) {
      const startDate = new Date(arret.date_DEBUT_arret);
      const endDate = new Date(arret.date_FIN_arret);

      // Validate that end date is after start date
      if (endDate <= startDate) {
        setError("La date de fin doit être après la date de début");
        return;
      }

      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setArret((prev) => ({ ...prev, dure_arret: diffDays }));
      setError(null);
    }
  }, [arret.date_DEBUT_arret, arret.date_FIN_arret]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArret((prev) => ({ ...prev, [name]: value }));

    // If escale number changes, update the selected escale details
    if (name === "num_escale") {
      const escaleDetail = escales.find(
        (e) => String(e.num_escale || e.NUM_escale) === String(value)
      );
      setSelectedEscaleDetails(escaleDetail);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (
      !arret.num_escale ||
      !arret.date_DEBUT_arret ||
      !arret.date_FIN_arret ||
      !arret.motif_arret
    ) {
      setNotification({
        open: true,
        message: "Tous les champs sont obligatoires",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    // Validate dates
    const startDate = new Date(arret.date_DEBUT_arret);
    const endDate = new Date(arret.date_FIN_arret);
    if (endDate <= startDate) {
      setNotification({
        open: true,
        message: "La date de fin doit être après la date de début",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const formattedData = {
        num_escale: parseInt(arret.num_escale),
        date_DEBUT_arret: arret.date_DEBUT_arret,
        date_FIN_arret: arret.date_FIN_arret,
        dure_arret: parseInt(arret.dure_arret) || 1,
        motif_arret: arret.motif_arret,
      };

      if (arretId) {
        await ArretService.updateArret(arretId, formattedData);
        setNotification({
          open: true,
          message: "Arrêt mis à jour avec succès",
          severity: "success",
        });
      } else {
        await ArretService.createArret(formattedData);
        setNotification({
          open: true,
          message: "Arrêt créé avec succès",
          severity: "success",
        });
      }

      // Redirect after a short delay to show notification
      setTimeout(() => navigate("/arret"), 1000);
    } catch (err) {
      console.error("Error saving arrêt:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Erreur lors de la sauvegarde",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Date invalide";
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {arretId ? "Modifier Arrêt" : "Créer un Nouvel Arrêt"}
          {escaleId && ` pour l'escale #${escaleId}`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="escale-select-label">Numéro d'escale</InputLabel>
          <Select
            labelId="escale-select-label"
            name="num_escale"
            value={arret.num_escale || ""}
            onChange={handleChange}
            label="Numéro d'escale"
            disabled={!!escaleId || loading} // Disable if escaleId is provided or loading
          >
            {escales.map((escale) => (
              <MenuItem
                key={escale.num_escale || escale.NUM_escale}
                value={escale.num_escale || escale.NUM_escale}
              >
                {escale.num_escale || escale.NUM_escale}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Display selected escale details */}
        {selectedEscaleDetails && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Détails de l'escale sélectionnée:
            </Typography>
            <Typography variant="body2">
              Nom du navire:{" "}
              {selectedEscaleDetails.nom_navire ||
                selectedEscaleDetails.NOM_navire}
            </Typography>
            <Typography variant="body2">
              Date d'accostage:{" "}
              {formatDate(
                selectedEscaleDetails.date_accostage ||
                  selectedEscaleDetails.DATE_accostage
              )}
            </Typography>
            <Typography variant="body2">
              Date de sortie:{" "}
              {formatDate(
                selectedEscaleDetails.date_sortie ||
                  selectedEscaleDetails.DATE_sortie
              )}
            </Typography>
          </Box>
        )}

        <TextField
          label="Date Début"
          name="date_DEBUT_arret"
          type="datetime-local"
          value={arret.date_DEBUT_arret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          disabled={loading}
        />
        <TextField
          label="Date Fin"
          name="date_FIN_arret"
          type="datetime-local"
          value={arret.date_FIN_arret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          disabled={loading}
        />
        <TextField
          label="Durée (jours)"
          name="dure_arret"
          type="number"
          value={arret.dure_arret}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
          disabled={loading}
        />
        <TextField
          label="Motif d'arrêt"
          name="motif_arret"
          value={arret.motif_arret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          {loading ? "Enregistrement..." : "Sauvegarder"}
        </Button>
        <Button
          component={Link}
          to="/escales"
          sx={{ marginLeft: 2 }}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
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
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ArretForm;
