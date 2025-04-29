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
  Box
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import OperationService from "../../services/OperationService";
import axios from "axios";

const OperationForm = () => {
  const [operation, setOperation] = useState({
    id_shift: "",
    id_escale: "",
    id_conteneure: "",
    id_engin: "",
    id_equipe: "",
    date_debut: "",
    date_fin: ""
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

  // Fetch escales from the EscaleService
  useEffect(() => {
    axios.get('http://localhost:8080/api/escales')
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
      
      // Set operation state
      setOperation({
        id_shift: operationData.id_shift || "",
        id_escale: operationData.id_escale || "",
        id_conteneure: operationData.id_conteneure || "",
        id_engin: operationData.id_engin || "",
        id_equipe: operationData.id_equipe || "",
        date_debut: formatDate(operationData.date_debut) || "",
        date_fin: formatDate(operationData.date_fin) || ""
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
      fetchEquipes()
    ])
    .then(() => {
      // If editing, fetch operation data
      if (id) {
        return fetchOperation();
      }
    })
    .catch(error => {
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
      const response = await axios.get('http://localhost:8080/api/shifts');
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
      const conteneursResponse = await axios.get('http://localhost:8080/api/conteneurs');
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
      const enginsResponse = await axios.get('http://localhost:8080/api/engins');
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
      const equipesResponse = await axios.get('http://localhost:8080/api/equipes');
      console.log("Equipes data:", equipesResponse.data);
      setEquipes(equipesResponse.data || []);
      return equipesResponse.data;
    } catch (error) {
      console.error("Error fetching equipes:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOperation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !operation.id_shift ||
      !operation.id_escale ||
      !operation.id_conteneure ||
      !operation.id_engin ||
      !operation.id_equipe ||
      !operation.date_debut ||
      !operation.date_fin
    ) {
      console.error("All required fields must be filled");
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

    const formattedData = {
      id_shift: operation.id_shift,
      id_escale: operation.id_escale,
      id_conteneure: operation.id_conteneure,
      id_engin: operation.id_engin,
      id_equipe: operation.id_equipe,
      date_debut: operation.date_debut,
      date_fin: operation.date_fin
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
                {shift.id_shift} ({shift.heure_debut} - {shift.heure_fin})
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
            label="Conteneur"
            name="id_conteneure"
            value={operation.id_conteneure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Sélectionner un conteneur</MenuItem>
            {conteneurs.map((conteneur) => (
              <MenuItem key={conteneur.id_conteneure} value={conteneur.id_conteneure}>
                {conteneur.id_conteneure} - {conteneur.nom_conteneure}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Engin"
            name="id_engin"
            value={operation.id_engin}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="">Sélectionner un engin</MenuItem>
            {engins.map((engin) => (
              <MenuItem key={engin.id_engin} value={engin.id_engin}>
                {engin.id_engin} - {engin.nom_engin}
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

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button component={Link} to="/operations" variant="outlined" color="secondary">
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OperationForm; 