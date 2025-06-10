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
    type_operation: "AUTRE",
  });

  const [shifts, setShifts] = useState([]);
  const [escales, setEscales] = useState([]);
  const [conteneurs, setConteneurs] = useState([]);
  const [portContainers, setPortContainers] = useState([]);
  const [shipContainers, setShipContainers] = useState([]);
  const [engins, setEngins] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNavireId, setSelectedNavireId] = useState("");

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
  }, []);  // Fetch containers based on operation type
  useEffect(() => {
    console.log("Container fetch effect triggered:", {
      operationType: operation.type_operation,
      selectedNavireId,
      selectedNavireIdType: typeof selectedNavireId,
    });

    if (operation.type_operation === "CHARGEMENT") {
      console.log("Fetching port containers for CHARGEMENT operation");
      // For loading operations, we need port containers
      ConteneureService.getPortContainers()
        .then((response) => {
          console.log("Port containers fetched:", response.data);
          setPortContainers(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching port containers:", error);
        });
    } else if (
      operation.type_operation === "DECHARGEMENT" &&
      selectedNavireId &&
      typeof selectedNavireId === "string" &&
      selectedNavireId.trim() !== ""
    ) {
      console.log("Fetching ship containers for DECHARGEMENT operation, shipId:", selectedNavireId);
      // For unloading operations, we need ship containers
      // Only call if selectedNavireId is not empty
      ConteneureService.getShipContainers(selectedNavireId)
        .then((response) => {
          console.log("Ship containers fetched:", response.data);
          setShipContainers(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching ship containers:", error);
          setShipContainers([]);
        });
    } else if (
      operation.type_operation === "DECHARGEMENT" &&
      !selectedNavireId
    ) {
      console.log("DECHARGEMENT selected but no navire ID - clearing ship containers");
      // Clear ship containers if no navire is selected
      setShipContainers([]);
    }
  }, [operation.type_operation, selectedNavireId]);  // Get ship ID when escale changes
  useEffect(() => {
    if (operation.id_escale) {
      console.log("Looking for escale:", operation.id_escale);
      console.log("Available escales:", escales);
      
      const selectedEscale = escales.find(
        (escale) => escale.num_escale === operation.id_escale
      );
      
      console.log("Found escale:", selectedEscale);
      
      if (selectedEscale) {
        // The escale has matricule_navire and nom_navire fields
        // We need to find the navire by matricule and get its ID
        if (selectedEscale.matricule_navire) {
          console.log("Found matricule_navire in escale:", selectedEscale.matricule_navire);
          
          // Fetch the navire using the matricule to get the actual navire ID
          NavireService.getAllNavires()
            .then((response) => {
              if (response.success && response.data) {
                console.log("Available navires:", response.data);
                
                const matchingNavire = response.data.find(
                  (navire) => navire.matriculeNavire === selectedEscale.matricule_navire
                );
                
                console.log("Found matching navire:", matchingNavire);
                
                if (matchingNavire) {
                  console.log("Setting selectedNavireId to:", matchingNavire.idNavire);
                  setSelectedNavireId(matchingNavire.idNavire);
                } else {
                  console.warn("No navire found with matricule:", selectedEscale.matricule_navire);
                  setSelectedNavireId("");
                }
              } else {
                console.error("Failed to fetch navires:", response);
                setSelectedNavireId("");
              }
            })
            .catch((error) => {
              console.error("Error fetching navires:", error);
              setSelectedNavireId("");
            });
        } else {
          console.warn("No matricule_navire found in escale:", selectedEscale);
          setSelectedNavireId("");
        }
      } else {
        console.warn("Escale not found for id:", operation.id_escale);
        setSelectedNavireId("");
      }
    } else {
      setSelectedNavireId("");
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
                    <MenuItem key={shift.id_shift} value={shift.id_shift}>
                      {shift.nom_shift} ({shift.heure_debut} - {shift.heure_fin}
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
                  {" "}
                  {equipes.map((equipe) => (
                    <MenuItem key={equipe.id_equipe} value={equipe.id_equipe}>
                      {equipe.nom_equipe}
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
            </div>            {/* Container section with title */}
            {(operation.type_operation === "CHARGEMENT" ||
              operation.type_operation === "DECHARGEMENT" ||
              operation.type_operation === "AUTRE") && (
              <div className="col-span-1 md:col-span-2">
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {operation.type_operation === "CHARGEMENT"
                      ? "📦 Conteneurs à charger"
                      : operation.type_operation === "DECHARGEMENT"
                      ? `📥 Conteneurs à décharger ${selectedNavireId ? `(Navire: ${selectedNavireId})` : '(Navire non défini)'}`
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
                  </Select>                  {getContainersForSelection().length === 0 && (
                    <FormHelperText sx={{ color: theme.palette.warning.main }}>
                      {operation.type_operation === "CHARGEMENT"
                        ? "Aucun conteneur disponible au port"
                        : operation.type_operation === "DECHARGEMENT"
                        ? operation.id_escale 
                          ? selectedNavireId
                            ? "Aucun conteneur disponible sur ce navire"
                            : "Navire non trouvé pour cette escale"
                          : "Veuillez d'abord sélectionner une escale"
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
                        const engin = engins.find((e) => e.id_engin === value);
                        return (
                          <Chip
                            key={value}
                            label={
                              engin
                                ? `${engin.id_engin} - ${engin.nom_engin}`
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
                    <MenuItem key={engin.id_engin} value={engin.id_engin}>
                      <Checkbox
                        checked={
                          operation.id_engin.indexOf(engin.id_engin) > -1
                        }
                      />
                      <ListItemText
                        primary={`${engin.id_engin} - ${engin.nom_engin}`}
                        secondary={engin.type_engin}
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
