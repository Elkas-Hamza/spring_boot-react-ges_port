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
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import OperationService from "../../services/OperationService";
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
  const [operation, setOperation] = useState({
    id_shift: "",
    id_escale: "",
    id_conteneure: [],
    id_engin: [],
    id_equipe: "",
    date_debut: "",
    date_fin: "",
    nom_operation: "",
    status: "En cours",
  });

  const [shifts, setShifts] = useState([]);
  const [escales, setEscales] = useState([]);
  const [conteneurs, setConteneurs] = useState([]);
  const [engins, setEngins] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Add status options
  const statusOptions = [
    { value: 'Planifié', label: 'Planifié' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Terminé', label: 'Terminé' },
    { value: 'En pause', label: 'En pause' },
    { value: 'Annulé', label: 'Annulé' },
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
        if (typeof operationData.id_conteneure === 'string') {
          conteneureIds = operationData.id_conteneure.split(',').map(id => id.trim()).filter(id => id);
        } else if (Array.isArray(operationData.id_conteneure)) {
          conteneureIds = operationData.id_conteneure;
        }
      }

      let enginIds = [];
      if (operationData.id_engin) {
        if (typeof operationData.id_engin === 'string') {
          enginIds = operationData.id_engin.split(',').map(id => id.trim()).filter(id => id);
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
        nom_operation: operationData.nom_operation || "",
        status: operationData.status || "En cours",
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
    if (name === 'id_conteneure' || name === 'id_engin') {
      setOperation((prev) => ({ ...prev, [name]: Array.isArray(value) ? value : [] }));
    } else {
    setOperation((prev) => ({ ...prev, [name]: value }));
    }
    
    // Auto-update status when dates change
    if (name === 'date_debut' || name === 'date_fin') {
      const newDateDebut = name === 'date_debut' ? value : operation.date_debut;
      const newDateFin = name === 'date_fin' ? value : operation.date_fin;
      
      // Only update status if both dates are valid
      if (newDateDebut && newDateFin) {
        const newStatus = determineStatus(newDateDebut, newDateFin);
        setOperation((prev) => ({ ...prev, status: newStatus }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !operation.id_shift ||
      !operation.id_escale ||
      !operation.id_equipe ||
      !operation.date_debut ||
      !operation.date_fin ||
      !operation.nom_operation
    ) {
      console.error("Required fields must be filled");
      setNotification({
        open: true,
        message: "Tous les champs obligatoires doivent être remplis",
        severity: "error",
      });
      return;
    }
    // Check that end datetime is after start datetime
    if (new Date(operation.date_debut) >= new Date(operation.date_fin)) {
      console.error("End time must be after start time");
      setNotification({
        open: true,
        message: "La date/heure de fin doit être après la date/heure de début",
        severity: "error",
      });
      return;
    }
    
    // Determine the status based on dates before submission
    const autoStatus = determineStatus(operation.date_debut, operation.date_fin);
    
    // Convert arrays to comma-separated strings for submission
    const formattedData = {
      id_shift: operation.id_shift,
      id_escale: operation.id_escale,
      id_conteneure: Array.isArray(operation.id_conteneure) ? operation.id_conteneure.join(',') : (operation.id_conteneure || ''),
      id_engin: Array.isArray(operation.id_engin) ? operation.id_engin.join(',') : (operation.id_engin || ''),
      id_equipe: operation.id_equipe,
      date_debut: operation.date_debut,
      date_fin: operation.date_fin,
      nom_operation: operation.nom_operation,
      status: autoStatus, // Use automatically determined status
    };
    
    console.log("Formatted data:", formattedData);
    try {
      if (id) {
        await OperationService.updateOperation(id, formattedData);
        setNotification({
          open: true,
          message: "Opération modifiée avec succès",
          severity: "success",
        });
      } else {
        await OperationService.createOperation(formattedData);
        setNotification({
          open: true,
          message: "Opération ajoutée avec succès",
          severity: "success",
        });
      }
      // Redirect after a short delay
      setTimeout(() => navigate("/operations"), 1000);
    } catch (error) {
      console.error("Error saving operation:", error);
      setNotification({
        open: true,
        message: "Erreur lors de l'enregistrement",
        severity: "error",
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Determine initial status when dates change or component mounts
  useEffect(() => {
    if (operation.date_debut && operation.date_fin) {
      const status = determineStatus(operation.date_debut, operation.date_fin);
      setOperation(prev => ({ ...prev, status }));
    }
  }, [operation.date_debut, operation.date_fin]);
  
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
          {id ? "Modifier Opération" : "Créer Opération"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Nom de l'opération"
            name="nom_operation"
            value={operation.nom_operation}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Shift"
            name="id_shift"
            value={operation.id_shift}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Sélectionner un shift</MenuItem>
            {shifts.map((shift) => (
              <MenuItem key={shift.id_shift} value={shift.id_shift}>
                {shift.nom_shift || shift.id_shift} 
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Escale"
            name="id_escale"
            value={operation.id_escale}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Sélectionner une escale</MenuItem>
            {escales.map((escale) => (
              <MenuItem key={escale.num_escale} value={escale.num_escale}>
                {escale.NOM_navire} (Escale: {escale.num_escale})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Équipe"
            name="id_equipe"
            value={operation.id_equipe}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Sélectionner une équipe</MenuItem>
            {equipes.map((equipe) => (
              <MenuItem key={equipe.id_equipe} value={equipe.id_equipe}>
                {equipe.id_equipe} - {equipe.nom_equipe}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date/Heure de début"
            name="date_debut"
            type="datetime-local"
            value={operation.date_debut}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Date/Heure de fin"
            name="date_fin"
            type="datetime-local"
            value={operation.date_fin}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Statut"
            value={operation.status}
            fullWidth
            margin="normal"
            disabled
            helperText="Le statut est déterminé automatiquement en fonction des dates"
            InputProps={{
              readOnly: true,
            }}
          />
          
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Ressources
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="conteneure-multiple-chip-label">Conteneurs</InputLabel>
            <Select
              labelId="conteneure-multiple-chip-label"
              id="conteneure-multiple-chip"
              multiple
              value={Array.isArray(operation.id_conteneure) ? operation.id_conteneure : []}
              onChange={handleChange}
              name="id_conteneure"
              input={<OutlinedInput id="select-multiple-chip" label="Conteneurs" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Array.isArray(selected) ? selected.map((value) => {
                    const conteneur = conteneurs.find(c => c.id_conteneure === value);
                    return (
                      <Chip 
                        key={value} 
                        label={conteneur ? `${conteneur.id_conteneure} - ${conteneur.nom_conteneure || ''}` : value} 
                      />
                    );
                  }) : null}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {conteneurs.map((conteneur) => (
                <MenuItem key={conteneur.id_conteneure} value={conteneur.id_conteneure}>
                  <Checkbox checked={Array.isArray(operation.id_conteneure) && operation.id_conteneure.indexOf(conteneur.id_conteneure) > -1} />
                  <ListItemText primary={`${conteneur.id_conteneure} - ${conteneur.nom_conteneure || 'Non spécifié'}`} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Sélectionnez un ou plusieurs conteneurs</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="engin-multiple-chip-label">Engins</InputLabel>
            <Select
              labelId="engin-multiple-chip-label"
              id="engin-multiple-chip"
              multiple
              value={Array.isArray(operation.id_engin) ? operation.id_engin : []}
              onChange={handleChange}
              name="id_engin"
              input={<OutlinedInput id="select-multiple-chip" label="Engins" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Array.isArray(selected) ? selected.map((value) => {
                    const engin = engins.find(e => e.id_engin === value);
                    return (
                      <Chip 
                        key={value} 
                        label={engin ? `${engin.id_engin} - ${engin.nom_engin || ''}` : value} 
                      />
                    );
                  }) : null}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {engins.map((engin) => (
                <MenuItem key={engin.id_engin} value={engin.id_engin}>
                  <Checkbox checked={Array.isArray(operation.id_engin) && operation.id_engin.indexOf(engin.id_engin) > -1} />
                  <ListItemText primary={`${engin.id_engin} - ${engin.nom_engin || 'Non spécifié'}`} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Sélectionnez un ou plusieurs engins</FormHelperText>
          </FormControl>
          
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/operations"
              variant="outlined"
              color="secondary"
            >
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {id ? "Mettre à jour" : "Créer"}
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

export default OperationForm;
