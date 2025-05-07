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
import SoustraiteureService from "../../services/SoustraiteureService";

const SoustraiteureForm = () => {
  const [soustraiteure, setSoustraiteure] = useState({
    nom_soustraiteure: "",
    prenom_soustraiteure: "",
    fonction_soustraiteure: "",
    contact_soustraiteure: "",
    entreprise_soustraiteure: "",
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
      SoustraiteureService.getSoustraiteureById(matricule)
        .then((response) => {
          const soustraiteureData = response.data;
          setSoustraiteure({
            nom_soustraiteure: soustraiteureData.nom_soustraiteure || "",
            prenom_soustraiteure: soustraiteureData.prenom_soustraiteure || "",
            fonction_soustraiteure:
              soustraiteureData.fonction_soustraiteure || "",
            contact_soustraiteure: soustraiteureData.contact_soustraiteure || "",
            entreprise_soustraiteure: soustraiteureData.entreprise_soustraiteure || "",
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching soustraiteure:", error);
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
    setSoustraiteure((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !soustraiteure.nom_soustraiteure ||
      !soustraiteure.prenom_soustraiteure ||
      !soustraiteure.fonction_soustraiteure
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
        const soustraiteureToUpdate = {
          ...soustraiteure,
          matricule_soustraiteure: matricule,
        };
        await SoustraiteureService.updateSoustraiteure(
          matricule,
          soustraiteureToUpdate
        );
        setNotification({
          open: true,
          message: "Soustraiteure modifié avec succès",
          severity: "success",
        });
      } else {
        await SoustraiteureService.createSoustraiteure(soustraiteure);
        setNotification({
          open: true,
          message: "Soustraiteure ajouté avec succès",
          severity: "success",
        });
      }
      // Redirect after a short delay
      setTimeout(() => navigate("/soustraiteure"), 1500);
    } catch (error) {
      console.error("Error saving soustraiteure:", error);
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
          {matricule ? "Modifier Soustraiteure" : "Ajouter Soustraiteure"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {matricule && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Matricule: {matricule}
            </Alert>
          )}

          <TextField
            label="Nom"
            name="nom_soustraiteure"
            value={soustraiteure.nom_soustraiteure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Prénom"
            name="prenom_soustraiteure"
            value={soustraiteure.prenom_soustraiteure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Fonction"
            name="fonction_soustraiteure"
            value={soustraiteure.fonction_soustraiteure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Contact"
            name="contact_soustraiteure"
            value={soustraiteure.contact_soustraiteure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="Téléphone ou Email"
          />

          <TextField
            label="Entreprise"
            name="entreprise_soustraiteure"
            value={soustraiteure.entreprise_soustraiteure}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="Nom de l'entreprise"
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              component={Link}
              to="/soustraiteure"
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

export default SoustraiteureForm;
