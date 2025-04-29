import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Box,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import PersonnelService from "../../services/PersonnelService";

const PersonnelForm = () => {
  const [personnel, setPersonnel] = useState({
    nom_personnel: "",
    prenom_personnel: "",
    fonction_personnel: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { matricule } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matricule) {
      setLoading(true);
      PersonnelService.getPersonnelById(matricule)
        .then((response) => {
          const personnelData = response.data;
          setPersonnel({
            nom_personnel: personnelData.nom_personnel || "",
            prenom_personnel: personnelData.prenom_personnel || "",
            fonction_personnel: personnelData.fonction_personnel || "",
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching personnel:", error);
          setNotification({
            open: true,
            message: "Erreur lors du chargement des données",
            severity: "error",
          });
          setLoading(false);
        });
    }
  }, [matricule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonnel((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !personnel.nom_personnel ||
      !personnel.prenom_personnel ||
      !personnel.fonction_personnel
    ) {
      setNotification({
        open: true,
        message: "Tous les champs sont requis",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      if (matricule) {
        // For updates, we need to reinclude the matricule
        const personnelToUpdate = {
          ...personnel,
          matricule_personnel: matricule,
        };
        await PersonnelService.updatePersonnel(matricule, personnelToUpdate);
        setNotification({
          open: true,
          message: "Personnel modifié avec succès",
          severity: "success",
        });
      } else {
        await PersonnelService.createPersonnel(personnel);
        setNotification({
          open: true,
          message: "Personnel ajouté avec succès",
          severity: "success",
        });
      }
      // Redirect after a short delay
      setTimeout(() => navigate("/personnel"), 1500);
    } catch (error) {
      console.error("Error saving personnel:", error);
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
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {matricule ? "Modifier Personnel" : "Ajouter Personnel"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {matricule && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Matricule: {matricule}
            </Alert>
          )}

          <TextField
            label="Nom"
            name="nom_personnel"
            value={personnel.nom_personnel}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Prénom"
            name="prenom_personnel"
            value={personnel.prenom_personnel}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Fonction"
            name="fonction_personnel"
            value={personnel.fonction_personnel}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/personnel"
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

export default PersonnelForm;
