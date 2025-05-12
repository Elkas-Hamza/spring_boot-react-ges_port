import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Snackbar,
  MenuItem,
  CircularProgress,
  Paper,
  Box,
  Select,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  ListItemText,
  Checkbox,
  FormHelperText,
  Divider,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import OperationService from "../../services/OperationService";
import ConteneureService from "../../services/ConteneureService";
import { NavireService } from "../../services/NavireService";
import axiosInstance from "../../services/AxiosConfig";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const OperationForm = () => {
  const theme = useTheme();
  const [operation, setOperation] = useState({
    id_shift: "",
    id_escale: "",
    id_conteneure: [],
    id_engin: [],
    id_equipe: "",
    date_debut: "",
    date_fin: "",
    status: "En cours",
    type_operation: "AUTRE", // Renamed from operationType to type_operation
  });

  const [shifts, setShifts] = useState([]);
  const [escales, setEscales] = useState([]);
  const [conteneurs, setConteneurs] = useState([]);
  const [portContainers, setPortContainers] = useState([]);
  const [shipContainers, setShipContainers] = useState([]);
  const [engins, setEngins] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNavireId, setSelectedNavireId] = useState([]);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Add status options
  const statusOptions = [
    { value: "Planifié", label: "Planifié" },
    { value: "En cours", label: "En cours" },
    { value: "Terminé", label: "Terminé" },
    { value: "En pause", label: "En pause" },
    { value: "Annulé", label: "Annulé" },
  ];

  // Operation types
  const operationTypes = [
    {
      value: "CHARGEMENT",
      label: "Chargement de conteneurs",
      color: theme.palette.success.light,
    },
    {
      value: "DECHARGEMENT",
      label: "Déchargement de conteneurs",
      color: theme.palette.info.light,
    },
    {
      value: "AUTRE",
      label: "Autre opération",
      color: theme.palette.grey[300],
    },
  ];

  // Fetch escales from the EscaleService
  useEffect(() => {
    axiosInstance
      .get("/escales")
      .then((response) => {
        console.log("Escales data:", response.data);
        setEscales(response.data);
      })
      .catch((error) => {
        console.error("Error fetching escales:", error);
      });
  }, []);

  // Fetch ships
  useEffect(() => {
    NavireService.getAllNavires()
      .then((response) => {
        if (response.success) {
          // Remove or comment out any usage of setNavires in the file
        }
      })
      .catch((error) => {
        console.error("Error fetching ships:", error);
      });
  }, []);

  // Fetch containers based on operation type
  useEffect(() => {
    if (operation.type_operation === "CHARGEMENT") {
      // For loading operations, we need port containers
      ConteneureService.getPortContainers()
        .then((response) => {
          setPortContainers(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching port containers:", error);
        });
    } else if (
      operation.type_operation === "DECHARGEMENT" &&
      selectedNavireId
    ) {
      // For unloading operations, we need ship containers
      ConteneureService.getShipContainers(selectedNavireId)
        .then((response) => {
          setShipContainers(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching ship containers:", error);
        });
    }
  }, [operation.type_operation, selectedNavireId]);

  // Get ship ID when escale changes
  useEffect(() => {
    if (operation.id_escale) {
      const selectedEscale = escales.find(
        (escale) => escale.num_escale === operation.id_escale
      );
      if (selectedEscale && selectedEscale.navire) {
        setSelectedNavireId(selectedEscale.navire.idNavire);
      }
    }
  }, [operation.id_escale, escales]);

  const fetchOperation = useCallback(async () => {
    try {
      const response = await OperationService.getOperationById(id);
      const operationData = response.data;

      // Format dates for the form
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      };

      // Convert string IDs to arrays for multi-select fields
      let conteneureIds = [];
      if (operationData.id_conteneure) {
        if (typeof operationData.id_conteneure === "string") {
          conteneureIds = operationData.id_conteneure
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
        } else if (Array.isArray(operationData.id_conteneure)) {
          conteneureIds = operationData.id_conteneure;
        }
      }

      let enginIds = [];
      if (operationData.id_engin) {
        if (typeof operationData.id_engin === "string") {
          enginIds = operationData.id_engin
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
        } else if (Array.isArray(operationData.id_engin)) {
          enginIds = operationData.id_engin;
        }
      }

      // Set operation state
      setOperation({
        id_shift: operationData.id_shift || "",
        id_escale: operationData.id_escale || "",
        id_conteneure: conteneureIds,
        id_engin: enginIds,
        id_equipe: operationData.id_equipe || "",
        date_debut: formatDate(operationData.date_debut) || "",
        date_fin: formatDate(operationData.date_fin) || "",
        status: operationData.status || "En cours",
        type_operation: operationData.type_operation || "AUTRE", // Updated from operationType
      });
    } catch (error) {
      console.error("Error fetching operation:", error);
      setNotification({
        open: true,
        message: "Erreur lors du chargement de l'opération",
        severity: "error",
      });
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    // Load all needed data in parallel
    Promise.all([
      fetchShifts(),
      fetchConteneurs(),
      fetchEngins(),
      fetchEquipes(),
    ])
      .then(() => {
        // If editing, fetch operation data
        if (id) {
          return fetchOperation();
        }
      })
      .catch((error) => {
        console.error("Error loading form data:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des données du formulaire",
          severity: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, fetchOperation]);

  const fetchShifts = async () => {
    try {
      const response = await axiosInstance.get("/shifts");
      console.log("Shifts data:", response.data);
      setShifts(response.data || []);
      return response.data;
    } catch (error) {
      console.error("Error fetching shifts:", error);
      return [];
    }
  };

  const fetchConteneurs = async () => {
    try {
      const conteneursResponse = await axiosInstance.get("/conteneurs");
      console.log("Conteneurs data:", conteneursResponse.data);
      setConteneurs(conteneursResponse.data || []);
      return conteneursResponse.data;
    } catch (error) {
      console.error("Error fetching conteneurs:", error);
      return [];
    }
  };
  const fetchEngins = async () => {
    try {
      const enginsResponse = await axiosInstance.get("/engins");
      console.log("Engins data:", enginsResponse.data);
      setEngins(enginsResponse.data || []);
      return enginsResponse.data;
    } catch (error) {
      console.error("Error fetching engins:", error);
      return [];
    }
  };
  const fetchEquipes = async () => {
    try {
      const equipesResponse = await axiosInstance.get("/equipes");
      console.log("Equipes data:", equipesResponse.data);
      setEquipes(equipesResponse.data || []);
      return equipesResponse.data;
    } catch (error) {
      console.error("Error fetching equipes:", error);
      return [];
    }
  };

  // Add a function to determine status based on dates
  const determineStatus = (dateDebut, dateFin) => {
    const now = new Date();
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);

    if (!dateDebut || !dateFin) return "En cours"; // Default if dates not set

    if (startDate > now) {
      return "Planifié"; // Future operation
    } else if (endDate < now) {
      return "Terminé"; // Past operation
    } else {
      return "En cours"; // Current operation
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure that multiple select values are always arrays
    if (name === "id_conteneure" || name === "id_engin") {
      setOperation((prev) => ({
        ...prev,
        [name]: Array.isArray(value) ? value : [],
      }));
    } else {
      setOperation((prev) => ({ ...prev, [name]: value }));
    }

    // Auto-update status when dates change
    if (name === "date_debut" || name === "date_fin") {
      const newDateDebut = name === "date_debut" ? value : operation.date_debut;
      const newDateFin = name === "date_fin" ? value : operation.date_fin;

      // Only update status if both dates are valid
      if (newDateDebut && newDateFin) {
        const newStatus = determineStatus(newDateDebut, newDateFin);
        setOperation((prev) => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission
      const operationData = {
        ...operation,
        // Ensure arrays are joined as strings for the backend
        id_conteneure: Array.isArray(operation.id_conteneure)
          ? operation.id_conteneure.join(",")
          : operation.id_conteneure,
        id_engin: Array.isArray(operation.id_engin)
          ? operation.id_engin.join(",")
          : operation.id_engin,
      };

      let response;

      if (id) {
        // Update existing operation
        response = await OperationService.updateOperation(id, operationData);
      } else {
        // Create new operation
        response = await OperationService.createOperation(operationData);
      }

      // If this is a container operation, process the containers
      if (
        response.data &&
        (operation.type_operation === "CHARGEMENT" ||
          operation.type_operation === "DECHARGEMENT")
      ) {
        const containerIds = Array.isArray(operation.id_conteneure)
          ? operation.id_conteneure
          : [];

        if (containerIds.length > 0) {
          if (operation.type_operation === "CHARGEMENT") {
            // For loading, assign containers to ship
            await Promise.all(
              containerIds.map((containerId) =>
                ConteneureService.assignContainerToShip(
                  containerId,
                  selectedNavireId
                )
              )
            );
          } else if (operation.type_operation === "DECHARGEMENT") {
            // For unloading, unassign containers from ship
            await Promise.all(
              containerIds.map((containerId) =>
                ConteneureService.unassignContainerFromShip(containerId)
              )
            );
          }
        }
      }

      setNotification({
        open: true,
        message: id
          ? "Opération mise à jour avec succès!"
          : "Opération créée avec succès!",
        severity: "success",
      });

      // Navigate to operations list after successful creation/update
      setTimeout(() => {
        navigate("/operations");
      }, 2000);
    } catch (error) {
      console.error("Error submitting operation:", error);
      setNotification({
        open: true,
        message: `Erreur: ${
          error.response?.data?.message || "Une erreur est survenue"
        }`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Get containers based on operation type
  const getContainersForSelection = () => {
    if (operation.type_operation === "CHARGEMENT") {
      return portContainers;
    } else if (operation.type_operation === "DECHARGEMENT") {
      return shipContainers;
    } else {
      return conteneurs;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    );
  }

  // Get background color based on operation type
  const getOperationTypeColor = () => {
    const selectedType = operationTypes.find(
      (type) => type.value === operation.type_operation
    );
    return selectedType ? selectedType.color : theme.palette.grey[200];
  };

  // Get chip color for status
  const getStatusColor = (status) => {
    switch (status) {
      case "Planifié":
        return theme.palette.info.main;
      case "En cours":
        return theme.palette.warning.main;
      case "Terminé":
        return theme.palette.success.main;
      case "En pause":
        return theme.palette.grey[500];
      case "Annulé":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          borderTop: `4px solid ${getOperationTypeColor()}`,
          transition: "all 0.3s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="500"
            color="primary"
          >
            {id ? "Modifier l'opération" : "Nouvelle opération"}
          </Typography>
          <Chip
            label={operation.status}
            color="default"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              bgcolor: getStatusColor(operation.status),
              color: "white",
              px: 1,
            }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Type d'opération</InputLabel>
                <Select
                  name="type_operation"
                  value={operation.type_operation}
                  onChange={handleChange}
                  label="Type d'opération"
                >
                  {operationTypes.map((type) => (
                    <MenuItem
                      key={type.value}
                      value={type.value}
                      sx={{
                        borderLeft: `4px solid ${type.color}`,
                        "&.Mui-selected": {
                          bgcolor: `${type.color}40`,
                        },
                      }}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-1">
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Escale</InputLabel>
                <Select
                  name="id_escale"
                  value={operation.id_escale}
                  onChange={handleChange}
                  label="Escale"
                  required
                >
                  {escales.map((escale) => (
                    <MenuItem key={escale.num_escale} value={escale.num_escale}>
                      {escale.num_escale} - {escale.NOM_navire}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-1">
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Shift</InputLabel>
                <Select
                  name="id_shift"
                  value={operation.id_shift}
                  onChange={handleChange}
                  label="Shift"
                >
                  <MenuItem value="">
                    <em>Aucun</em>
                  </MenuItem>
                  {shifts.map((shift) => (
                    <MenuItem key={shift.ID_shift} value={shift.ID_shift}>
                      {shift.NOM_shift} ({shift.HEURE_debut} - {shift.HEURE_fin}
                      )
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-1">
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Equipe</InputLabel>
                <Select
                  name="id_equipe"
                  value={operation.id_equipe}
                  onChange={handleChange}
                  label="Equipe"
                  required
                >
                  {equipes.map((equipe) => (
                    <MenuItem key={equipe.ID_equipe} value={equipe.ID_equipe}>
                      {equipe.NOM_equipe}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-1">
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={operation.status}
                  onChange={handleChange}
                  label="Statut"
                >
                  {statusOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{
                        borderLeft: `4px solid ${getStatusColor(option.value)}`,
                        "&.Mui-selected": {
                          bgcolor: `${getStatusColor(option.value)}20`,
                        },
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-1">
              <TextField
                fullWidth
                label="Date de début"
                type="datetime-local"
                name="date_debut"
                value={operation.date_debut}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                required
                sx={{ mb: 1 }}
              />
            </div>

            <div className="col-span-1">
              <TextField
                fullWidth
                label="Date de fin"
                type="datetime-local"
                name="date_fin"
                value={operation.date_fin}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                required
                sx={{ mb: 1 }}
              />
            </div>

            {/* Container section with title */}
            {(operation.type_operation === "CHARGEMENT" ||
              operation.type_operation === "DECHARGEMENT" ||
              operation.type_operation === "AUTRE") && (
              <div className="col-span-1 md:col-span-2">
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {operation.type_operation === "CHARGEMENT"
                      ? "📦 Conteneurs à charger"
                      : operation.type_operation === "DECHARGEMENT"
                      ? "📥 Conteneurs à décharger"
                      : "📦 Sélection des conteneurs"}
                  </Typography>
                  <Divider />
                </Box>
              </div>
            )}

            {/* Container selection based on operation type */}
            {(operation.type_operation === "CHARGEMENT" ||
              operation.type_operation === "DECHARGEMENT") && (
              <div className="col-span-1 md:col-span-2">
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>
                    {operation.type_operation === "CHARGEMENT"
                      ? "Conteneurs à charger"
                      : "Conteneurs à décharger"}
                  </InputLabel>
                  <Select
                    multiple
                    name="id_conteneure"
                    value={operation.id_conteneure}
                    onChange={handleChange}
                    input={
                      <OutlinedInput
                        label={
                          operation.type_operation === "CHARGEMENT"
                            ? "Conteneurs à charger"
                            : "Conteneurs à décharger"
                        }
                      />
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const container = getContainersForSelection().find(
                            (c) => c.id_conteneure === value
                          );
                          return (
                            <Chip
                              key={value}
                              label={
                                container
                                  ? `${container.id_conteneure} - ${container.nom_conteneure}`
                                  : value
                              }
                              sx={{
                                bgcolor:
                                  operation.type_operation === "CHARGEMENT"
                                    ? theme.palette.success.light
                                    : theme.palette.info.light,
                                color: "white",
                                fontWeight: 500,
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {getContainersForSelection().map((container) => (
                      <MenuItem
                        key={container.id_conteneure}
                        value={container.id_conteneure}
                      >
                        <Checkbox
                          checked={
                            operation.id_conteneure.indexOf(
                              container.id_conteneure
                            ) > -1
                          }
                        />
                        <ListItemText
                          primary={`${container.id_conteneure} - ${container.nom_conteneure}`}
                          secondary={
                            container.typeConteneur
                              ? container.typeConteneur.nomType
                              : ""
                          }
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {getContainersForSelection().length === 0 && (
                    <FormHelperText sx={{ color: theme.palette.warning.main }}>
                      {operation.type_operation === "CHARGEMENT"
                        ? "Aucun conteneur disponible au port"
                        : operation.id_escale
                        ? "Aucun conteneur disponible sur ce navire"
                        : "Veuillez d'abord sélectionner une escale"}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
            )}

            {/* Standard container selection for non-specific operations */}
            {operation.type_operation === "AUTRE" && (
              <div className="col-span-1 md:col-span-2">
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Conteneurs</InputLabel>
                  <Select
                    multiple
                    name="id_conteneure"
                    value={operation.id_conteneure}
                    onChange={handleChange}
                    input={<OutlinedInput label="Conteneurs" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const container = conteneurs.find(
                            (c) => c.id_conteneure === value
                          );
                          return (
                            <Chip
                              key={value}
                              label={
                                container
                                  ? `${container.id_conteneure} - ${container.nom_conteneure}`
                                  : value
                              }
                              sx={{ bgcolor: theme.palette.grey[300] }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {conteneurs.map((container) => (
                      <MenuItem
                        key={container.id_conteneure}
                        value={container.id_conteneure}
                      >
                        <Checkbox
                          checked={
                            operation.id_conteneure.indexOf(
                              container.id_conteneure
                            ) > -1
                          }
                        />
                        <ListItemText
                          primary={`${container.id_conteneure} - ${container.nom_conteneure}`}
                          secondary={
                            container.typeConteneur
                              ? container.typeConteneur.nomType
                              : ""
                          }
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            {/* Equipment section with title */}
            <div className="col-span-1 md:col-span-2">
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  🚜 Équipement
                </Typography>
                <Divider />
              </Box>
            </div>

            <div className="col-span-1 md:col-span-2">
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Engins</InputLabel>
                <Select
                  multiple
                  name="id_engin"
                  value={operation.id_engin}
                  onChange={handleChange}
                  input={<OutlinedInput label="Engins" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const engin = engins.find((e) => e.ID_engin === value);
                        return (
                          <Chip
                            key={value}
                            label={
                              engin
                                ? `${engin.ID_engin} - ${engin.NOM_engin}`
                                : value
                            }
                            sx={{
                              bgcolor: theme.palette.secondary.light,
                              color: "white",
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {engins.map((engin) => (
                    <MenuItem key={engin.ID_engin} value={engin.ID_engin}>
                      <Checkbox
                        checked={
                          operation.id_engin.indexOf(engin.ID_engin) > -1
                        }
                      />
                      <ListItemText
                        primary={`${engin.ID_engin} - ${engin.NOM_engin}`}
                        secondary={engin.TYPE_engin}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between mt-8">
                <Button
                  component={Link}
                  to="/operations"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  size="large"
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : id ? (
                    "Mettre à jour"
                  ) : (
                    "Créer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%", boxShadow: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OperationForm;
