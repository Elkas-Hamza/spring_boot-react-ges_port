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
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Grid,
  Snackbar,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArretService from "../../services/ArretService";
import EscaleService from "../../services/EscaleService";
import OperationService from "../../services/OperationService";

const ArretForm = () => {
  const [arret, setArret] = useState({
    num_escale: "",
    id_operation: "",
    dure_arret: "",
    DATE_DEBUT_arret: "",
    DATE_FIN_arret: "",
    motif_arret: "",
  });
  const [escales, setEscales] = useState([]);
  const [operations, setOperations] = useState([]);
  const [selectedOperationDetails, setSelectedOperationDetails] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // Define predefined motifs options
  const motifOptions = [
    { value: "Panne mécanique", label: "Panne mécanique" },
    { value: "Maintenance préventive", label: "Maintenance préventive" },
    { value: "Maintenance corrective", label: "Maintenance corrective" },
    { value: "Intempéries", label: "Intempéries" },
    { value: "Problème logistique", label: "Problème logistique" },
    {
      value: "Défaut d'approvisionnement",
      label: "Défaut d'approvisionnement",
    },
    { value: "Problème administratif", label: "Problème administratif" },
    { value: "Grève", label: "Grève" },
    { value: "Autre", label: "Autre" },
  ];

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all available escale numbers
    EscaleService.getAllEscales()
      .then((response) => {
        setEscales(response.data);
      })
      .catch((error) => {
        console.error("Error fetching escales:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des escales",
          severity: "error",
        });
      });

    if (id) {
      // Fetch arret data if editing
      ArretService.getArretById(id)
        .then((response) => {
          setArret({
            num_escale: response.data.num_escale || "",
            id_operation: response.data.id_operation || "",
            dure_arret: response.data.dure_arret || "",
            DATE_DEBUT_arret:
              response.data.date_DEBUT_arret ||
              response.data.DATE_DEBUT_arret ||
              "",
            DATE_FIN_arret:
              response.data.date_FIN_arret ||
              response.data.DATE_FIN_arret ||
              "",
            motif_arret: response.data.motif_arret || "",
          });

          // Find and set the selected escale details
          if (response.data.num_escale) {
            const escaleDetail = escales.find(
              (e) => (e.num_escale || e.NUM_escale) === response.data.num_escale
            );
            setSelectedEscaleDetails(escaleDetail);
            // Fetch operations for the selected escale
            if (escaleDetail) {
              fetchOperationsByEscale(response.data.num_escale);
            }
          }

          // Set selected operation details if we have an operation ID
          if (response.data.id_operation) {
            fetchOperationDetails(response.data.id_operation);
          }
        })
        .catch((error) => {
          console.error("Error fetching arret:", error);
          setNotification({
            open: true,
            message: "Erreur lors du chargement des données de l'arrêt",
            severity: "error",
          });
        });
    }
  }, [id, escales.length]);

  useEffect(() => {
    // Calculate duration when dates change
    if (arret.DATE_DEBUT_arret && arret.DATE_FIN_arret) {
      try {
        const startDate = new Date(arret.DATE_DEBUT_arret);
        const endDate = new Date(arret.DATE_FIN_arret);

        if (endDate <= startDate) {
          setNotification({
            open: true,
            message: "La date de fin doit être postérieure à la date de début",
            severity: "error",
          });
          return;
        }

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setArret((prev) => ({ ...prev, dure_arret: diffDays }));
      } catch (error) {
        console.error("Error calculating duration:", error);
      }
    }
  }, [arret.DATE_DEBUT_arret, arret.DATE_FIN_arret]);

  const fetchOperationsByEscale = (escaleId) => {
    setLoading(true);
    // Fetch only operations with "En cours" status for creating arrests
    OperationService.getOperationsByEscaleIdAndStatus(escaleId, "En cours")
      .then((response) => {
        setOperations(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching operations:", error);
        setOperations([]);
        setLoading(false);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des opérations",
          severity: "error",
        });
      });
  };

  const fetchOperationDetails = (operationId) => {
    setLoading(true);
    OperationService.getOperationById(operationId)
      .then((response) => {
        setSelectedOperationDetails(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching operation details:", error);
        setSelectedOperationDetails(null);
        setLoading(false);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des détails de l'opération",
          severity: "error",
        });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArret((prev) => ({ ...prev, [name]: value }));

    if (name === "num_escale") {
      const escaleDetail = escales.find(
        (e) => (e.num_escale || e.NUM_escale) === value
      );
      setSelectedEscaleDetails(escaleDetail);
      setSelectedOperationDetails(null);
      setArret((prev) => ({ ...prev, id_operation: "" }));

      // Fetch operations for the selected escale
      if (escaleDetail) {
        fetchOperationsByEscale(value);
      }
    }

    if (name === "id_operation") {
      if (value) {
        fetchOperationDetails(value);
      } else {
        setSelectedOperationDetails(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !arret.num_escale ||
      !arret.DATE_DEBUT_arret ||
      !arret.DATE_FIN_arret ||
      !arret.motif_arret.trim()
    ) {
      setNotification({
        open: true,
        message: "Tous les champs obligatoires doivent être remplis",
        severity: "error",
      });
      return;
    }

    const startDate = new Date(arret.DATE_DEBUT_arret);
    const endDate = new Date(arret.DATE_FIN_arret);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setNotification({
        open: true,
        message: "Format de date invalide",
        severity: "error",
      });
      return;
    }

    if (endDate <= startDate) {
      setNotification({
        open: true,
        message: "La date de fin doit être postérieure à la date de début",
        severity: "error",
      });
      return;
    }

    const formattedData = {
      DATE_DEBUT_arret: formatDateForBackend(arret.DATE_DEBUT_arret),
      DATE_FIN_arret: formatDateForBackend(arret.DATE_FIN_arret),
      motif_arret: arret.motif_arret.trim(),
      dure_arret: parseInt(arret.dure_arret, 10),
      num_escale: arret.num_escale.trim(),
      id_operation: arret.id_operation || null,
    };

    console.log("Formatted data being sent to backend:", formattedData);

    try {
      setLoading(true);
      if (id !== undefined) {
        await ArretService.updateArret(id, formattedData);
        setNotification({
          open: true,
          message: "Arrêt modifié avec succès",
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
      // Redirect after a short delay
      setTimeout(() => navigate("/arrets"), 1000);
    } catch (error) {
      setLoading(false);
      console.error("Error saving arret:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        setNotification({
          open: true,
          message: `Erreur: ${
            error.response.data.message || "Requête invalide"
          }`,
          severity: "error",
        });
      } else {
        setNotification({
          open: true,
          message: "Erreur lors de l'enregistrement. Veuillez réessayer.",
          severity: "error",
        });
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace("T", " ").substring(0, 19); // Format as "yyyy-MM-dd HH:mm:ss"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading && !id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {id ? "Modifier Arrêt" : "Créer Arrêt"}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            select
            label="Escale"
            name="num_escale"
            value={arret.num_escale || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          >
            <MenuItem value="">
              <em>Sélectionnez une escale</em>
            </MenuItem>
            {escales.map((escale) => (
              <MenuItem
                key={escale.num_escale || escale.NUM_escale}
                value={escale.num_escale || escale.NUM_escale}
              >
                {escale.num_escale || escale.NUM_escale} -{" "}
                {escale.nom_navire || escale.NOM_navire}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Opération liée"
            name="id_operation"
            value={arret.id_operation || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!arret.num_escale || loading}
          >
            <MenuItem value="">
              <em>Aucune opération</em>
            </MenuItem>
            {operations.map((operation) => (
              <MenuItem
                key={operation.id_operation}
                value={operation.id_operation}
              >
                {operation.id_operation} -{" "}
                {operation.type_operation || "Sans nom"}
              </MenuItem>
            ))}
          </TextField>

          {/* Informations sur l'opération sélectionnée */}
          {selectedOperationDetails && (
            <Card
              variant="outlined"
              sx={{ background: "#f5f5f5", mt: 3, mb: 3 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Détails de l'opération sélectionnée
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>ID:</strong>{" "}
                        {selectedOperationDetails.id_operation}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nom:</strong>{" "}
                        {selectedOperationDetails.type_operation ||
                          "Non spécifié"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Équipe:</strong>{" "}
                        {selectedOperationDetails.id_equipe}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>Début:</strong>{" "}
                        {formatDate(selectedOperationDetails.date_debut)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fin:</strong>{" "}
                        {formatDate(selectedOperationDetails.date_fin)}
                      </Typography>
                    </Box>
                  </Grid>

                  {selectedOperationDetails.id_conteneure && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Conteneurs:</strong>
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {selectedOperationDetails.id_conteneure
                          .split(",")
                          .map((id) => (
                            <Chip
                              key={id}
                              label={id.trim()}
                              size="small"
                              color="primary"
                              sx={{ mb: 1 }}
                            />
                          ))}
                      </Stack>
                    </Grid>
                  )}

                  {selectedOperationDetails.id_engin && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Engins:</strong>
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {selectedOperationDetails.id_engin
                          .split(",")
                          .map((id) => (
                            <Chip
                              key={id}
                              label={id.trim()}
                              size="small"
                              color="secondary"
                              sx={{ mb: 1 }}
                            />
                          ))}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Détails de l'arrêt
          </Typography>

          <TextField
            label="Date/Heure de début"
            name="DATE_DEBUT_arret"
            type="datetime-local"
            value={arret.DATE_DEBUT_arret || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
            disabled={loading}
          />

          <TextField
            label="Date/Heure de fin"
            name="DATE_FIN_arret"
            type="datetime-local"
            value={arret.DATE_FIN_arret || ""}
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
            value={arret.dure_arret || ""}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            disabled={true}
            helperText="Calculée automatiquement à partir des dates"
          />

          <FormControl fullWidth margin="normal" required disabled={loading}>
            <InputLabel id="motif-arret-label">Motif d'arrêt</InputLabel>
            <Select
              labelId="motif-arret-label"
              name="motif_arret"
              value={arret.motif_arret || ""}
              onChange={handleChange}
              label="Motif d'arrêt"
            >
              <MenuItem value="">
                <em>Sélectionnez un motif</em>
              </MenuItem>
              {motifOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {arret.motif_arret === "Autre" && (
            <TextField
              label="Préciser le motif"
              name="motif_arret_autre"
              value={arret.motif_arret_autre || ""}
              onChange={(e) => {
                setArret((prev) => ({
                  ...prev,
                  motif_arret_autre: e.target.value,
                  motif_arret: e.target.value
                    ? "Autre: " + e.target.value
                    : "Autre",
                }));
              }}
              fullWidth
              margin="normal"
              required
              disabled={loading}
              placeholder="Veuillez préciser le motif de l'arrêt..."
            />
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/arrets"
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
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  {id ? "Mise à jour..." : "Enregistrement..."}
                </>
              ) : id ? (
                "Mettre à jour"
              ) : (
                "Enregistrer"
              )}
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

// If setSelectedEscaleDetails is not defined, define it as a no-op to avoid errors
if (typeof setSelectedEscaleDetails === "undefined") {
  // eslint-disable-next-line no-unused-vars
  var setSelectedEscaleDetails = () => {};
}

export default ArretForm;
