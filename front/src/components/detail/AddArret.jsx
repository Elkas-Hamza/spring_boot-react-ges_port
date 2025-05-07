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
  Snackbar
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import ArretService from "../../services/ArretService";
import EscaleService from "../../services/EscaleService";
import OperationService from "../../services/OperationService";

const AddArret = () => {
  const [arret, setArret] = useState({
    num_escale: "",
    id_operation: "",
    dure_arret: "",
    DATE_DEBUT_arret: "",
    DATE_FIN_arret: "",
    motif_arret: "",
    motif_arret_autre: "",
  });
  const [escales, setEscales] = useState([]);
  const [operations, setOperations] = useState([]);
  const [selectedEscaleDetails, setSelectedEscaleDetails] = useState(null);
  const [selectedOperationDetails, setSelectedOperationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { id: arretId, escaleId, operationId } = useParams(); // Get both arretId, escaleId, and operationId from URL
  const navigate = useNavigate();

  // Define predefined motifs options
  const motifOptions = [
    { value: "Panne mécanique", label: "Panne mécanique" },
    { value: "Maintenance préventive", label: "Maintenance préventive" },
    { value: "Maintenance corrective", label: "Maintenance corrective" },
    { value: "Intempéries", label: "Intempéries" },
    { value: "Problème logistique", label: "Problème logistique" },
    { value: "Défaut d'approvisionnement", label: "Défaut d'approvisionnement" },
    { value: "Problème administratif", label: "Problème administratif" },
    { value: "Grève", label: "Grève" },
    { value: "Autre", label: "Autre" }
  ];

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
          
          // Fetch operations for the selected escale
          if (escaleDetail) {
            fetchOperationsByEscale(escaleId);
          }
        }

        // If editing (arretId exists), fetch arret data
        if (arretId) {
          const arretResponse = await ArretService.getArretById(arretId);
          const arretData = arretResponse.data;
          
          // Check if motif starts with "Autre: "
          let motifArret = arretData.motif_arret || "";
          let motifArretAutre = "";
          
          if (motifArret.startsWith("Autre: ")) {
            motifArretAutre = motifArret.substring(7); // Remove "Autre: " prefix
            motifArret = "Autre";
          }

          setArret({
            num_escale: arretData.num_escale || "",
            id_operation: arretData.id_operation || "",
            dure_arret: arretData.dure_arret || "",
            DATE_DEBUT_arret: arretData.date_DEBUT_arret || arretData.DATE_DEBUT_arret || "",
            DATE_FIN_arret: arretData.date_FIN_arret || arretData.DATE_FIN_arret || "",
            motif_arret: motifArret,
            motif_arret_autre: motifArretAutre,
          });

          // Find and set the selected escale details
          const escaleDetail = escalesResponse.data.find(
            (e) =>
              String(e.num_escale || e.NUM_escale) ===
              String(arretData.num_escale)
          );
          setSelectedEscaleDetails(escaleDetail);
          
          // Set selected operation details if we have an operation ID
          if (arretData.id_operation) {
            fetchOperationDetails(arretData.id_operation);
          }
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

  // Handle operationId from URL or after operations are loaded
  useEffect(() => {
    if (operationId && operations.length > 0) {
      setArret((prev) => ({ ...prev, id_operation: operationId }));
      fetchOperationDetails(operationId);
    }
  }, [operationId, operations]);

  // Calculate duration in days when dates change
  useEffect(() => {
    if (arret.DATE_DEBUT_arret && arret.DATE_FIN_arret) {
      const startDate = new Date(arret.DATE_DEBUT_arret);
      const endDate = new Date(arret.DATE_FIN_arret);

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
  }, [arret.DATE_DEBUT_arret, arret.DATE_FIN_arret]);

  const fetchOperationsByEscale = (escaleId) => {
    setLoading(true);
    OperationService.getOperationsByEscaleId(escaleId)
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
          severity: "error"
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
          severity: "error"
        });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArret((prev) => ({ ...prev, [name]: value }));

    if (name === "num_escale") {
      const escaleDetail = escales.find(
        (e) => String(e.num_escale || e.NUM_escale) === String(value)
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
    setLoading(true);

    // Validate required fields
    if (
      !arret.num_escale ||
      !arret.DATE_DEBUT_arret ||
      !arret.DATE_FIN_arret ||
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
    const startDate = new Date(arret.DATE_DEBUT_arret);
    const endDate = new Date(arret.DATE_FIN_arret);
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
      // Format dates for backend
      const formatDateForBackend = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().replace('T', ' ').slice(0, 19);
      };

      const formattedData = {
        num_escale: arret.num_escale, // Send as string, not parseInt
        DATE_DEBUT_arret: formatDateForBackend(arret.DATE_DEBUT_arret),
        DATE_FIN_arret: formatDateForBackend(arret.DATE_FIN_arret),
        date_DEBUT_arret: arret.DATE_DEBUT_arret, // Keep original format too
        date_FIN_arret: arret.DATE_FIN_arret, // Keep original format too
        dure_arret: parseInt(arret.dure_arret) || 1,
        motif_arret: arret.motif_arret === "Autre" && arret.motif_arret_autre 
          ? `Autre: ${arret.motif_arret_autre}`
          : arret.motif_arret,
        id_operation: arret.id_operation || null,
      };

      console.log("Formatted data being sent to backend:", formattedData);

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
      setTimeout(() => {
        // If we came from operation details, redirect back there
        if (operationId) {
          navigate(`/operations/${operationId}`);
        } else {
          // Otherwise go to the escale details
          navigate(`/escale/${arret.num_escale}`);
        }
      }, 1000);
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

  // Function to determine operation status based on dates
  const determineOperationStatus = (operation) => {
    if (!operation || !operation.date_debut || !operation.date_fin) {
      return "En cours";
    }
    
    const now = new Date();
    const startDate = new Date(operation.date_debut);
    const endDate = new Date(operation.date_fin);
    
    if (startDate > now) {
      return "Planifié";
    } else if (endDate < now) {
      return "Terminé";
    } else {
      return operation.status || "En cours";
    }
  };
  
  // Get color for status chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'Planifié':
        return 'info';
      case 'En cours':
        return 'primary';
      case 'Terminé':
        return 'success';
      case 'En pause':
        return 'warning';
      case 'Annulé':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {arretId ? "Modifier Arrêt" : "Créer un Nouvel Arrêt"}
        </Typography>
        {(escaleId || operationId) && (
          <Typography variant="subtitle1" color="textSecondary" sx={{ mt: -1, mb: 1 }}>
            {escaleId && `Escale #${escaleId}`}
            {escaleId && operationId && " - "}
            {operationId && `Opération #${operationId}`}
          </Typography>
        )}
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
            disabled={loading || !!escaleId}
          >
            <MenuItem value="">
              <em>Sélectionnez une escale</em>
            </MenuItem>
            {escales.map((escale) => (
              <MenuItem
                key={escale.num_escale || escale.NUM_escale}
                value={escale.num_escale || escale.NUM_escale}
              >
                {escale.num_escale || escale.NUM_escale} - {escale.nom_navire || escale.NOM_navire}
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
            {operations.map((operation) => {
              const status = determineOperationStatus(operation);
              return (
                <MenuItem
                  key={operation.id_operation}
                  value={operation.id_operation}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ flexGrow: 1 }}>{operation.id_operation} - {operation.nom_operation || "Sans nom"}</span>
                    <Chip 
                      label={status} 
                      size="small" 
                      color={getStatusColor(status)}
                      style={{ marginLeft: '8px' }}
                    />
                  </div>
                </MenuItem>
              );
            })}
          </TextField>
          
          {/* Informations sur l'opération sélectionnée */}
          {selectedOperationDetails && (
            <Card variant="outlined" sx={{ background: "#f5f5f5", mt: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Détails de l'opération sélectionnée
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>ID:</strong> {selectedOperationDetails.id_operation}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nom:</strong> {selectedOperationDetails.nom_operation || "Non spécifié"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Équipe:</strong> {selectedOperationDetails.id_equipe}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          <strong>Statut:</strong>
                        </Typography>
                        <Chip 
                          label={determineOperationStatus(selectedOperationDetails)} 
                          size="small" 
                          color={getStatusColor(determineOperationStatus(selectedOperationDetails))}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Début:</strong> {formatDate(selectedOperationDetails.date_debut)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fin:</strong> {formatDate(selectedOperationDetails.date_fin)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {selectedOperationDetails.id_conteneure && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Conteneurs:</strong> 
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedOperationDetails.id_conteneure.split(',').map((id) => (
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
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedOperationDetails.id_engin.split(',').map((id) => (
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
                setArret(prev => ({ 
                  ...prev, 
                  motif_arret_autre: e.target.value,
                  motif_arret: e.target.value ? "Autre: " + e.target.value : "Autre"
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
              to={operationId ? `/operations/${operationId}` : "/arrets"} 
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
                  {arretId ? "Mise à jour..." : "Enregistrement..."}
                </>
              ) : (
                arretId ? "Mettre à jour" : "Enregistrer"
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

export default AddArret;
