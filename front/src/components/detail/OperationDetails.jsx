import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import OperationService from "../../services/OperationService";
import PersonnelService from "../../services/PersonnelService";
import SoustraiteureService from "../../services/SoustraiteureService";
import EnginService from "../../services/EnginService";
import ConteneureService from "../../services/ConteneureService";
import EscaleService from "../../services/EscaleService";
import ShiftService from "../../services/ShiftService";
import ArretService from "../../services/ArretService";

const OperationDetails = () => {
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [escale, setEscale] = useState(null);
  const [shift, setShift] = useState(null);
  const [engin, setEngin] = useState(null);
  const [engins, setEngins] = useState([]);
  const [conteneure, setConteneure] = useState(null);
  const [conteneurs, setConteneurs] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [soustraiteurs, setSoustraiteurs] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeArrets, setActiveArrets] = useState([]);
  const [displayStatus, setDisplayStatus] = useState("");
  const operationRef = useRef(null);
  const hasCheckedArretsRef = useRef(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // Fetching all engins and conteneurs
  useEffect(() => {
    // Fetch all engins using EnginService
    EnginService.getAllEngins()
      .then((response) => {
        setEngins(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching all engins:", error);
        // Don't show error notification for 403 errors, just use empty array
        setEngins([]);
      });

    // Fetch all conteneurs using ConteneureService
    ConteneureService.getAllConteneures()
      .then((response) => {
        setConteneurs(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching all conteneurs:", error);
        // Don't show error notification for 403 errors, just use empty array
        setConteneurs([]);
      });
  }, []);

  // Fetching operation data
  const fetchOperation = useCallback(async () => {
    try {
      // Try regular operation endpoint first
      const response = await OperationService.getOperationById(id);
      if (response.data) {
        setOperation(response.data);
        operationRef.current = response.data;

        // Try to get additional shift name data separately
        try {
          const shiftResponse = await ShiftService.getShiftById(
            response.data.id_shift
          );
          if (shiftResponse.data && shiftResponse.data.nom_shift) {
            // Merge the shift name into our operation data
            setOperation((prev) => ({
              ...prev,
              nom_shift: shiftResponse.data.nom_shift,
            }));
          }
        } catch (shiftError) {
          console.error("Error fetching shift details:", shiftError);
        }

        return response.data;
      } else {
        setNotification({
          open: true,
          message: "Les détails de l'opération sont introuvables",
          severity: "warning",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching operation:", error);
      setNotification({
        open: true,
        message:
          "Erreur lors du chargement de l'opération. Veuillez réessayer.",
        severity: "error",
      });
      return null;
    }
  }, [id]);

  // Fetching related entities based on operation data
  const fetchRelatedEntities = useCallback(async (operationData) => {
    if (!operationData) return;

    try {
      // Fetch in parallel for better performance
      const promises = [];

      // Fetch escale data
      if (operationData.id_escale) {
        promises.push(
          EscaleService.getEscaleById(operationData.id_escale)
            .then((response) => setEscale(response.data))
            .catch((error) => {
              console.error("Error fetching escale:", error);
              return null;
            })
        );
      }

      // Fetch shift data
      if (operationData.id_shift) {
        promises.push(
          ShiftService.getShiftById(operationData.id_shift)
            .then((response) => setShift(response.data))
            .catch((error) => {
              console.error("Error fetching shift:", error);
              return null;
            })
        );
      }

      // Fetch engin data - handle comma-separated IDs
      if (operationData.id_engin) {
        promises.push(
          EnginService.getEnginById(operationData.id_engin)
            .then((response) => {
              // If it's multiple items, it will be an array
              if (Array.isArray(response.data)) {
                setEngins(response.data);
              } else {
                // Single item case
                setEngin(response.data);
              }
            })
            .catch((error) => {
              console.error("Error fetching engin:", error);
              return null;
            })
        );
      }

      // Fetch conteneure data - handle comma-separated IDs
      if (operationData.id_conteneure) {
        promises.push(
          ConteneureService.getConteneureById(operationData.id_conteneure)
            .then((response) => {
              // If it's multiple items, it will be an array
              if (Array.isArray(response.data)) {
                setConteneurs(response.data);
              } else {
                // Single item case
                setConteneure(response.data);
              }
            })
            .catch((error) => {
              console.error("Error fetching conteneure:", error);
              return null;
            })
        );
      }

      // Fetch equipe details with personnel and soustraiteurs
      if (operationData.id_equipe) {
        promises.push(
          PersonnelService.getPersonnelByEquipeId(operationData.id_equipe)
            .then((response) => setPersonnel(response.data || []))
            .catch((error) => {
              console.error("Error fetching personnel:", error);
              setPersonnel([]);
              return null;
            })
        );

        promises.push(
          SoustraiteureService.getSoustraiteureByEquipeId(
            operationData.id_equipe
          )
            .then((response) => setSoustraiteurs(response.data || []))
            .catch((error) => {
              console.error("Error fetching soustraiteurs:", error);
              setSoustraiteurs([]);
              return null;
            })
        );
      }

      // Wait for all promises to resolve
      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error fetching related entities:", error);
      setNotification({
        open: true,
        message: "Certaines données associées n'ont pas pu être chargées",
        severity: "warning",
      });
    }
  }, []);

  // Add a function to determine status based on dates
  const determineStatus = useCallback((operationData) => {
    if (!operationData) return "En cours";

    try {
      // Get current date
      const now = new Date();

      // Parse operation dates
      const startDate = operationData.date_debut
        ? new Date(operationData.date_debut)
        : null;
      const endDate = operationData.date_fin
        ? new Date(operationData.date_fin)
        : null;

      // If dates are not available, use the existing status
      if (!startDate || !endDate) {
        return operationData.status || "En cours";
      }

      // Determine status based on dates
      if (startDate > now) {
        return "Planifié"; // Operation is in the future
      } else if (endDate < now) {
        return "Terminé"; // Operation is in the past
      } else {
        return "En cours"; // Operation is current
      }
    } catch (error) {
      console.error("Error determining status:", error);
      return operationData.status || "En cours";
    }
  }, []);

  // Add function to check for active arrêts
  const checkForActiveArrets = useCallback(
    async (operationId) => {
      try {
        const activeArrets = await ArretService.getActiveArretsForOperation(
          operationId
        );
        setActiveArrets(activeArrets);

        // First determine the base status based on dates
        const baseStatus = determineStatus(operationRef.current);

        // If there are active arrêts, update the display status to "En pause"
        if (activeArrets && activeArrets.length > 0) {
          setDisplayStatus("En pause");
        } else {
          // Otherwise, use the status determined by dates
          setDisplayStatus(baseStatus);
        }
        // Mark that we've checked for arrêts
        hasCheckedArretsRef.current = true;
      } catch (error) {
        console.error("Error checking for active arrêts:", error);
        // Default to operation's status if there was an error
        setDisplayStatus(determineStatus(operationRef.current));
        // Mark that we've checked even if there was an error
        hasCheckedArretsRef.current = true;
      }
      // Add determineStatus to the dependency array
    },
    [determineStatus]
  );

  // Update useEffect to call the checkForActiveArrets function only if we haven't already
  useEffect(() => {
    setLoading(true);
    fetchOperation()
      .then((operationData) => {
        if (operationData) {
          // First set an initial status based on dates
          const initialStatus = determineStatus(operationData);
          setDisplayStatus(initialStatus);

          // Then check for active arrêts if we haven't done so already
          if (!hasCheckedArretsRef.current) {
            checkForActiveArrets(operationData.id_operation);
          }
          return fetchRelatedEntities(operationData);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    fetchOperation,
    fetchRelatedEntities,
    checkForActiveArrets,
    determineStatus,
  ]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5);
  };

  // Update getStatusColor function to work with displayStatus
  const getStatusColor = (status) => {
    switch (status) {
      case "Planifié":
        return "info";
      case "En cours":
        return "primary";
      case "Terminé":
        return "success";
      case "En pause":
        return "warning";
      case "Annulé":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!operation) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography>Opération non trouvée</Typography>
          <Button component={Link} to="/operations" startIcon={<ArrowBack />}>
            Retour à la liste
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Opération: {operation.type_operation || "Sans nom"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Chip
              label={displayStatus}
              color={getStatusColor(displayStatus)}
              size="medium"
              sx={{
                fontSize: "1rem",
                py: 0.5,
                fontWeight: "bold",
              }}
            />
            {activeArrets.length > 0 && (
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ display: "inline", ml: 2 }}
              >
                <strong>{activeArrets.length} arrêt(s) actif(s)</strong>
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          component={Link}
          to="/operations"
          variant="outlined"
          startIcon={<ArrowBack />}
        >
          Retour à la liste
        </Button>
      </Box>

      {/* Operation Information Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informations générales
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>ID:</strong> {operation.id_operation}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Type:</strong>{" "}
                {operation.type_operation || "Non spécifié"}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Escale:</strong> {operation.id_escale}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Shift:</strong>{" "}
                {operation.nom_shift || operation.id_shift}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="body1"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <span style={{ marginRight: "8px" }}>
                  <strong>Statut:</strong>
                </span>
                <Chip
                  label={displayStatus}
                  size="small"
                  color={getStatusColor(displayStatus)}
                  sx={{ fontWeight: "medium" }}
                />
                {activeArrets.length > 0 && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ ml: 1 }}
                  >
                    ({activeArrets.length} arrêt(s) actif(s))
                  </Typography>
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Équipe:</strong> {operation.id_equipe}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Date début:</strong> {formatDate(operation.date_debut)}
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <strong>Date fin:</strong> {formatDate(operation.date_fin)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}
        >
          <Button
            component={Link}
            to={`/arret/add/${operation.id_escale}/${operation.id_operation}`}
            variant="contained"
            color="secondary"
          >
            Déclarer un arrêt
          </Button>
          <Button
            component={Link}
            to={`/operations/edit/${id}`}
            variant="contained"
            color="primary"
          >
            Modifier
          </Button>
        </Box>
      </Paper>

      {/* Sub-navigation Tabs */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Escale" />
          <Tab label="Shift" />
          <Tab label="Engin" />
          <Tab label="Conteneure" />
          <Tab label="Personnel" />
          <Tab label="Sous-traitants" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Escale Tab */}
        {activeTab === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Détails de l'Escale</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {escale ? (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nom Navire</TableCell>
                      <TableCell>Date Arrivée</TableCell>
                      <TableCell>Date Sortie</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{escale.num_escale}</TableCell>
                      <TableCell>{escale.nom_navire}</TableCell>
                      <TableCell>{formatDate(escale.date_accostage)}</TableCell>
                      <TableCell>{formatDate(escale.date_sortie)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Aucune information d'escale disponible</Typography>
            )}
          </Box>
        )}

        {/* Shift Tab */}
        {activeTab === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Détails du Shift</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {shift ? (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Date de Début</TableCell>
                      <TableCell>Date de Fin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{shift.id_shift}</TableCell>
                      <TableCell>{shift.nom_shift || "Non spécifié"}</TableCell>
                      <TableCell>{formatTime(shift.heure_debut)}</TableCell>
                      <TableCell>{formatTime(shift.heure_fin)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Aucune information de shift disponible</Typography>
            )}
          </Box>
        )}

        {/* Engin Tab */}
        {activeTab === 2 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Détails des Engins</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {operation && operation.id_engin ? (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operation.id_engin.split(",").map((enginId) => {
                      // Check in the engins array first (from multiple fetch)
                      const enginInfo =
                        engins.find((e) => e.id_engin === enginId.trim()) ||
                        (engin && engin.id_engin === enginId.trim()
                          ? engin
                          : null);

                      return enginInfo ? (
                        <TableRow key={enginId}>
                          <TableCell>{enginInfo.id_engin}</TableCell>
                          <TableCell>
                            {enginInfo.nom_engin || "Non spécifié"}
                          </TableCell>
                          <TableCell>
                            {enginInfo.type_engin || "Non spécifié"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={enginId}>
                          <TableCell>{enginId}</TableCell>
                          <TableCell colSpan={2}>
                            Information d'engin non disponible
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Aucun engin associé à cette opération
              </Alert>
            )}
          </Box>
        )}

        {/* Conteneure Tab */}
        {activeTab === 3 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Détails des Conteneurs</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {operation && operation.id_conteneure ? (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operation.id_conteneure.split(",").map((conteneurId) => {
                      // Check in the conteneurs array first (from multiple fetch)
                      const conteneurInfo =
                        conteneurs.find(
                          (c) => c.id_conteneure === conteneurId.trim()
                        ) ||
                        (conteneure &&
                        conteneure.id_conteneure === conteneurId.trim()
                          ? conteneure
                          : null);

                      return conteneurInfo ? (
                        <TableRow key={conteneurId}>
                          <TableCell>{conteneurInfo.id_conteneure}</TableCell>
                          <TableCell>
                            {conteneurInfo.nom_conteneure || "Non spécifié"}
                          </TableCell>
                          <TableCell>
                            {conteneurInfo.type_conteneure || "Non spécifié"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={conteneurId}>
                          <TableCell>{conteneurId}</TableCell>
                          <TableCell colSpan={2}>
                            Information de conteneur non disponible
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Aucun conteneur associé à cette opération
              </Alert>
            )}
          </Box>
        )}

        {/* Personnel Tab */}
        {activeTab === 4 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Personnel de l'Équipe</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Fonction</TableCell>
                    <TableCell>Contact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {personnel.length > 0 ? (
                    personnel.map((person) => (
                      <TableRow key={person.matricule_personnel}>
                        <TableCell>{person.matricule_personnel}</TableCell>
                        <TableCell>{person.nom_personnel}</TableCell>
                        <TableCell>{person.prenom_personnel}</TableCell>
                        <TableCell>{person.fonction_personnel}</TableCell>
                        <TableCell>
                          {person.contact_personnel || "Non spécifié"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Aucun membre du personnel trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Sous-traiteurs Tab */}
        {activeTab === 5 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Sous-traitants de l'Équipe</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Matricule</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Fonction</TableCell>
                    <TableCell>Entreprise</TableCell>
                    <TableCell>Contact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soustraiteurs.length > 0 ? (
                    soustraiteurs.map((soustraiteur) => (
                      <TableRow key={soustraiteur.matricule_soustraiteure}>
                        <TableCell>
                          {soustraiteur.matricule_soustraiteure}
                        </TableCell>
                        <TableCell>{soustraiteur.nom_soustraiteure}</TableCell>
                        <TableCell>
                          {soustraiteur.prenom_soustraiteure}
                        </TableCell>
                        <TableCell>
                          {soustraiteur.fonction_soustraiteure}
                        </TableCell>
                        <TableCell>
                          {soustraiteur.entreprise_soustraiteure}
                        </TableCell>
                        <TableCell>
                          {soustraiteur.contact_soustraiteure}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Aucun sous-traitant trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
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

export default OperationDetails;
